---
name: taste
description: Reviews or guides UI/design work on this repo against DJDN's own settled design principles (color discipline, restraint, real photography) plus an Apple HIG-style clarity/deference/consistency lens. Use before writing new UI, and when asked to review or critique a design/UI change.
---

Apply this whenever writing new UI for DJDN, or when asked to review/critique one.

## DJDN's own principles (settled this project, don't relitigate)

- **60/30/10 color balance.** Cream (`--color-background` / `--color-background-alt`) is the dominant ground. Bottle green (`--color-secondary`) is bounded to header/footer/accents — never a full section background by default. Burnt orange (`--color-primary`) is sparing: CTAs and small accents only, never a background fill.
- **Restraint over cleverness.** If an interaction (hover, scale, layout shift) costs real engineering complexity for a marginal effect, cut it. This repo already rolled back a flex-grow hover-push effect for exactly this reason — a plain grid + small lift + shadow was the right call. Default to the simplest interaction that reads as intentional.
- **Real photography over AI mockups** wherever the brand's premium feel is on the line. Placeholder/AI imagery is a last resort, not a default.
- **Editorial content isn't shopping chrome.** Lookbook/hero imagery gets a credit line at most (what's being worn) — no price tags, no "New" badges, no links — unless the surface is an actual product grid.
- **One display font for headings, one sans for body/UI**, sizes drawn from the existing type scale (`--text-display`, Tailwind defaults) — no ad hoc font sizes.
- **Consistent control shapes.** Buttons/inputs share one radius token (`rounded-[18px]` currently) across the whole site — don't introduce a second radius language.
- **Section rhythm.** Adjacent sections alternate between the neutral tiers (`bg-background` / `bg-background-alt` / `bg-surface`) with a `border-t border-outline` seam, so the page has visible structure without color doing the separating.
- **Copy is tight.** Headlines and subtext stay short; one clear CTA per section, consistently worded ("Shop Now"), not a different verb every time.

## Apple HIG lens (kept simple — four questions, not the whole HIG)

1. **Clarity** — is the most important thing on this screen/section obvious at a glance? Strip anything that doesn't earn its place.
2. **Deference** — does the UI get out of the way of the content (photography, product, copy), or is it competing with it (heavy chrome, loud decoration)?
3. **Consistency** — does this reuse an existing pattern in the codebase (spacing scale, component, token) instead of inventing a new one for this one spot?
4. **Feedback** — does every interactive element give an unambiguous state (hover, focus, loading, disabled) without overshooting into distraction?

## Borrowed from Leonxlnx/taste-skill (MIT, cherry-picked — see note at bottom)

That repo is a large, general-purpose "anti-slop" framework for marketing pages built around a stack (Framer Motion, GSAP, an icon-library mandate) this project doesn't use, and it explicitly bans things this project already does deliberately (hand-rolled SVG icons). Adopting it wholesale would fight decisions already made here. These specific rules don't conflict with anything and are worth keeping:

- **Em-dash discipline in prose, not naming.** An em-dash used as a sentence connector (where a period or comma would do) reads as an AI-writing tell — check for it in real copy. This does NOT apply to this project's "Product — Colorway" naming convention (`Track Jacket — Bottle Green`), which is a normal retail naming pattern, not a prose crutch. The two visible instances found (footer subtext, newsletter error message) have been fixed; code comments are exempt since users never see them.
- **Button/form contrast is a pre-ship gate, not a vibe check.** Compute it: white-on-primary currently sits at ~4.72:1, which clears WCAG AA (4.5:1) but with little headroom — don't darken the primary token without rechecking this.
- **CTA label discipline.** Primary CTA labels should be short enough to never wrap at desktop (this project's "Shop Now" already qualifies), and every CTA with the same intent (e.g. "go shop") should use the exact same label across the whole page — don't let "Shop Now," "Shop all," and some future "Browse" all mean the same thing in different words on one page.
- **Copy self-audit before shipping.** Re-read every visible string (headings, subtext, captions, button labels, alt text) as a final pass, specifically hunting for anything grammatically off or that sounds like it's trying too hard to sound thoughtful.
- **Hero fits the fold.** Headline ≤ 2 lines, subtext ≤ ~20 words, CTA visible without scrolling. [hero.tsx](../../../components/hero.tsx) already passes this — keep it true on any future hero-style section (the lookbook banner already does too).
- **Shape consistency needs an explicit reason, not just consistency for its own sake.** This project already uses three corner treatments (pill `rounded-[18px]` controls, `rounded-lg` cards, the arch-shaped hero images) — that's fine because each maps to a distinct role (interactive control / container / signature editorial shape), but if a fourth one shows up without a clear role, that's the moment to stop and ask why.
- **Layout repetition is a real tension, not an automatic violation.** The source repo bans reusing the same section layout twice in a row on a marketing page. This project does the opposite on purpose — New Arrivals, Shirts, and Shorts deliberately share one grid component for calm consistency on a small catalog. That's the right call here (per this project's own "reuse over reinvention" principle above), not a violation — but if this site grows into more of an editorial/marketing-heavy homepage later, revisit whether back-to-back identical-layout sections still serve it.

*Attribution: rules above are adapted in original wording from [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) (MIT License), whose README explicitly invites copying its SKILL.md content into other projects.*

## How to use this

- **Before writing new UI:** run through the DJDN principles above as constraints, and the four HIG questions as a gut-check, before committing to a layout or interaction.
- **When asked to review/critique:** go section by section, flag violations of the above specifically (name which principle, e.g. "this fills a whole section with green — breaks the 60/30/10 rule"), and propose the smallest fix rather than a redesign.
