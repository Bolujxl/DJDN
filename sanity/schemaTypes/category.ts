import { defineField, defineType } from "sanity";
import { TagIcon } from "@sanity/icons";

/**
 * A product category (Shirts, Trousers, Outerwear, Knitwear …). The Men/Women
 * split lives on the product itself via `department`; a category can belong to
 * both. Categories drive the filterable PLP navigation.
 */
export const category = defineType({
  name: "category",
  title: "Category",
  type: "document",
  icon: TagIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "department",
      title: "Shown under",
      description: "Which top-level listings this category appears in.",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Men", value: "men" },
          { title: "Women", value: "women" },
        ],
        layout: "grid",
      },
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 2,
      description: "Optional intro copy for the category listing page.",
    }),
    defineField({
      name: "order",
      title: "Sort order",
      type: "number",
      description: "Lower numbers appear first in navigation.",
      initialValue: 100,
    }),
  ],
  orderings: [
    {
      title: "Sort order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "department" },
    prepare({ title, subtitle }) {
      return {
        title,
        subtitle: Array.isArray(subtitle) ? subtitle.join(" · ") : subtitle,
      };
    },
  },
});
