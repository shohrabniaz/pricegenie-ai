"use client";

import Image from "next/image";
import { useState } from "react";
import { getProductImageUrl } from "@/lib/product-images";
import type { Product } from "@/types";

interface ProductImageProps {
  product: Pick<Product, "id" | "name" | "brand" | "category" | "image">;
  size?: "card" | "detail";
  className?: string;
}

const SIZES = {
  card: { width: 80, height: 80, container: "h-20 w-20" },
  detail: { width: 280, height: 280, container: "h-56 w-full max-w-xs" },
};

export function ProductImage({
  product,
  size = "card",
  className = "",
}: ProductImageProps) {
  const [src, setSrc] = useState(getProductImageUrl(product));
  const dims = SIZES[size];

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-white/10 ${dims.container} ${className}`}
      data-testid={`product-image-${product.id}`}
    >
      <Image
        src={src}
        alt={product.name}
        width={dims.width}
        height={dims.height}
        unoptimized
        className="h-full w-full object-contain p-2"
        onError={() => {
          const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.brand)}&background=1e293b&color=94a3b8&size=256&bold=true`;
          if (src !== fallback) setSrc(fallback);
        }}
      />
    </div>
  );
}
