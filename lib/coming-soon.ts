import type { Metadata } from "next";

/**
 * Settings for every "coming soon" page. The footer and product page already
 * link to these routes, so each one renders the same layout with its own
 * title and copy. When a real page replaces one, delete its entry
 * here and its route's `<ComingSoon />`.
 *
 * `eta` is shown as the status line when set (for example "Autumn 2027");
 * left unset it reads "In the works". Don't invent a date: only set it once
 * there is one.
 */
export type ComingSoonPage = {
  /** Small label above the title: the section this page belongs to. */
  section: string;
  title: string;
  description: string;
  eta?: string;
};

export const COMING_SOON = {
  "track-order": {
    section: "Help",
    title: "Track your order",
    description:
      "Look up an order with your order number and email, and see where it is from payment to delivery.",
  },
  account: {
    section: "Help",
    title: "My account",
    description:
      "Order history, saved details and quicker checkout are on their way. Your cart works in the meantime.",
  },
  careers: {
    section: "Company",
    title: "Careers",
    description:
      "Open roles will be listed here. Leave your email and we'll let you know when there's something to apply for.",
  },
  blog: {
    section: "Company",
    title: "Blog",
    description:
      "Stories and notes from behind the drops. The first post isn't far off.",
  },
  privacy: {
    section: "Legal",
    title: "Privacy policy",
    description:
      "Our full privacy policy is being finalised and will be published here.",
  },
  terms: {
    section: "Legal",
    title: "Terms of service",
    description:
      "Our full terms of service are being finalised and will be published here.",
  },
} satisfies Record<string, ComingSoonPage>;

export type ComingSoonKey = keyof typeof COMING_SOON;

export function comingSoonMetadata(key: ComingSoonKey): Metadata {
  const page = COMING_SOON[key];
  return { title: page.title, description: page.description };
}
