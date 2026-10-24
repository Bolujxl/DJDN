---
name: emil-kowalski
description: Motion and interaction-detail lens based on Emil Kowalski's publicly known design philosophy (creator of Vaul, Sonner; writes on animation/interaction design). Use when adding or reviewing any hover, transition, open/close, drag, or micro-interaction on this repo.
---

Emil Kowalski is a real UI engineer/designer (Vaul, Sonner, emilkowal.ski) known for writing publicly about motion and interaction polish. This is written from general knowledge of his publicly stated principles, in original wording — not a reproduction of his articles.

## Core philosophy

**Motion communicates, it doesn't decorate.** Every animation should answer "where did this come from, where is it going, what changed." If an animation doesn't clarify one of those, cut it.

**Never block the user.** An interaction should always be interruptible — if someone clicks again mid-animation, changes their mind, or moves the mouse away, the UI should respond immediately, not finish playing out an animation first. Nothing should ever feel like it's "waiting for the animation."

## Performance: only animate cheap properties

- Animate `transform` and `opacity` — both are compositor-only, no layout recalculation, so they stay smooth even on weaker devices.
- Avoid animating `width`, `height`, `top`/`left`, or margin — these trigger layout on every frame (this is exactly the class of bug this project already hit and rolled back with the New Arrivals flex-grow hover).
- `box-shadow` is a partial exception — it's a paint cost, not a layout one, so it's fine for a subtle hover deepen (as this repo already does), but avoid animating large/complex shadows across many elements at once.

## Easing and duration

- Entrances feel best with an ease-out curve (fast start, settles gently) — a linear or ease-in entrance reads as robotic or sluggish.
- Keep UI feedback short — roughly 150–300ms for hover/press states, a bit more (250–400ms) for larger movements like a panel or menu opening. This repo's `duration-300` hovers already sit in the right range.
- For anything the user drags (a sheet, a carousel, a slider), prefer a spring-like settle over a fixed-duration ease — a spring reacts naturally to velocity instead of always taking the same time regardless of how the user flicked it.

## Continuity and origin

- Things that open should visually originate from what triggered them (a menu grows from its trigger button, not just fades in centered on the screen) — this repo's header mega-menu opening directly below its trigger already does this correctly.
- Avoid content "popping" into existence with no transition at all, but also avoid transitioning things that were never in view yet (don't animate on initial page load by default — it delays perceived readiness and most users never see the "entrance" anyway since it happens before they're looking).

## Micro-feedback

- Buttons and tappable elements benefit from a subtle press-down (e.g. `active:scale-[0.98]`) in addition to hover — it's the detail that makes a UI feel physically responsive rather than just visually reactive. Check this repo's primary CTAs (`Shop Now` buttons) for this — currently they only have a hover color change, no press feedback.
- Keyboard/focus states deserve the same care as hover states — an interaction polished only for mouse users is half-finished (this is the same principle behind this repo's `group-focus-within` fix on product cards).

## Always respect the user's motion preference

- Every non-essential animation must be skippable via `prefers-reduced-motion` — this repo's Hero autoplay already does this correctly; apply the same guard to any new animation (carousels, auto-advancing content, decorative motion).

## How to use this

- When adding a new interaction (hover, open/close, drag, carousel), check it against: is it interruptible, does it animate only `transform`/`opacity`, does it feel anchored to its trigger, does it respect reduced motion.
- When reviewing existing motion, look for the same things `taste` looks for in visuals: name the specific principle a finding violates (e.g. "this animates `height`, will jank on slower devices") rather than a vague "make it feel smoother."
