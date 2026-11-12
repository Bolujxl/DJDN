import type { ReactNode } from "react";

/**
 * Renders a legal document from the small markdown strings in content/legal:
 * `# title`, `## section`, paragraphs, `- ` bullets and pipe tables, with
 * **bold** inside text. Sections are numbered in order.
 *
 * Publish guard: anything left in [square brackets] is an open question for
 * the owner or the lawyer. `hasPlaceholders` lets each policy page keep
 * showing "Coming soon" on the live site until none are left, so a half
 * finished document can never be published by accident.
 */
export const hasPlaceholders = (source: string) => /\[[^\]]+\]/.test(source);

type Block =
  | { kind: "title"; text: string }
  | { kind: "section"; text: string }
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "table"; head: string[]; rows: string[][] };

function parse(source: string): Block[] {
  const blocks: Block[] = [];
  const cells = (line: string) =>
    line
      .trim()
      .replace(/^\||\|$/g, "")
      .split("|")
      .map((cell) => cell.trim());

  for (const line of source.split("\n")) {
    const text = line.trim();
    if (!text) continue;
    const last = blocks[blocks.length - 1];

    if (text.startsWith("## ")) blocks.push({ kind: "section", text: text.slice(3) });
    else if (text.startsWith("# ")) blocks.push({ kind: "title", text: text.slice(2) });
    else if (text.startsWith("- ")) {
      if (last?.kind === "ul") last.items.push(text.slice(2));
      else blocks.push({ kind: "ul", items: [text.slice(2)] });
    } else if (text.startsWith("|")) {
      if (/^\|[\s|:-]+\|$/.test(text)) continue; // the --- divider row
      if (last?.kind === "table") last.rows.push(cells(text));
      else blocks.push({ kind: "table", head: cells(text), rows: [] });
    } else blocks.push({ kind: "p", text });
  }
  return blocks;
}

/** **bold** and [placeholders] inside a run of text. */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\[[^\]]+\])/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-medium">
          {inline(part.slice(2, -2))}
        </strong>
      );
    }
    if (part.startsWith("[") && part.endsWith("]")) {
      return (
        <mark key={index} className="bg-primary/15 px-0.5 text-ink">
          {part}
        </mark>
      );
    }
    return part;
  });
}

export function LegalDocument({ source }: { source: string }) {
  const blocks = parse(source);
  const title = blocks.find((block) => block.kind === "title");
  const sections = blocks.filter((block) => block.kind === "section");
  const open = (source.match(/\[[^\]]+\]/g) ?? []).length;
  const showDraftNotice = open > 0 && process.env.NODE_ENV !== "production";

  return (
    <section className="bg-surface px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pb-24 lg:pt-24">
      {showDraftNotice && (
        <p className="mb-10 max-w-2xl border border-primary/40 bg-primary/10 px-4 py-3 font-sans text-sm leading-relaxed text-ink">
          Development view: {open} open placeholder{open === 1 ? "" : "s"}{" "}
          (highlighted below). On the live site this page shows &ldquo;Coming
          soon&rdquo; until every one is filled in.
        </p>
      )}

      <h1 className="text-5xl leading-[0.95] tracking-[-0.045em] text-ink sm:text-6xl">
        {title?.kind === "title" ? title.text : ""}
      </h1>

      <div className="mt-12 grid gap-12 border-t border-outline pt-8 lg:grid-cols-12 lg:gap-16">
        <nav aria-label="Contents" className="font-sans text-sm lg:col-span-3">
          <p className="text-ink-muted">Contents</p>
          <ol className="mt-4 flex flex-col gap-2 lg:sticky lg:top-28">
            {sections.map((section, index) =>
              section.kind === "section" ? (
                <li key={section.text}>
                  <a
                    href={`#section-${index + 1}`}
                    className="text-ink-muted transition-colors hover:text-ink"
                  >
                    {index + 1}. {section.text}
                  </a>
                </li>
              ) : null,
            )}
          </ol>
        </nav>

        <div className="max-w-2xl lg:col-span-9">
          {blocks.map((block, index) => {
            switch (block.kind) {
              case "title":
                return null;
              case "section": {
                const sectionNumber =
                  blocks.slice(0, index).filter((b) => b.kind === "section").length + 1;
                return (
                  <h2
                    key={index}
                    id={`section-${sectionNumber}`}
                    className="mt-14 scroll-mt-28 border-t border-outline pt-8 text-2xl leading-tight tracking-[-0.03em] text-ink first:mt-0 first:border-t-0 first:pt-0"
                  >
                    <span className="mr-3 text-ink-muted">{sectionNumber}.</span>
                    {block.text}
                  </h2>
                );
              }
              case "p":
                return (
                  <p
                    key={index}
                    className="mt-4 font-sans text-sm leading-relaxed text-ink"
                  >
                    {inline(block.text)}
                  </p>
                );
              case "ul":
                return (
                  <ul
                    key={index}
                    className="mt-4 list-disc space-y-2 pl-5 font-sans text-sm leading-relaxed text-ink marker:text-ink-muted"
                  >
                    {block.items.map((item, itemIndex) => (
                      <li key={itemIndex}>{inline(item)}</li>
                    ))}
                  </ul>
                );
              case "table":
                return (
                  <div key={index} className="mt-6 overflow-x-auto">
                    <table className="w-full min-w-[32rem] border-collapse text-left font-sans text-sm leading-relaxed">
                      <thead>
                        <tr>
                          {block.head.map((cell, cellIndex) => (
                            <th
                              key={cellIndex}
                              className="border-b border-ink px-3 py-2 font-medium text-ink"
                            >
                              {inline(cell)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {block.rows.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                              <td
                                key={cellIndex}
                                className="border-b border-outline px-3 py-3 align-top text-ink"
                              >
                                {inline(cell)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
            }
          })}
        </div>
      </div>
    </section>
  );
}
