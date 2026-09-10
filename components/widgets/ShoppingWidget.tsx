"use client";

import useSWR from "swr";
import { WidgetCard } from "@/components/WidgetCard";
import { fetcher } from "@/lib/fetcher";
import type { Category, ShoppingItem } from "@/lib/types";

type Data = { categories: Category[]; items: ShoppingItem[] };

export function ShoppingWidget() {
  const { data } = useSWR<Data>("/api/shopping", fetcher, {
    refreshInterval: 5000,
  });

  const total = data?.items.length ?? 0;
  const done = data?.items.filter((i) => i.checked === 1).length ?? 0;
  const remaining = total - done;

  return (
    <WidgetCard
      href="/shopping"
      title="Liste de courses"
      subtitle={`${total} article${total > 1 ? "s" : ""}`}
    >
      {!data ? (
        <p className="text-sm text-muted">Chargement…</p>
      ) : remaining > 0 ? (
        <p className="text-sm text-muted">{remaining} à acheter</p>
      ) : (
        <p className="text-sm text-good">Tout est prêt ✓</p>
      )}
    </WidgetCard>
  );
}
