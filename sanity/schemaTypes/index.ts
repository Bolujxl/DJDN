import type { SchemaTypeDefinition } from "sanity";

import { blockContent } from "./blockContent";
import { category } from "./category";
import { product } from "./product";
import { author } from "./author";
import { blogPost } from "./blogPost";

export const schemaTypes: SchemaTypeDefinition[] = [
  // Objects
  blockContent,
  // Documents
  product,
  category,
  blogPost,
  author,
];
