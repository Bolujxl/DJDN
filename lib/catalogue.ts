import type { TileProduct } from "@/components/product-tile";

/**
 * Shared catalogue for the homepage grids and the shop pages. A plain data
 * file for now (Sanity isn't connected yet); the shape follows the Sanity
 * product schema: a product has colourways, and each colourway has its own
 * photos. Prices are in kobo, like everywhere else.
 *
 * Department tags are a first guess based on who models each piece in the
 * campaign photos; correct them as the real range is decided.
 */
export type Department = "men" | "women";
export type Category = "tops" | "outerwear" | "shorts";

export type Colourway = {
  name: string;
  /** Hex used for the swatch dot. */
  swatch: string;
  /** Bare product on white. */
  product?: string;
  /** On model. */
  look?: string;
};

export type Product = {
  slug: string;
  name: string;
  price: number;
  departments: Department[];
  category: Category;
  isNew?: boolean;
  colourways: Colourway[];
};

export const CATEGORY_LABELS: Record<Category, string> = {
  tops: "Tops",
  outerwear: "Outerwear",
  shorts: "Shorts",
};

export const CATALOGUE: Product[] = [
  {
    slug: "track-jacket",
    name: "Track Jacket",
    price: 5200000,
    departments: ["men", "women"],
    category: "outerwear",
    isNew: true,
    colourways: [
      {
        name: "Bottle Green",
        swatch: "#174529",
        product: "/brand/products/green-track-jacket.jpg",
      },
    ],
  },
  {
    slug: "swirl-jersey",
    name: "Swirl Jersey",
    price: 3400000,
    departments: ["men", "women"],
    category: "tops",
    isNew: true,
    colourways: [
      {
        name: "Green",
        swatch: "#3ddc84",
        product: "/brand/products/swirl-jersey-green.jpg",
      },
    ],
  },
  {
    slug: "floral-wordmark-tank",
    name: "Floral Wordmark Tank",
    price: 2400000,
    departments: ["men", "women"],
    category: "tops",
    isNew: true,
    colourways: [
      {
        name: "White",
        swatch: "#f1f1ef",
        product: "/brand/products/floral-wordmark-tank.jpg",
      },
    ],
  },
  {
    slug: "weekend-popover",
    name: "Weekend Popover",
    price: 3800000,
    departments: ["men"],
    category: "tops",
    isNew: true,
    colourways: [
      {
        name: "Cream",
        swatch: "#ece2cf",
        product: "/brand/products/linen-popover-cream.jpg",
        look: "/brand/lookbook/shirt-weekend-popover-cream.jpg",
      },
    ],
  },
  {
    slug: "swirl-polo",
    name: "Swirl Polo",
    price: 3400000,
    departments: ["men", "women"],
    category: "tops",
    colourways: [
      {
        name: "Red",
        swatch: "#d8301f",
        product: "/brand/products/swirl-polo-red.jpg",
        look: "/brand/lookbook/shirt-swirl-polo-red.jpg",
      },
      {
        name: "Monochrome",
        swatch: "#9a9a97",
        product: "/brand/products/swirl-polo-mono.jpg",
        look: "/brand/lookbook/shirt-swirl-polo-mono.jpg",
      },
    ],
  },
  {
    slug: "boxy-polo",
    name: "Boxy Polo",
    price: 3000000,
    departments: ["women"],
    category: "tops",
    colourways: [
      {
        name: "Black",
        swatch: "#1c1c1c",
        product: "/brand/products/boxy-polo-black.jpg",
        look: "/brand/lookbook/shirt-boxy-polo-black.jpg",
      },
    ],
  },
  {
    slug: "corduroy-shorts",
    name: "Corduroy Shorts",
    price: 2600000,
    departments: ["men"],
    category: "shorts",
    colourways: [
      {
        name: "Navy",
        swatch: "#1f2a55",
        product: "/brand/products/navy-corduroy-shorts.jpg",
        look: "/brand/lookbook/shorts-corduroy-navy.jpg",
      },
    ],
  },
  {
    slug: "cargo-shorts",
    name: "Cargo Shorts",
    price: 2400000,
    departments: ["women"],
    category: "shorts",
    colourways: [
      {
        name: "Olive",
        swatch: "#5c6b34",
        product: "/brand/products/olive-cargo-shorts.jpg",
        look: "/brand/lookbook/shorts-cargo-olive.jpg",
      },
    ],
  },
  {
    slug: "relaxed-cargo",
    name: "Relaxed Cargo",
    price: 2500000,
    departments: ["women"],
    category: "shorts",
    colourways: [
      {
        name: "Olive",
        swatch: "#5c6b34",
        look: "/brand/lookbook/shorts-cargo-olive-back.jpg",
      },
    ],
  },
];

function bySlug(slug: string): Product {
  const product = CATALOGUE.find((p) => p.slug === slug);
  if (!product) throw new Error(`Unknown product: ${slug}`);
  return product;
}

/**
 * A homepage tile for one colourway of a product. Defaults to the model photo
 * with the bare product on hover; `productFirst` flips that. Falls back to
 * whichever photo exists when a colourway has only one.
 */
export function tileFor(
  slug: string,
  colour: string,
  options: { productFirst?: boolean } = {},
): TileProduct {
  const product = bySlug(slug);
  const colourway = product.colourways.find((c) => c.name === colour);
  if (!colourway) throw new Error(`Unknown colourway: ${slug} / ${colour}`);

  const productFirst = options.productFirst || !colourway.look;
  const primary = productFirst
    ? (colourway.product ?? colourway.look!)
    : (colourway.look ?? colourway.product!);
  const other = productFirst ? colourway.look : colourway.product;

  return {
    name: `${product.name} — ${colourway.name}`,
    price: product.price,
    image: primary,
    hoverImage: other && other !== primary ? other : undefined,
    hoverFit: productFirst ? "cover" : "contain",
  };
}
