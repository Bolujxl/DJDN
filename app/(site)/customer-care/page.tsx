import { ComingSoon } from "@/components/coming-soon";
import { comingSoonMetadata } from "@/lib/coming-soon";

export const metadata = comingSoonMetadata("customer-care");

export default function CustomerCarePage() {
  return <ComingSoon page="customer-care" />;
}
