import { ComingSoon } from "@/components/coming-soon";
import { comingSoonMetadata } from "@/lib/coming-soon";

export const metadata = comingSoonMetadata("careers");

export default function CareersPage() {
  return <ComingSoon page="careers" />;
}
