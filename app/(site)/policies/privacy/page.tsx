import { ComingSoon } from "@/components/coming-soon";
import { comingSoonMetadata } from "@/lib/coming-soon";

export const metadata = comingSoonMetadata("privacy");

export default function PrivacyPage() {
  return <ComingSoon page="privacy" />;
}
