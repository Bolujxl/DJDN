import { ComingSoon } from "@/components/coming-soon";
import { comingSoonMetadata } from "@/lib/coming-soon";

export const metadata = comingSoonMetadata("terms");

export default function TermsPage() {
  return <ComingSoon page="terms" />;
}
