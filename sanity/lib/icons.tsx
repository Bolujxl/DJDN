import { Icon, type IconSymbol } from "@sanity/icons";

/**
 * `@sanity/icons` 5.2.1 declares named icon exports (`PackageIcon`,
 * `TagIcon`, …) in its types that don't actually exist in the compiled
 * runtime — only the generic `Icon` + symbol works. This wraps that so the
 * schema files can use familiar names without hitting the broken exports.
 */
function schemaIcon(symbol: IconSymbol) {
  return function SchemaIcon() {
    return <Icon symbol={symbol} />;
  };
}

export const PackageIcon = schemaIcon("package");
export const TagIcon = schemaIcon("tag");
export const UserIcon = schemaIcon("user");
export const DocumentTextIcon = schemaIcon("document-text");
