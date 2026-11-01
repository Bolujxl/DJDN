import { ComingSoon } from "@/components/coming-soon";
import { comingSoonMetadata } from "@/lib/coming-soon";

export const metadata = comingSoonMetadata("blog");

export default function BlogPage() {
  return <ComingSoon page="blog" />;
}
