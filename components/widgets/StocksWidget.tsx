"use client";

import useSWR from "swr";
import { WidgetCard } from "@/components/WidgetCard";
import { fetcher } from "@/lib/fetcher";
import type { StocksData } from "@/lib/types";

function fmtNum(v: number): string {
  return v.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function StocksWidget() {
  const { data } = useSWR<StocksData>("/api/stocks", fetcher, {
    refreshInterval: 300000,
    revalidateOnFocus: false,
  });

  if (!data) {
    return <WidgetCard href="/stocks" title="Marchés" subtitle="Chargement…" />;
  }

  const rows: Array<{ symbol: string; price: string; change: number | null }> = [
    ...data.stocks.slice(0, 3).map((s) => ({
      symbol: s.symbol,
      price: fmtNum(s.price),
      change: s.changePercent,
    })),
    ...data.crypto.slice(0, 1).map((c) => ({
      symbol: c.symbol,
      price: fmtNum(c.price),
      change: null,
    })),
  ];

  return (
    <WidgetCard href="/stocks" title="Marchés" subtitle="Actions & crypto">
      <ul className="space-y-1.5">
        {rows.map((r) => {
          const up = r.change !== null && r.change >= 0;
          return (
            <li
              key={r.symbol}
              className="flex items-center justify-between text-sm"
            >
              <span className="font-medium">{r.symbol}</span>
              <span className="flex items-center gap-3">
                <span className="text-muted">{r.price}</span>
                {r.change !== null && (
                  <span className={up ? "text-good" : "text-bad"}>
                    {up ? "+" : ""}
                    {r.change.toFixed(2)}%
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </WidgetCard>
  );
}
