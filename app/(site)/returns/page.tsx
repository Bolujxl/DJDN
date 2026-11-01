import { ComingSoon } from "@/components/coming-soon";
import { comingSoonMetadata } from "@/lib/coming-soon";

export const metadata = comingSoonMetadata("returns");

export default function ReturnsPage() {
  return <ComingSoon page="returns" />;
}
