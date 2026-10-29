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
  return product
    ? { title: product.name, description: product.description }
    : {};
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
