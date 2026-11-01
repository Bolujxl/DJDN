import { ComingSoon } from "@/components/coming-soon";
import { comingSoonMetadata } from "@/lib/coming-soon";

export const metadata = comingSoonMetadata("track-order");

export default function TrackOrderPage() {
  return <ComingSoon page="track-order" />;
}
