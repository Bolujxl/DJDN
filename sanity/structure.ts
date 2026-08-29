import type { StructureResolver } from "sanity/structure";
import { PackageIcon, TagIcon, DocumentTextIcon, UserIcon } from "@sanity/icons";

/** Studio sidebar — Shop content grouped away from the journal. */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("DJDN")
    .items([
      S.listItem()
        .title("Products")
        .icon(PackageIcon)
        .child(S.documentTypeList("product").title("Products")),
      S.listItem()
        .title("Categories")
        .icon(TagIcon)
        .child(S.documentTypeList("category").title("Categories")),
      S.divider(),
      S.listItem()
        .title("Journal")
        .icon(DocumentTextIcon)
        .child(S.documentTypeList("blogPost").title("Journal posts")),
      S.listItem()
        .title("Authors")
        .icon(UserIcon)
        .child(S.documentTypeList("author").title("Authors")),
    ]);
