import { getSetting } from "@/lib/settings";

export const dynamic = "force-dynamic";

const CACHE_TTL = 15 * 60 * 1000;

let cache: { data: unknown; at: number; key: string } | null = null;

function splitSymbols(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET() {
  const key = process.env.ALPHAVANTAGE_API_KEY;
  if (!key) {
    return Response.json({ error: "missing API key" }, { status: 500 });
  }

  const stockSymbols = splitSymbols(
    getSetting("stock_symbols") ?? "AAPL,MSFT,NVDA,SPY,QQQ"
  );
  const cryptoSymbols = splitSymbols(getSetting("crypto_symbols") ?? "BTC,ETH");

  const cacheKey = stockSymbols.join(",") + "|" + cryptoSymbols.join(",");

  if (cache && cache.key === cacheKey && Date.now() - cache.at < CACHE_TTL) {
    return Response.json(cache.data);
  }

  const stocks: Array<{
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
  }> = [];

  for (const sym of stockSymbols) {
    try {
      await sleep(1100);
      const r = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(
          sym
        )}&apikey=${key}`
      );
      const j = await r.json();
      const q = j["Global Quote"];
      if (q && q["05. price"]) {
        stocks.push({
          symbol: sym,
          price: parseFloat(q["05. price"]),
          change: parseFloat(q["09. change"]),
          changePercent: parseFloat(
            String(q["10. change percent"]).replace("%", "")
          ),
        });
      }
    } catch {
      /* ignore */
    }
  }

  const crypto: Array<{ symbol: string; price: number }> = [];

  for (const sym of cryptoSymbols) {
    try {
      await sleep(1100);
      const r = await fetch(
        `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${sym}&to_currency=USD&apikey=${key}`
      );
      const j = await r.json();
      const q = j["Realtime Currency Exchange Rate"];
      if (q && q["5. Exchange Rate"]) {
        crypto.push({ symbol: sym, price: parseFloat(q["5. Exchange Rate"]) });
      }
    } catch {
      /* ignore */
    }
  }

  const data = {
    stocks,
    crypto,
    cachedAt: new Date().toISOString(),
  };

  cache = { data, at: Date.now(), key: cacheKey };

  return Response.json(data);
}
