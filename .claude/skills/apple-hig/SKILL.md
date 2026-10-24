---
name: apple-hig
description: Full Apple Human Interface Guidelines lens, adapted for web/e-commerce UI, for reviewing or guiding design and layout work on this repo. Use for deeper design review than the quick `taste` check, or when asked to apply Apple HIG principles specifically.
---

Apple's HIG is written for native iOS/macOS apps, so this adapts the parts that transfer to a web storefront and drops the parts that don't (tab bars, sheets, native controls, haptics). Written from general knowledge of the guidelines' principles, in original wording — not a reproduction of Apple's text.

## The three foundations

**Clarity** — Every screen has one clearly primary thing. Text is legible at the sizes actually used (don't drop below ~14px for body copy). Icons/imagery are functional, not decorative filler. Negative space is used deliberately to separate unrelated content, not just left over.

**Deference** — The UI's job is to showcase content (product photography, copy), not compete with it. Chrome (borders, panels, heavy dividers, decorative color) should recede. When in doubt, remove a visual element and see if anything is actually lost.

**Depth** — Visual layers communicate hierarchy: what's in front (modals, sticky headers, dropdowns) should look and behave like it's in front (shadow, blur, motion), and what's behind should visually recede. Depth is a hierarchy tool, not a decoration — don't add shadow/blur without a layering reason.

## Typography

- One type family for display/headings, one for body/UI — this repo already does this (Unbounded / Inter). Don't add a third.
- Establish a small set of sizes and stick to them (the existing Tailwind scale + `--text-display`); avoid one-off font sizes for a single element.
- Line length matters for reading comfort: body copy shouldn't run much past ~75 characters per line; if a paragraph is spanning the full container width on desktop, constrain it (`max-w-*`).
- Weight and size carry hierarchy before color does — don't reach for a color change to indicate importance if a weight/size change would do it more clearly.

## Color & contrast

- Color communicates state and hierarchy, not decoration. If a color is used for a button, that same color shouldn't also be background decoration nearby — it dilutes the signal (this is the reasoning behind this project's own 60/30/10 rule).
- Check contrast on text over photography or tinted panels specifically — a caption that's legible over a light patch of a photo may fail over a dark one. Scrims/gradients should be sized to the actual content they protect, not a fixed guess.
- Don't rely on color alone to convey a state (error, success, disabled) — pair it with a label, icon, or position change too.

## Layout & spacing

- Use a consistent spacing rhythm (this repo's `py-16 sm:py-20` section pattern, `gap-x-5`/`gap-y-10` grid gaps) rather than ad hoc pixel values per section.
- Alignment should be boring and predictable — content edges line up with each other (e.g. every section's inner content shares the same `max-w-7xl px-4 sm:px-6 lg:px-8` container) rather than each section inventing its own margins.
- Group related controls/content with proximity before reaching for a visible divider or border.

## Navigation & structure

- The user should always know where they are and how to get back. A sticky header, breadcrumbs, or clear "back" affordance matters more as depth increases (home → category → product).
- Don't bury a primary action (e.g. "Shop Now") behind secondary ones — it should be the visually dominant control in its section.
- Progressive disclosure: show the common case by default (e.g. a collapsed mega-menu), reveal detail on demand, rather than front-loading every option.

## Feedback & state

- Every interactive element needs a visible response to hover, focus, and press — not just hover (keyboard/touch users need focus states too).
- Loading, empty, and error states are real states, not afterthoughts — design them on purpose (this repo's "Hoodies — Coming soon" section is a small example of an intentional empty state rather than a missing one).
- Feedback should be immediate and proportional — a subtle hover lift for a product card, not a jarring animation; a clear, specific error message, not a generic "something went wrong" when the cause is knowable.

## Motion

- Motion should clarify a relationship (this expanded from that, this is now behind that) — not decorate. If removing an animation loses no information, it's decoration.
- Keep durations short (150–400ms for most UI feedback; this repo's hover transitions sit in that range) — anything longer reads as sluggish, not premium.
- Always respect `prefers-reduced-motion` (already done in the Hero's autoplay) — motion is an enhancement, never a requirement to understand the UI.

## Accessibility

- Tap/click targets should be comfortably sized (roughly 44×44px minimum) — check icon-only buttons specifically.
- Every icon-only control needs an `aria-label`; every image needs real alt text describing content, not the filename.
- Keyboard users should be able to reach and operate everything a mouse user can (menus, carousels, forms) — verify focus order and that nothing's mouse-only.

## How to use this

- **For a deeper review than `taste`'s quick pass**: go through each section above against the actual UI, section by section, and name the specific principle a finding violates rather than giving vague "make it feel more premium" feedback.
- **When designing something new**: treat the three foundations (Clarity, Deference, Depth) as the first filter before getting into spacing/color/motion specifics — most bad UI decisions trace back to violating one of those three.
- This is a deeper reference than `taste`'s condensed four-question version; use `taste` for a quick gut-check during normal work, and this skill when asked for a proper HIG-based review.
