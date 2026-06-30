"use client";

import { useEffect, useState } from "react";
import type { Product, Retailer } from "@/types";
import { CATALOG_PRICE_UPDATED_AT } from "@/data/catalog-meta";
import type { PriceSource } from "@/lib/price-feed";

interface PriceApiResponse {
  product: Product;
  pricesUpdatedAt: string;
  source: PriceSource;
  liveOfferCount: number;
}

interface LivePriceApiResponse extends PriceApiResponse {
  liveVerifiedRetailers: Retailer[];
  liveFetchedAt: string | null;
}

export function useProductPrices(catalogProduct: Product | undefined) {
  const [priced, setPriced] = useState<PriceApiResponse | null>(null);
  const [liveVerifiedRetailers, setLiveVerifiedRetailers] = useState<Retailer[]>(
    []
  );
  const [liveFetching, setLiveFetching] = useState(false);

  useEffect(() => {
    if (!catalogProduct) return;

    const controller = new AbortController();

    fetch(`/api/prices/${catalogProduct.id}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: PriceApiResponse | null) => {
        if (data?.product) setPriced(data);
      })
      .catch(() => {
        /* keep catalog fallback */
      });

    return () => controller.abort();
  }, [catalogProduct]);

  useEffect(() => {
    if (!catalogProduct) return;

    const controller = new AbortController();

    void Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        setLiveFetching(true);
      }
    });

    fetch(`/api/prices/${catalogProduct.id}/live`, {
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: LivePriceApiResponse | null) => {
        if (!data?.product) return;
        setPriced(data);
        setLiveVerifiedRetailers(data.liveVerifiedRetailers ?? []);
      })
      .catch(() => {
        /* keep snapshot/catalog fallback */
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLiveFetching(false);
        }
      });

    return () => controller.abort();
  }, [catalogProduct]);

  const product = priced?.product ?? catalogProduct;
  const pricesUpdatedAt =
    priced?.pricesUpdatedAt ??
    catalogProduct?.pricesUpdatedAt ??
    CATALOG_PRICE_UPDATED_AT;
  const source = priced?.source ?? "catalog";
  const liveOfferCount = priced?.liveOfferCount ?? 0;

  return {
    product,
    pricesUpdatedAt,
    source,
    liveOfferCount,
    liveVerifiedRetailers,
    liveFetching,
  };
}
