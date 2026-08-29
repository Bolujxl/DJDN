/**
 * Embedded Sanity Studio route. Everything under /studio is handled by the
 * Studio component; this route opts out of static rendering and metadata
 * inheritance so the Studio owns the whole viewport.
 */
import { NextStudio } from "next-sanity/studio";
import config from "../../../sanity.config";

export const dynamic = "force-static";

export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
