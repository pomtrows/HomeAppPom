"use client";

import { useEffect, useState } from "react";
import { WidgetCard } from "@/components/WidgetCard";
import { fetchStations } from "@/lib/fuel";
import { fmtPrice, fmtDist } from "@/lib/format";
import type { GasStation } from "@/lib/types";

export function GasStationWidget() {
  const [station, setStation] = useState<GasStation | null>(null);
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("error");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const s = await fetchStations(pos.coords.latitude, pos.coords.longitude);
          setStation(s[0] ?? null);
          setStatus("done");
        } catch {
          setStatus("error");
        }
      },
      () => setStatus("error"),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 600000 }
    );
  }, []);

  return (
    <WidgetCard
      href="/gas-station"
      title="Carburant"
      subtitle="SP95-E10 la plus proche"
    >
      {status === "loading" && (
        <p className="text-sm text-muted">Localisation…</p>
      )}
      {status === "error" && (
        <p className="text-sm text-muted">Ouvrir pour localiser</p>
      )}
      {status === "done" && station && (
        <div className="flex items-center justify-between">
          <div className="font-display text-3xl text-good">
            {fmtPrice(station.e10_prix)}
            <span className="text-xs text-muted"> €/L</span>
          </div>
          <div className="text-xs text-muted">📍 {fmtDist(station.dist)}</div>
        </div>
      )}
      {status === "done" && !station && (
        <p className="text-sm text-muted">Aucune station à proximité</p>
      )}
    </WidgetCard>
  );
}
