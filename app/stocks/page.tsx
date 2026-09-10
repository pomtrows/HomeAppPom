"use client";

import useSWR from "swr";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { fetcher } from "@/lib/fetcher";
import type { StocksData } from "@/lib/types";

const DEFAULT_STOCKS = "AAPL,MSFT,NVDA,SPY,QQQ";
const DEFAULT_CRYPTO = "BTC,ETH";

function fmtNum(v: number): string {
  return v.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function StocksPage() {
  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR<StocksData>("/api/stocks", fetcher, {
    refreshInterval: 300000,
    revalidateOnFocus: false,
  });
  const { data: settings } = useSWR<Record<string, string>>(
    "/api/settings",
    fetcher
  );

  const [showEdit, setShowEdit] = useState(false);
  const [stockSymbols, setStockSymbols] = useState("");
  const [cryptoSymbols, setCryptoSymbols] = useState("");

  function openEdit() {
    setStockSymbols(settings?.stock_symbols ?? DEFAULT_STOCKS);
    setCryptoSymbols(settings?.crypto_symbols ?? DEFAULT_CRYPTO);
    setShowEdit(true);
  }

  async function saveEdit() {
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "stock_symbols", value: stockSymbols }),
    });
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "crypto_symbols", value: cryptoSymbols }),
    });
    setShowEdit(false);
    mutate();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <PageHeader
        title="Marchés"
        right={
          <button
            onClick={showEdit ? () => setShowEdit(false) : openEdit}
            className="text-accent border border-accent/25 rounded-card2 px-3 py-1 text-xs"
          >
            {showEdit ? "Annuler" : "Modifier"}
          </button>
        }
      />

      {showEdit && (
        <div className="bg-surface border border-line rounded-card p-4 space-y-3 mb-4">
          <label className="block">
            <span className="text-[11px] text-muted uppercase tracking-wider">
              Actions (séparées par des virgules)
            </span>
            <input
              value={stockSymbols}
              onChange={(e) => setStockSymbols(e.target.value)}
              className="mt-1 w-full bg-bg border border-line rounded-card2 px-3 py-2 text-sm outline-none focus:border-accent/40"
            />
          </label>
          <label className="block">
            <span className="text-[11px] text-muted uppercase tracking-wider">
              Cryptos (séparées par des virgules)
            </span>
            <input
              value={cryptoSymbols}
              onChange={(e) => setCryptoSymbols(e.target.value)}
              className="mt-1 w-full bg-bg border border-line rounded-card2 px-3 py-2 text-sm outline-none focus:border-accent/40"
            />
          </label>
          <button
            onClick={saveEdit}
            className="w-full bg-accent-dim text-accent border border-accent/25 rounded-card2 py-2 text-sm font-medium"
          >
            Enregistrer
          </button>
        </div>
      )}

      {isLoading && !data ? (
        <p className="text-center text-muted py-10 text-sm">
          Chargement des cours…
        </p>
      ) : error ? (
        <p className="text-center text-bad py-10 text-sm">
          Impossible de charger les cours. Vérifie la clé AlphaVantage.
        </p>
      ) : (
        <>
          {data && data.stocks.length > 0 && (
            <div className="mb-5">
              <h2 className="text-[11px] text-muted uppercase tracking-wider mb-2">
                Actions
              </h2>
              <ul className="space-y-2">
                {data.stocks.map((s) => {
                  const up = s.changePercent >= 0;
                  return (
                    <li
                      key={s.symbol}
                      className="flex items-center justify-between bg-surface border border-line rounded-card2 px-3 py-2.5"
                    >
                      <span className="text-sm font-medium">{s.symbol}</span>
                      <div className="text-right">
                        <div className="text-sm">{fmtNum(s.price)}</div>
                        <div
                          className={`text-xs ${
                            up ? "text-good" : "text-bad"
                          }`}
                        >
                          {up ? "+" : ""}
                          {s.changePercent.toFixed(2)}%
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {data && data.crypto.length > 0 && (
            <div>
              <h2 className="text-[11px] text-muted uppercase tracking-wider mb-2">
                Crypto
              </h2>
              <ul className="space-y-2">
                {data.crypto.map((c) => (
                  <li
                    key={c.symbol}
                    className="flex items-center justify-between bg-surface border border-line rounded-card2 px-3 py-2.5"
                  >
                    <span className="text-sm font-medium">{c.symbol}</span>
                    <div className="text-sm">{fmtNum(c.price)} $</div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data && (
            <p className="text-[11px] text-faint text-center mt-6">
              Mis à jour à {new Date(data.cachedAt).toLocaleTimeString("fr-FR")}
              {" · "}Source : AlphaVantage
            </p>
          )}
        </>
      )}
    </div>
  );
}
