import type { Metadata } from "next";
import Link from "next/link";

import { ComingSoon } from "@/components/coming-soon";
import { SignInPanel } from "@/components/sign-in-panel";
import { formatNaira } from "@/lib/format";
import {
  FULFILMENT_LABELS,
  PAYMENT_LABELS,
  type OrderSummary,
} from "@/lib/orders";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "My account" };

/**
 * Signed out: Google or email-link sign-in. Signed in: order history and the
 * email on the account. Until Supabase is configured this stays the "coming
 * soon" page, so nothing breaks on a deploy that doesn't have the keys yet.
 */
export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (!isSupabaseConfigured) return <ComingSoon page="account" />;

  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <section className="flex min-h-[calc(100svh-5rem)] flex-col items-center justify-center bg-background px-4 py-20 sm:px-6 lg:px-8">
        <h1 className="text-5xl leading-[0.95] tracking-[-0.045em] text-ink sm:text-6xl">
          Sign in
        </h1>
        <p className="mb-10 mt-4 max-w-sm text-center font-sans text-sm text-ink-muted">
          See your orders and keep your details for next time.
        </p>
        <SignInPanel failed={error === "sign-in"} />
      </section>
    );
  }

  // RLS limits this to the signed-in customer's own orders. If the schema
  // hasn't been applied yet the query errors and we show the empty state.
  const { data } = await supabase
    .from("orders")
    .select("id, number, total, payment_status, fulfilment_status, created_at")
    .order("created_at", { ascending: false });
  const orders = (data ?? []) as OrderSummary[];

  const name =
    (user.user_metadata?.full_name as string | undefined)?.split(" ")[0] ??
    null;

  return (
    <section className="bg-surface px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pb-24 lg:pt-24">
      <h1 className="text-5xl leading-[0.95] tracking-[-0.045em] text-ink sm:text-6xl">
        {name ? `Hi, ${name}` : "My account"}
      </h1>

      <div className="mt-12 grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <p className="border-b border-outline pb-4 font-sans text-sm text-ink-muted">
            Orders
          </p>

          {orders.length === 0 ? (
            <p className="mt-6 font-sans text-sm text-ink-muted">
              No orders yet.{" "}
              <Link
                href="/shop"
                className="text-ink underline underline-offset-4 transition-colors hover:text-primary"
              >
                Keep shopping
              </Link>
            </p>
          ) : (
            <ul>
              {orders.map((order) => (
                <li
                  key={order.id}
                  className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-outline py-5 font-sans text-sm"
                >
                  <div>
                    <p className="text-ink">{order.number}</p>
                    <p className="mt-1 text-ink-muted">
                      {new Date(order.created_at).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <p className="text-ink-muted">
                    {PAYMENT_LABELS[order.payment_status]} ·{" "}
                    {FULFILMENT_LABELS[order.fulfilment_status]}
                  </p>
                  <p className="tabular-nums text-ink">
                    {formatNaira(order.total)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="font-sans text-sm lg:col-span-4">
          <p className="border-b border-outline pb-4 text-ink-muted">Details</p>
          <p className="mt-6 text-ink">{user.email}</p>
          <form action="/auth/sign-out" method="post" className="mt-6">
            <button
              type="submit"
              className="text-ink-muted underline underline-offset-4 transition-colors hover:text-ink"
            >
              Sign out
            </button>
          </form>
        </aside>
      </div>
    </section>
  );
}
