"use client";

import useSWR from "swr";
import { WidgetCard } from "@/components/WidgetCard";
import { fetcher } from "@/lib/fetcher";
import type { Meal } from "@/lib/types";

type Data = { meals: Meal[] };

export function MealsWidget() {
  const { data } = useSWR<Data>("/api/meals", fetcher, {
    refreshInterval: 10000,
  });

  const total = data?.meals.length ?? 0;

  return (
    <WidgetCard
      href="/menus"
      title="Repas"
      subtitle={`${total} repas`}
    >
      {!data ? (
        <p className="text-sm text-muted">Chargement…</p>
      ) : (
        <p className="text-sm text-muted">Voir la liste</p>
      )}
    </WidgetCard>
  );
}
