/**
 * Unlike a layout, a template is created afresh on every navigation, so the
 * page content (not the header or footer, which stay put) plays a short enter
 * animation each time you move between pages. The motion itself is the
 * `page-enter` rule in globals.css: a quick fade and a few pixels of rise,
 * switched off for people who prefer reduced motion.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
