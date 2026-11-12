import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";
import { hasPlaceholders, LegalDocument } from "@/components/legal-document";
import { PRIVACY } from "@/content/legal/privacy";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How DJDN collects, uses and protects your personal information.",
};

/**
 * The reviewed privacy policy (content/legal/privacy.ts). On the live site this
 * stays "Coming soon" until every [placeholder] in the text has been filled in.
 */
export default function PrivacyPage() {
  if (process.env.NODE_ENV === "production" && hasPlaceholders(PRIVACY)) {
    return <ComingSoon page="privacy" />;
  }
  return <LegalDocument source={PRIVACY} />;
}
