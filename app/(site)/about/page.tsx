import { ComingSoon } from "@/components/coming-soon";
import { comingSoonMetadata } from "@/lib/coming-soon";

export const metadata = comingSoonMetadata("about");

export default function AboutPage() {
  return <ComingSoon page="about" />;
}
