import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";
import { hasPlaceholders, LegalDocument } from "@/components/legal-document";
import { TERMS } from "@/content/legal/terms";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "The terms that apply when you use the DJDN website and buy from us.",
};

/**
 * The reviewed terms (content/legal/terms.ts). On the live site this stays
 * "Coming soon" until every [placeholder] in the text has been filled in.
 */
export default function TermsPage() {
  if (process.env.NODE_ENV === "production" && hasPlaceholders(TERMS)) {
    return <ComingSoon page="terms" />;
  }
  return <LegalDocument source={TERMS} />;
}
