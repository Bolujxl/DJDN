import { SiteShell } from "@/components/site-shell";

/** Layout for every storefront page — everything except /studio, which owns its own viewport. */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return <SiteShell>{children}</SiteShell>;
}
