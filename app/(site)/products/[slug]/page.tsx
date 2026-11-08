import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductDetail } from "@/components/product-detail";
import { CATALOGUE } from "@/lib/catalogue";

export function generateStaticParams() {
  return CATALOGUE.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = CATALOGUE.find((p) => p.slug === slug);
  if (!product) return {};

  // Share previews lead with the model photo, falling back to the bare product.
  const colourway = product.colourways[0];
  const photo = colourway.look ?? colourway.product;
  const images = photo
    ? [{ url: photo, alt: `${product.name}, ${colourway.name}` }]
    : undefined;

  return {
    title: product.name,
    description: product.description,
    openGraph: { title: product.name, description: product.description, images },
    twitter: { card: "summary_large_image", images },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = CATALOGUE.find((p) => p.slug === slug);
  if (!product) notFound();

  return <ProductDetail product={product} />;
}
