import { NotFoundView } from "@/components/not-found-view";
import { SiteShell } from "@/components/site-shell";

/** URLs that match no route at all land here, outside the (site) layout, so it brings its own header and footer. */
export default function RootNotFound() {
  return (
    <SiteShell>
      <NotFoundView />
    </SiteShell>
  );
}
