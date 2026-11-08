# DJDN — Security, Payment, Resilience, Accessibility & Performance Audit

**Audited:** read-only pass over the working tree on the `master` branch. No source files were modified; the only file produced is this report.

## Executive summary

**Totals: 0 CRITICAL · 0 HIGH · 4 MEDIUM · 16 LOW · 4 OK/BY-DESIGN · 3 NOT BUILT.**

The most important single thing to understand about this audit is that **the money path is not built yet.** Flutterwave is declared in `.env.example` but has no dependency, no checkout backend, no order-creation code, and no webhook. The "Continue to payment" button is honest about this — it says nothing is charged. That is *correct behaviour* for the current state, and it means the most dangerous class of bug ("server trusts a client-supplied amount") simply cannot occur yet. When checkout is wired up, the `docs/03-audit.md` "what it must do" checklist in Area 2 is the contract it must satisfy before real money flows.

The parts that **are** built are, on the whole, in good shape: money is stored as integer kobo everywhere and only formatted for display in one place (`lib/format.ts`); no secret has ever been committed to git; the Supabase orders schema has correct row-level security; the cart stores only `slug|colour|size|qty` and re-reads prices from the catalogue rather than trusting stored prices. The concrete issues found are mostly small — the notable ones are a cart that can crash every page if `localStorage` holds a non-array value, a total absence of security headers, and a handful of accessibility gaps (no skip link, no focus trap in the mobile menu, orange used at a contrast ratio that would fail if it ever becomes body text).

The single thing to fix first is **hardening the cart read against malformed storage** (Area 3, finding 3.1) — it's a three-line change that prevents a single bad value in `localStorage` from taking down every page on the site.

---

## Area 1 — Secrets, environment variables, and repo hygiene

**Verdict: Safe.** One LOW note.

### [OK / BY DESIGN] No secrets committed; env files correctly ignored

**Type:** OK / By design
**Where:** `.gitignore` (line 34), `.env.example` (lines 1–23)

```gitignore
# env files (can opt-in for committing if needed)
.env*
!.env.example
```

`.env*` is ignored, with `.env.example` explicitly un-ignored. I verified the git history:

```text
$ git log --all --name-only -- ".env*"
COMMIT 7244144 ... 
.env.example
COMMIT a92d111 ...
.env.example
```

Only `.env.example` (no values) has ever been tracked — `git ls-files ".env*"` returns only `.env.example`. No real `.env`/`.env.local` was ever committed. A key committed once is compromised; that did not happen here.

### [OK / BY DESIGN] Flutterwave secret keys are declared server-only

**Type:** OK / By design
**Where:** `.env.example` (lines 19–23)

```dotenv
# --- Flutterwave (checkout — wired up in a later step, keep in test mode) ---
NEXT_PUBLIC_FLW_PUBLIC_KEY=
FLW_SECRET_KEY=
FLW_ENCRYPTION_KEY=
FLW_WEBHOOK_SECRET_HASH=
```

The public key is `NEXT_PUBLIC_` (browser), and the secret key, encryption key, and webhook secret hash are plain `FLW_*` (server-only). That is the correct split. I searched the tree for `FLWSECK`, `FLWPUBK`, `sk_live`, `sk_test`, `service_role`, `Bearer `, and `token=` — the only `process.env.*` reads in the codebase are the six shown below, none of which is a secret. No hardcoded keys exist anywhere.

### [LOW] `metadataBase` is hardcoded to the production origin

**Type:** Bug (minor)
**Where:** `app/layout.tsx` (line 29)

```tsx
export const metadata: Metadata = {
  metadataBase: new URL("https://djdn.com"),
```

**The problem:** The canonical base URL is hardcoded rather than read from an env var, so any preview/staging deploy will emit `https://djdn.com` as the canonical URL, `og:` URL, and sitemap origin. Not a security hole, but wrong in non-prod.

**Real-world consequence:** A staging deploy points canonical/OG tags at production; shared links resolve to the wrong place.

**Fix:** read it from env with a fallback:

```tsx
metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://djdn.com"),
```

---

## Area 2 — Payment integrity (Flutterwave)

**Verdict: NOT BUILT.** This is the single most important area, and none of it exists yet. There is no `flw`/`flutterwave` dependency in `package.json`, no `<Script>` loading the Flutterwave inline JS, no checkout API route, no verify-transaction call, and no webhook handler. The checkout button is correctly inert.

### [NOT BUILT] Checkout, payment, verification, and webhook

**Type:** Not built
**Where:** `components/checkout-view.tsx` (lines 238–241, 309–325), `components/cart-view.tsx` (lines 131–137)

```tsx
{/* checkout-view.tsx */}
<p className="mt-6 max-w-md font-sans text-sm leading-relaxed text-ink-muted">
  You&rsquo;ll pay securely on the next step, by card, bank transfer
  or USSD. We never see or store your card details.
</p>
...
{submitted
  ? "Payment isn't switched on yet, so nothing has been charged. Your details are valid and ready."
  : ...}
```

The money model **is already correct where it counts**, and this should be preserved when payment is wired up:

- **Money is integer kobo everywhere.** `sanity/schemaTypes/product.ts` (line 78) validates `rule.required().integer().positive().min(1)`, and the catalogue stores whole kobo (`lib/catalogue.ts` line 63: `price: 5200000` = ₦52,000). The only conversion is display-only, in one place.
- **The cart stores no prices** — only `slug`, `colour`, `size`, `qty` (`components/cart-provider.tsx` lines 17–22), and the cart/checkout views re-read prices from the catalogue (`components/checkout-view.tsx` lines 61–72). This is exactly the correct pattern: the client never supplies an amount.
- **The orders schema already anticipates the Flutterwave flow** — `supabase/schema.sql` line 36 declares `flw_tx_ref text unique` and line 37 `flw_transaction_id text`, with `total integer` in kobo.

When checkout is built, it **must** satisfy this checklist. Do not ship payment until each item is true:

1. **Server decides the amount.** The client sends only `{ slug, colour, size, qty }` per line. A server route/action re-fetches prices from the source of truth (Sanity, once connected) and computes `subtotal` + `shipping_fee` + `total` in kobo server-side. Never accept `amount`/`total` from the request body.
2. **Kobo → naira conversion.** Flutterwave's `amount` field is the **major unit** (naira), so the server must divide kobo by 100 exactly (`totalNaira = totalKobo / 100`) when building the `charge` request — and only there. Keep kobo as the stored/calculated type everywhere else. The existing `formatNaira` (divide-by-100 for display) is the right separation; the payment request needs its own explicit conversion, not a reuse of the display helper.
3. **Pending order before payment.** Insert a `pending` order (and `order_items` with `unit_price` captured in kobo) *before* redirecting to Flutterwave. Then `tx_ref` = the order's `flw_tx_ref`, generated server-side and unique per attempt (e.g. `crypto.randomUUID()`), never a guessable or reused value.
4. **Verify server-side, never trust the redirect.** On `status=successful` return, call Flutterwave's verify-transaction endpoint with the `tx_ref` and confirm all of: `status === "successful"`, the returned `amount` matches the order total in naira, `currency === "NGN"`, and the `tx_ref` matches the pending order. Only then flip `payment_status` to `paid`. The URL query param is untrusted.
5. **Webhook idempotency + hash check.** Compare the incoming `verif-hash` header to `FLW_WEBHOOK_SECRET_HASH` with a constant-time comparison (`crypto.timingSafeEqual` over equal-length buffers). The webhook must be idempotent — a duplicate event must not double-create or double-email. Handle the webhook arriving *before* the redirect, or *never* arriving (a "paid at gateway but still `pending`" reconciliation job).
6. **Double-submit guard.** Disable the pay button and guard server-side (reject a second `tx_ref` generation for the same order) so a double-click can't open two sessions.

---

## Area 3 — Cart state and race conditions

**Verdict: 1 MEDIUM, 3 LOW.** Hydration and stale-price handling are correct; storage validation and cross-tab sync are not.

### [MEDIUM] A non-array value in `localStorage` crashes every page

**Type:** Bug
**Where:** `components/cart-provider.tsx` (lines 61–69, 115–123)

```tsx
useEffect(() => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) setItems(JSON.parse(stored) as CartItem[]);
  } catch {
    // Storage can be blocked or corrupt; start with an empty cart.
  }
  setLoaded(true);
}, []);
```

**The problem:** The `try/catch` only guards against *syntax* errors from `JSON.parse`. It does **not** validate that the parsed value is an array. `localStorage` is attacker-adjacent and can hold anything: `"null"` parses to `null`, `"hello"` to a string, `"{}"` to an object, `"[{}]"` to an array of empty objects. On the next render, `count: items.reduce(...)` (line 118) throws `items.reduce is not a function`, and because `CartProvider` wraps every storefront page (`app/(site)/layout.tsx` line 8), **every page on the site throws**, not just the cart.

**Real-world consequence:** A single stale/hand-edited `djdn-cart` value (a prior schema version, a user poking in devtools, a shared machine) makes the entire storefront white-screen until the user clears storage. A user cannot even reach a page with a "clear cart" button.

**Fix:** validate the shape before committing it to state, and sanitize individual fields:

```tsx
useEffect(() => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      const safe = Array.isArray(parsed)
        ? parsed.filter(isCartItem).map((it) => ({
            slug: String(it.slug),
            colour: String(it.colour),
            size: String(it.size),
            qty: Math.max(1, Math.floor(Number(it.qty)) || 1),
          }))
        : [];
      setItems(safe);
    }
  } catch {
    /* corrupt storage -> empty cart */
  }
  setLoaded(true);
}, []);

function isCartItem(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
```

`Array.isArray(parsed)` is the key line; it fixes the page-wide crash.

### [LOW] Quantity has no upper bound

**Type:** Limitation
**Where:** `components/cart-provider.tsx` (lines 103–109)

```tsx
const setQty = useCallback((key: string, qty: number) => {
  setItems((current) =>
    qty <= 0
      ? current.filter((line) => lineKey(line) !== key)
      : current.map((line) => (lineKey(line) === key ? { ...line, qty } : line)),
  );
}, []);
```

**The problem:** `qty <= 0` removes the line (correct), but there is no ceiling. `qty` can only come from `+`/`-` buttons today (there is no free-text quantity input), so `NaN`/fractional/negative are not reachable through the UI — but a held `+` button, or the storage value noted above, can drive `qty` into the millions. Today that only inflates a displayed subtotal; tomorrow `subtotal`/`total` are `integer` columns in Postgres (`supabase/schema.sql` lines 30–32), which overflow at ~2.1 billion. A ₦52,000 item (5,200,000 kobo) at qty 404 already overflows `int4`.

**Real-world consequence:** A runaway quantity produces a wrong (overflowed) order total once orders are persisted.

**Fix:** clamp in `setQty`:

```tsx
const MAX_QTY = 99;
setQty(key, Math.min(Math.max(Math.trunc(qty), 0), MAX_QTY))
```

### [LOW] Cart doesn't sync across browser tabs

**Type:** Limitation
**Where:** `components/cart-provider.tsx` (lines 61–78 — one-time read, no `storage` listener)

**The problem:** The cart is written to `localStorage` on change but never listens for the `storage` event. Add-to-cart in tab A and checkout in tab B means tab B keeps its stale copy, and any write from tab B then overwrites tab A's change.

**Real-world consequence:** A user who opens the shop in two tabs loses or double-counts items.

**Fix:** add a `storage` listener to re-read on cross-tab change:

```tsx
useEffect(() => {
  function onStorage(e: StorageEvent) {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const parsed: unknown = JSON.parse(e.newValue);
        if (Array.isArray(parsed)) setItems(parsed as CartItem[]);
      } catch {}
    }
  }
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}, []);
```

### [OK / BY DESIGN] Hydration, stale prices, variant keys, and removed products

- **Hydration is safe.** The cart starts as `[]` and is only populated in `useEffect` (lines 61–69), so server HTML and first client render both show an empty cart — no hydration mismatch. (Minor cosmetic note: the header count can briefly read `0` before load; a `loaded` gate would remove that flash, but it is not a correctness issue.)
- **Stale prices are avoided.** The cart stores no price (`CartItem` at lines 17–22), and `cart-view.tsx`/`checkout-view.tsx` re-read `product.price` from the catalogue (e.g. `cart-view.tsx` line 27 `total + line.product.price * line.item.qty`). A price change cannot be "locked in" to a user's cart, and there is no stored price to edit in devtools.
- **Variant correctness.** The line key is `slug|colour|size` (`lineKey`, line 25), so the same product in two sizes is two lines. You cannot add without a size: `product-detail.tsx` `onAdd` (lines 32–38) blocks and asks for one.
- **Removed products.** `findProduct` (line 28) returns `undefined` for an unknown slug, and `cart-view.tsx`/`checkout-view.tsx` drop it via `flatMap` (line 18 / line 61). A deleted product silently leaves the cart; no crash.

---

## Area 4 — Authentication and My Account

**Verdict: Mostly safe.** 2 LOW + 1 limitation. No IDOR.

### [OK / BY DESIGN] Authorization is enforced by RLS, not the UI

**Type:** OK / By design
**Where:** `app/(site)/account/page.tsx` (lines 51–54), `supabase/schema.sql` (lines 93–118)

```tsx
const { data } = await supabase
  .from("orders")
  .select("id, number, total, payment_status, fulfilment_status, created_at")
  .order("created_at", { ascending: false });
```

```sql
alter table orders enable row level security;
...
create policy "own orders" on orders
  for select using (user_id = auth.uid());
```

The order query has no explicit `user_id` filter and instead relies on the `"own orders"` RLS policy (`user_id = auth.uid()`), which is `select`-only. Combined with the anon key + the user's session cookie, a signed-in user can only ever read their own rows — there is no `/api/orders/[id]` route to enumerate by ID, and the only write path (`SUPABASE_SERVICE_ROLE_KEY`) is referenced but unused. This is the correct structure.

### [LOW] Open redirect via `next` on the auth callback (backslash bypass)

**Type:** Bug (minor)
**Where:** `app/auth/callback/route.ts` (lines 13–18)

```tsx
const requested = searchParams.get("next") ?? "/account";
// Only follow same-site paths, never an absolute URL or "//host".
const next =
  requested.startsWith("/") && !requested.startsWith("//")
    ? requested
    : "/account";
```

**The problem:** The guard blocks `https://evil.com` and `//evil.com`, but not `\`-based paths. A value like `\evil.com` starts with `\` (not `/`), so it falls through to `/account` — safe. But `/\/evil.com` passes `startsWith("/")` and `!startsWith("//")`, and browsers normalize backslashes to slashes, turning `${origin}/\evil.com` into `https://djdn.com//evil.com`. That is the classic open-redirect shape.

**Real-world consequence:** A crafted link that also carries a valid `code` could bounce a user off to a lookalike domain after sign-in. The `next` value is normally `/account` (hardcoded by `sign-in-panel.tsx` line 19), so this needs an attacker-controlled link to trigger — hence LOW — but it's worth hardening.

**Fix:** parse and confirm the host, don't string-match:

```tsx
let next = "/account";
try {
  const target = new URL(requested, origin);
  if (target.origin === origin) next = target.pathname + target.search;
} catch {
  /* keep "/account" */
}
```

### [LOW] Sign-out is POST-only but has no CSRF protection

**Type:** Limitation
**Where:** `app/auth/sign-out/route.ts` (lines 7–13)

```tsx
export async function POST(request: NextRequest) {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  return NextResponse.redirect(new URL("/account", request.url), 303);
}
```

**The problem:** Making it POST prevents a stray `<img>` or link from signing the user out, but a cross-site form can still POST to `/auth/sign-out` (logout CSRF). The impact is a forced sign-out — annoying, not a data leak — and `supabase.auth.signOut()` does not take/verify a CSRF token here.

**Real-world consequence:** A malicious site can log a DJDN user out; nothing more.

**Fix:** this is low priority, but a standard mitigation is a same-site check (verify `Origin`/`Sec-Fetch-Site` header) or a per-session CSRF token. If Supabase's server-side helper exposes a nonce, use it.

### [LOW] Guest orders won't appear after the customer signs in

**Type:** Limitation
**Where:** `supabase/schema.sql` (line 25: `user_id` nullable), `app/(site)/account/page.tsx` (lines 51–54)

The schema explicitly allows guest checkout (`user_id` optional, tied by email — schema comment line 6), but the account page only queries `orders` by RLS (`user_id = auth.uid()`), not by `email`. A guest order (created with an email but no `user_id`) will not show in the account of the person who later signs in with that email.

**Real-world consequence:** A customer who checks out as a guest, then creates an account, sees "No orders yet" and opens a support ticket.

**Fix:** when an account is created/linked, run a server-side migration that sets `orders.user_id` for any `orders.email` matching the user's verified email (service-role key). Or query `or(user_id.eq(uid), email.eq(user.email))` server-side.

---

## Area 5 — Input validation, forms, and abuse

**Verdict: NOT BUILT for the write paths; the built surfaces are safe.**

### [NOT BUILT] Newsletter, contact, and checkout have no backend

**Type:** Not built
**Where:** `components/newsletter-form.tsx` (lines 33–43), `components/checkout-view.tsx` (lines 85–90)

```tsx
// newsletter-form.tsx
await new Promise((resolve) => setTimeout(resolve, 500)); // placeholder round trip
```

```tsx
// checkout-view.tsx
function onSubmit(e: React.FormEvent) {
  e.preventDefault();
  const found = validate(values);
  setErrors(found);
  setSubmitted(Object.keys(found).length === 0);
}
```

The newsletter form fakes its round trip; the checkout form validates locally and goes nowhere; the contact form doesn't exist (customer-care is a "coming soon" page). There is currently **no endpoint** that emails anyone or writes to Sanity/Supabase, so there is nothing to abuse yet. When each is built:

- **Newsletter/contact** need server-side validation, a honeypot or rate limit, and must not reveal whether an email is already subscribed (return the same "check your inbox" response either way).
- **Checkout** needs server-side re-validation of every field (Zod on the action/route), since `noValidate` + client-only checks (`checkout-view.tsx` lines 42–53) are a convenience, not a defense.

### [OK / BY DESIGN] No XSS surface exists

**Type:** OK / By design

I searched for `dangerouslySetInnerHTML` across the tree — **zero occurrences**. Blog/Portable Text is not rendered anywhere yet (the blog route is a "coming soon" page), so there is no raw-HTML injection path today. When blog rendering is added, use `@portabletext/react` (already a dependency) rather than injecting HTML, and note that the schema already restricts link annotations to safe schemes — `sanity/schemaTypes/blockContent.ts` line 41:

```ts
validation: (rule) =>
  rule.uri({ allowRelative: true, scheme: ["http", "https", "mailto", "tel"] }),
```

This blocks `javascript:` URLs in CMS links at the schema level. Good.

### [OK / BY DESIGN] Query params are validated, not interpolated

**Type:** OK / By design
**Where:** `app/(site)/shop/[[...slug]]/page.tsx` (lines 46–62)

```tsx
const { slug = [] } = await params;
const { sort } = await searchParams;
...
if (extra.length > 0) notFound();
if (departmentSlug && !isDepartment(departmentSlug)) notFound();
if (categorySlug && !(categorySlug in CATEGORY_SLUGS)) notFound();
```

Slugs are checked against whitelists (`isDepartment`, `CATEGORY_SLUGS`) and everything else `notFound()`s. `sort` is only compared to `"new"` (`sort === "new"`); it is never injected into a query. There is no GROQ here at all — the catalogue is a static array — so there is no injection surface. The sort dropdown is client-side state (`shop-listing.tsx` lines 44–52) and only ever picks from a fixed `Sort` union.

---

## Area 6 — Sanity (CMS) security and data handling

**Verdict: NOT CONNECTED, schema is sound.** 2 LOW.

### [NOT BUILT] Storefront never queries Sanity yet

**Type:** Not built
**Where:** `sanity/lib/client.ts` (defined, unused), `lib/catalogue.ts` (the actual data source)

```ts
export const client = createClient({
  projectId, dataset, apiVersion,
  useCdn: true,
  perspective: "published",
});
```

`client` exists but no component or page imports it — all products come from the static `lib/catalogue.ts`. Consequences for the future:

- **No GROQ injection surface yet.** There are no GROQ strings with template interpolation, so nothing to parameterize today. When products are fetched, pass user input (slugs) as query **parameters** (`$slug`), never string-interpolated.
- **Dataset visibility is fine for a storefront.** The dataset is read anonymously via the CDN with `perspective: "published"`. No customer data (orders, emails, addresses) lives in Sanity — those go to Supabase (`supabase/schema.sql`), so a public dataset leaks nothing sensitive.
- **Token scope is correct.** `SANITY_API_READ_TOKEN` is declared server-only in `.env.example` (line 9) and unused. There is no write token in the app; writes happen in the Studio dashboard, not from the site.

### [LOW] CDN reads are cached with no revalidation strategy

**Type:** Limitation
**Where:** `sanity/lib/client.ts` (line 9)

```ts
useCdn: true, // set to false for fresher data / when using ISR revalidation
```

The comment is honest: `useCdn: true` means a price edited in the Studio can lag behind the CDN cache for a while. Today that's moot (no Sanity reads), but the moment prices come from Sanity this becomes the exact "stale price shown, different price charged" risk from the brief. The fix is to fetch checkout-time prices **uncached** (or with `revalidate`/on-demand tags), even while the storefront can stay cached.

### [OK / BY DESIGN] Schema validation is thorough

**Type:** OK / By design
**Where:** `sanity/schemaTypes/product.ts` (lines 37, 78, 88–97, 124–127, 147, 184, 204)

```ts
validation: (rule) => rule.required().integer().positive().min(1), // price
...
validation: (rule) => rule.required().min(1), // colourways
```

Price is `integer().positive().min(1)`; compare-at price is integer + cross-checked to be higher than price; colourway swatch is regex-validated as `#RGB`/`#RRGGBB`; images require non-empty arrays with required alt text; sizes require non-empty arrays with integer `stock >= 0`. The catalogue type in `lib/catalogue.ts` mirrors this. When the storefront starts reading Sanity, it should still tolerate malformed docs (a colourway with zero images, a missing price) by skipping/falling back rather than throwing — a single bad CMS edit must not crash the shop grid.

---

## Area 7 — Next.js specifics, resilience, and failure modes

**Verdict: 1 MEDIUM, 2 LOW.** Async-correct; missing headers and error states.

### [MEDIUM] No security headers anywhere

**Type:** Bug
**Where:** `next.config.ts` (lines 3–14) and `proxy.ts` (lines 16–44) — neither sets headers

```tsx
const nextConfig: NextConfig = {
  async redirects() { ... },   // no headers() block
};
```

```tsx
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  ... // only session refresh; no security headers
}
```

**The problem:** A storefront that will handle payments ships no `Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`, or `X-Frame-Options`/`frame-ancestors`. No anti-clickjacking, no MIME-sniffing guard, no referrer control.

**Real-world consequence:** Higher exposure to clickjacking and content-injection once payment forms exist. This is the standard baseline for a site taking money.

**Fix:** add a headers block (remembering that a future CSP must allow Flutterwave's domains, `https://checkout.flutterwave.com`, `https://api.flutterwave.com`, and `https://*.sanity.io`):

```tsx
async headers() {
  return [
    {
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        // Add Content-Security-Policy once Flutterwave domains are known,
        // never "default-src *".
      ],
    },
  ];
}
```

### [LOW] No `error.tsx`, `not-found.tsx`, or `loading.tsx` at any level

**Type:** Limitation
**Where:** none exist (glob for `app/**/{error,not-found,loading}.tsx` returns nothing)

The routes call `notFound()` correctly (`app/(site)/shop/[[...slug]]/page.tsx` line 50–52, `app/(site)/products/[slug]/page.tsx` line 30), but there is no custom `not-found.tsx`, so users get Next's default 404 rather than a branded page. There is no `error.tsx`, so any future runtime error (e.g. a Sanity fetch failure) produces a generic error page rather than a friendly fallback, and no `loading.tsx` for a smooth transition once data becomes async.

**Fix:** add a root `app/not-found.tsx` and `app/error.tsx`, plus `loading.tsx` on the shop/product routes when they go dynamic. The `_not-found` route already appears in the build output as static.

### [LOW] No `images.remotePatterns` (needed once Sanity images load)

**Type:** Limitation
**Where:** `next.config.ts` (no `images` block)

Today all images are local (`/brand/...`) and `next/image` has no remote origin to allow — correct. The moment product images come from Sanity, `cdn.sanity.io` must be whitelisted or every image 404s. When adding it, restrict to `cdn.sanity.io` (and `images.unsplash.com` if used), never a `*` host.

### [OK / BY DESIGN] Async Next.js 16 APIs used correctly; build is fully static

**Type:** OK / By design

- `params` and `searchParams` are awaited as `Promise`s (`products/[slug]/page.tsx` line 28, `shop/[[...slug]]/page.tsx` lines 46–47); `cookies()` is awaited (`lib/supabase/server.ts` line 13). This matches the Next 15/16 async-params change.
- The middleware file is named `proxy.ts` (the Next 16 rename of `middleware.ts`), with the matcher scoped to `/account`, `/track-order`, `/auth` (`proxy.ts` lines 42–44), so session refresh runs only where it matters.
- `npm run build` succeeds: 27 static/SSG pages, `ƒ` on `/auth/*` and `/shop/[[...slug]]` only (the latter because it reads `searchParams`). `/studio` is `force-static` (`app/studio/[[...tool]]/page.tsx` line 9).
- `app/(site)/layout.tsx` keeps `CartProvider` + header/footer out of the root layout so `/studio` doesn't inherit them. Good.

---

## Area 8 — Accessibility

**Verdict: 2 MEDIUM, 4 LOW.** Keyboard operability and landmarks are mostly solid; focus management and a skip link are missing.

### [MEDIUM] No "skip to content" link

**Type:** Bug (WCAG 2.4.1)
**Where:** `app/layout.tsx` (lines 38–43) and `components/site-header.tsx` (lines 181–309) — no skip link exists

A keyboard user must tab through the full header nav (logo, Men, Women, Blog, search, account, cart) before reaching `<main>` on every page. There is no skip link.

**Fix:** add one as the first focusable element in the header:

```tsx
<a
  href="#main"
  className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:rounded-[18px] focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:text-ink"
>
  Skip to content
</a>
```

…and give `<main>` an `id="main"` in `app/(site)/layout.tsx` (line 10).

### [MEDIUM] Mobile menu and mega-menu don't trap or move focus

**Type:** Bug (WCAG 2.1.1 / 2.4.3)
**Where:** `components/site-header.tsx` (lines 314–340 for the mobile overlay; 239–260 for the desktop mega-menu)

```tsx
{mobileOpen && (
  <div className="fixed inset-x-0 bottom-0 top-20 z-40 overflow-y-auto bg-background lg:hidden">
    <nav aria-label="Primary" className="px-4 py-6 sm:px-6">
```

When the mobile menu opens, focus is not moved into it and is not trapped inside it; the rest of the page remains focusable and readable by screen readers. `Escape` closes it (line 157–162, good) but focus does not return to the trigger. Same story for the desktop department panel (`onMouseEnter` at line 224 opens it; there is `aria-expanded`/`aria-haspopup` but no focus management).

**Real-world consequence:** A keyboard user can tab "behind" the open menu into a page they can't see.

**Fix:** on open, focus the first link; trap Tab/Shift+Tab within the overlay while open; restore focus to the trigger on close. The existing `Escape` handler is a good place to also do the focus return.

### [LOW] Form inputs suppress the default focus outline

**Type:** Limitation (WCAG 2.4.7)
**Where:** `components/checkout-view.tsx` (line 334), `components/sign-in-panel.tsx` (line 78), `components/newsletter-form.tsx` (lines 71–75)

```tsx
const INPUT =
  "... focus:border-ink/40 focus:outline-none aria-[invalid=true]:border-error";
```

These inputs use `focus:outline-none`, and the only visible focus change is `focus:border-ink/40` — a faint border darkening. The global `:focus-visible` ring in `app/globals.css` (lines 124–127) applies `outline: 2px solid var(--color-primary)`, but `focus:outline-none` on the element removes it, leaving a low-contrast border shift as the sole indicator.

**Fix:** replace `focus:outline-none` with a visible indicator, e.g. `focus:border-primary` (which passes the 3:1 non-text contrast bar against `--color-outline`), or drop `focus:outline-none` and rely on the global focus-visible ring.

### [LOW] Brand orange fails WCAG 4.5:1 for small text (currently hover-only)

**Type:** Limitation (WCAG 1.4.3)
**Where:** `app/globals.css` (line 11), used via `hover:text-primary` throughout

I calculated the contrast ratios for the actual token combinations:

| Combination | Ratio | Threshold | Result |
|---|---|---|---|
| `#BA5624` text on `#FAF6EF` cream | **4.38:1** | 4.5:1 (body) / 3:1 (large) | **Fails for small text**, passes large/UI |
| White text on `#BA5624` button | **4.72:1** | 4.5:1 | Passes |
| `#F4F0E7` on `#1F3D2B` green | **10.5:1** | 4.5:1 | Passes |
| `#1C1917` on `#FAF6EF` | **16.2:1** | 4.5:1 | Passes |
| `#B3261E` error on cream | **6.07:1** | 4.5:1 | Passes |
| `#6F6A63` muted on cream | **4.97:1** | 4.5:1 | Passes |
| `#B8C4BB` muted on green | **6.62:1** | 4.5:1 | Passes |

The burnt-orange `#BA5624` on cream is the one near-miss, at 4.38:1. **Today this is not a live failure**: `text-primary` is only used as a hover/focus accent (`hover:text-primary`, `hover:border-primary`, `hover:bg-primary`) and as a button *fill* with white text (4.72:1). Prices and body copy use `text-ink`/`text-ink-muted`, not orange. But the token is dangerous to reach for as small body text. If orange is ever needed as standing small text, darken it to at least **`#A64A1A`** (≈4.8:1) or use it only at large sizes / as a fill.

### [LOW] Cart count change is not announced to screen readers

**Type:** Limitation
**Where:** `components/site-header.tsx` (lines 292–305)

```tsx
<Link
  href="/cart"
  aria-label={count > 0 ? `Cart, ${count} items` : "Cart"}
  ...
>
```

The `aria-label` updates with the count, but `aria-label` changes on a focused/unfocused link are not announced as live updates. The "added to cart" popup *is* announced (`cart-provider.tsx` line 146–147 uses `role="status"` + `aria-live="polite"`), which covers the common case, but the header count itself is not live.

**Fix:** add `aria-live="polite"` to the count badge (or an adjacent visually-hidden `role="status"`), so the number change is announced.

### [OK / BY DESIGN] Landmarks, labels, reduced-motion, `lang`, and external links

- **Landmarks** are present: `<header>`, `<nav aria-label="Primary">`, `<main>`, `<footer>` — with one caveat: when the mobile menu is open there are two `<nav aria-label="Primary">` landmarks (desktop `hidden lg:block` + mobile overlay), which is a minor duplicate.
- **Form labels**: every checkout field has a real `<label htmlFor>` (`checkout-view.tsx` `Field` lines 344–386 and the state `<select>` line 191); newsletter and sign-in use `sr-only` labels. Errors use `role="alert"` + `aria-describedby` and are not colour-only (`ErrorText` line 336–342; the `aria-[invalid=true]:border-error` styling in `INPUT` adds a border, not just colour).
- **Reduced motion**: `prefers-reduced-motion` is respected in `settle.tsx` (lines 21–24), `product-tile.tsx` (line 72 `motion-reduce:transition-none`), `bouncing-logos.tsx` (lines 50–52), and globally via `@media (prefers-reduced-motion: no-preference)` in `globals.css` (lines 82–96). Good.
- **`lang`**: `<html lang="en">` is set (`app/layout.tsx` line 40).
- **External links**: footer Instagram/TikTok (`site-footer.tsx` lines 71–79) and the coming-soon Instagram link (`coming-soon.tsx` lines 95–103) use `target="_blank"` with `rel="noopener noreferrer"`. The footer's "X" and "WhatsApp" entries point at `href="#"` (`site-footer.tsx` lines 56–57) — placeholder dead links that should become real URLs or be removed.
- **Size selector** is a set of keyboard-operable `<button>`s with `aria-pressed` and a visible selected state (`product-detail.tsx` lines 122–141); colour swatches have `aria-label` + `aria-pressed` + a ring indicator (`shop-tile.tsx` lines 92–113), so selection is not colour-only.

---

## Area 9 — Performance and bundle

**Verdict: Safe.** 1 LOW. Build is clean and small.

### [OK / BY DESIGN] Build succeeds; routes are static with modest payloads

**Type:** OK / By design
**Where:** `next build` output

```
✓ Generating static pages using 7 workers (27/27) in 2.5s
Route (app)
┌ ○ /           ├ ○ /cart        ├ ○ /checkout      ├ ○ /studio/[[...tool]]
├ ○ /about     ├ ○ /shop/... (ƒ) ├ ● /products/[slug] (SSG, 9 paths)
```

Everything renders static/SSG; the only dynamic routes are `/auth/callback`, `/auth/sign-out`, and `/shop/[[...slug]]` (dynamic only because it reads `searchParams`). Next 16's Turbopack build output did not print a per-route "First Load JS" column in this run, but the total JS shipped is small: no heavy client libraries are imported into storefront pages, icons are hand-rolled SVGs (no icon-library dependency), and `next/image` is used with explicit `sizes`/`fill` throughout. No route approaches the 200 kB warning threshold by inspection.

### [OK / BY DESIGN] Fonts loaded correctly

**Type:** OK / By design
**Where:** `app/layout.tsx` (lines 11–26)

Switzer is self-hosted via `next/font/local` (three weights, `display: "swap"`); Inter loads via `next/font/google` with `subsets: ["latin"]` and `display: "swap"`. No `<link>` to Google Fonts, no extra weights. (Note: the brief named "Fraunces + Inter"; the codebase uses "Switzer + Inter". This is a deliberate substitution, not a defect.)

### [OK / BY DESIGN] Images and data fetching are efficient

**Type:** OK / By design

- `next/image` uses `fill` + sensible `sizes` everywhere; `priority` is only on the hero portraits (`hero.tsx` line 45), the header logo, and the first product image — not sprayed across every tile.
- Product queries don't exist yet (static catalogue), so there is no over-fetching to flag; the shop grid is only 9 products, so no pagination is warranted yet.
- No independent fetches are awaited sequentially (there are no `fetch`/GROQ calls at all).

### [LOW] No dependency beyond the brief's stack is unreasonable — but note Supabase

**Type:** Limitation
**Where:** `package.json` (lines 14–25)

The runtime deps are Next 16, React 19, Sanity + `next-sanity` + `@sanity/vision`, `@portabletext/react`, `@sanity/image-url`, `styled-components` (pulled by Sanity Studio), and **Supabase** (`@supabase/ssr`, `@supabase/supabase-js`). Supabase is *not* in the brief's "Next, Tailwind, Sanity, Flutterwave" list — it's the chosen home for accounts/orders, which the brief assigned to "Sanity-stored users" as one option. That's a defensible architecture choice (orders belong in a transactional store with RLS, not a headless CMS), but it should be a conscious, documented decision. `styled-components` is a Sanity transitive, not app code. Nothing heavy or unexpected otherwise; no Flutterwave SDK is present yet (expected — it isn't wired).

---

## Area 10 — Spec conformance (quick checks)

One line each; only real deviations flagged.

- **Colors from `@theme` tokens** — ✅ Tokens are defined in `app/globals.css` (lines 10–40) and used everywhere. The only raw hex in `.tsx` are the Google logo SVG fills (`sign-in-panel.tsx` lines 108–120) and catalogue swatch data (`lib/catalogue.ts`), both legitimate. No stray hex in CSS outside the token block.
- **Money stored/calculated as integers** — ✅ Integer kobo everywhere (`lib/catalogue.ts` prices, `supabase/schema.sql` `subtotal`/`total`/`unit_price integer`, Sanity price `integer().positive()`). No `parseFloat`/`toFixed`/`Number()` money math found.
- **No Lorem Ipsum / boilerplate copy** — ✅ No lorem ipsum anywhere. The only boilerplate is `README.md` (create-next-app default), which is not a shipped page.
- **Banned patterns** — ✅ None present. No hero-banner + three-category-cards home; no testimonial carousel or Instagram grid; no shadow-heavy rounded-everything cards (the design uses flush hairline grids, `rounded-[18px]` only on buttons/inputs).
- **Bottle green where a template would use black** — ⚠️ Mostly. The footer is bottle green (`site-footer.tsx` line 89 `bg-secondary`). The header is *cream* (`bg-background/75`, `site-header.tsx` line 184), not green — the brief named the header as a green surface. This reads as an intentional editorial choice (cream header, dark text), but it's a deviation from the brief's letter.
- **Primary CTA "Shop Now"** — ✅ Consistent. `hero.tsx` line 32 and `lookbook-banner.tsx` line 37 both read "Shop Now".

---

## Prioritized fix list (top 5)

1. **Validate cart storage shape** — `components/cart-provider.tsx` (lines 61–69). Add `Array.isArray` + per-field sanitization before `setItems`. *Effort: 5 min.* Prevents a single bad `localStorage` value from crashing every page.
2. **Add security headers** — `next.config.ts`. `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` now; `Content-Security-Policy` once Flutterwave domains are known. *Effort: 15 min.*
3. **Add a skip link + fix input focus indicators** — `site-header.tsx` + `checkout-view.tsx`/`newsletter-form.tsx`/`sign-in-panel.tsx`. Skip link in the header, `id="main"` on `<main>`, replace `focus:outline-none` with a visible focus style. *Effort: 30 min.*
4. **Add focus trap + focus return to the mobile menu** — `components/site-header.tsx` (lines 314–340). *Effort: 30 min.*
5. **Harden the auth callback redirect** — `app/auth/callback/route.ts` (lines 13–18). Parse with `new URL()` and verify `origin` instead of string-matching `/`. *Effort: 10 min.*

---

## Before-launch checklist (must be true before real customers pay)

- [ ] Flutterwave **live** secret key (`FLW_SECRET_KEY`) and encryption key are in the production env; **test-mode keys are not** shipping to prod, and there is an obvious env-based mode switch so a test key can never be reused live.
- [ ] `FLW_WEBHOOK_SECRET_HASH` is set and the webhook URL is registered in the Flutterwave dashboard.
- [ ] Amount is computed **server-side from Sanity prices**, never trusted from the client; kobo→naira conversion is explicit and correct (no off-by-100).
- [ ] Pending order is created **before** payment; `tx_ref` is server-generated and unique per attempt.
- [ ] Payment success is verified server-side (verify-transaction) — status, amount, currency, and `tx_ref` all match — before an order is marked `paid`.
- [ ] Webhook is idempotent and verifies `verif-hash` with a constant-time check; duplicate events don't double-email.
- [ ] One end-to-end test purchase run through production with a real (low-value) card, including the "pay succeeds but verify fails" and "webhook arrives before redirect" cases.
- [ ] Security headers live (see Area 7); a CSP, when added, allows Flutterwave and `cdn.sanity.io`.
- [ ] `images.remotePatterns` whitelists `cdn.sanity.io` before Sanity images go live.
- [ ] Order/account schema is applied (`supabase/schema.sql`) and RLS verified against a second test account (no cross-account reads).
- [ ] Skip link, focus management, and error/not-found/loading pages exist before launch.
