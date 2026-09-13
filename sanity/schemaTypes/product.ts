import { defineArrayMember, defineField, defineType } from "sanity";
import { PackageIcon } from "../lib/icons";

const NGN = (kobo: number | undefined) =>
  typeof kobo === "number"
    ? `₦${(kobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 0 })}`
    : "—";

const HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/**
 * Product catalogue. Money is stored in kobo (integer, lowest NGN unit) —
 * never floats. Base currency is NGN; Flutterwave handles conversion for
 * international cards, so there is no per-currency pricing here in v1.
 *
 * A product ships in one or more colourways; each colourway carries its own
 * images and its own per-size stock. Price is shared across colourways.
 * A cart line item is therefore product + colourway + size.
 */
export const product = defineType({
  name: "product",
  title: "Product",
  type: "document",
  icon: PackageIcon,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "pricing", title: "Pricing" },
    { name: "colourways", title: "Colourways & stock" },
    { name: "organization", title: "Organisation" },
  ],
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      group: "content",
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "content",
      options: { source: "name", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "shortDescription",
      title: "Short description",
      type: "text",
      rows: 2,
      group: "content",
      description: "One or two lines used on cards and meta descriptions.",
      validation: (rule) => rule.max(240),
    }),
    defineField({
      name: "description",
      title: "Full description",
      type: "blockContent",
      group: "content",
    }),
    defineField({
      name: "details",
      title: "Details",
      type: "array",
      group: "content",
      of: [{ type: "string" }],
      description: "Bullet points — fabric, fit, origin, care.",
    }),

    // ---- Pricing (kobo, shared across colourways) ----
    defineField({
      name: "price",
      title: "Price (kobo)",
      type: "number",
      group: "pricing",
      description: "Whole kobo — e.g. ₦48,000 is entered as 4800000. No decimals.",
      validation: (rule) => rule.required().integer().positive().min(1),
    }),
    defineField({
      name: "compareAtPrice",
      title: "Compare-at price (kobo)",
      type: "number",
      group: "pricing",
      description: "Optional. Original price when the item is on sale.",
      validation: (rule) =>
        rule
          .integer()
          .positive()
          .custom((value, ctx) => {
            const price = (ctx.document as { price?: number })?.price;
            if (value && price && value <= price) {
              return "Compare-at price should be higher than the price.";
            }
            return true;
          }),
    }),

    // ---- Colourways & stock ----
    defineField({
      name: "colourways",
      title: "Colourways",
      type: "array",
      group: "colourways",
      description:
        "Each colourway has its own images and its own stock per size.",
      of: [
        defineArrayMember({
          type: "object",
          name: "colourway",
          fields: [
            defineField({
              name: "colourName",
              title: "Colour name",
              type: "string",
              description: 'As shown to customers — e.g. "Olive", "Bone", "Ink".',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "swatchHex",
              title: "Swatch colour",
              type: "string",
              description: "Hex value for the selector dot, e.g. #3F4A2E.",
              validation: (rule) =>
                rule
                  .required()
                  .regex(HEX, { name: "hex colour (#RGB or #RRGGBB)" }),
            }),
            defineField({
              name: "images",
              title: "Images",
              type: "array",
              of: [
                defineArrayMember({
                  type: "image",
                  options: { hotspot: true },
                  fields: [
                    {
                      name: "alt",
                      type: "string",
                      title: "Alt text",
                      validation: (rule) => rule.required(),
                    },
                  ],
                }),
              ],
              validation: (rule) => rule.required().min(1),
            }),
            defineField({
              name: "sizes",
              title: "Sizes",
              type: "array",
              of: [
                defineArrayMember({
                  type: "object",
                  name: "sizeStock",
                  fields: [
                    defineField({
                      name: "size",
                      title: "Size",
                      type: "string",
                      validation: (rule) => rule.required(),
                    }),
                    defineField({
                      name: "stock",
                      title: "Units in stock",
                      type: "number",
                      initialValue: 0,
                      validation: (rule) => rule.required().integer().min(0),
                    }),
                    defineField({ name: "sku", title: "SKU", type: "string" }),
                  ],
                  preview: {
                    select: { title: "size", stock: "stock", sku: "sku" },
                    prepare({ title, stock, sku }) {
                      return {
                        title,
                        subtitle: `${stock ?? 0} in stock${sku ? ` · ${sku}` : ""}`,
                      };
                    },
                  },
                }),
              ],
              validation: (rule) => rule.required().min(1),
            }),
          ],
          preview: {
            select: {
              title: "colourName",
              media: "images.0",
              sizes: "sizes",
            },
            prepare({ title, media, sizes }) {
              const count = Array.isArray(sizes) ? sizes.length : 0;
              return {
                title,
                subtitle: `${count} size${count === 1 ? "" : "s"}`,
                media,
              };
            },
          },
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),

    // ---- Organisation ----
    defineField({
      name: "department",
      title: "Department",
      type: "array",
      group: "organization",
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
      name: "category",
      title: "Category",
      type: "reference",
      group: "organization",
      to: [{ type: "category" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      group: "organization",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      group: "organization",
      options: {
        list: [
          { title: "Active", value: "active" },
          { title: "Draft", value: "draft" },
          { title: "Archived", value: "archived" },
        ],
        layout: "radio",
      },
      initialValue: "draft",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      group: "organization",
      description: "Surface on the homepage and collection highlights.",
      initialValue: false,
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      group: "organization",
      initialValue: () => new Date().toISOString(),
    }),
  ],
  orderings: [
    {
      title: "Newest",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
    {
      title: "Price (low → high)",
      name: "priceAsc",
      by: [{ field: "price", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "name",
      price: "price",
      status: "status",
      media: "colourways.0.images.0",
    },
    prepare({ title, price, status, media }) {
      return {
        title,
        subtitle: `${NGN(price)}${status && status !== "active" ? ` · ${status}` : ""}`,
        media,
      };
    },
  },
});
