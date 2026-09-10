"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import {
  fetchStations,
  geocode,
  reverseGeocode,
  placeLabel,
  RADIUS,
} from "@/lib/fuel";
import { fmtPrice, fmtDist, fmtMaj, fmtFullDate } from "@/lib/format";
import type { GasStation } from "@/lib/types";

type Phase = "locating" | "loading" | "results" | "manual" | "error";

export default function GasStationPage() {
  const [phase, setPhase] = useState<Phase>("locating");
  const [stations, setStations] = useState<GasStation[]>([]);
  const [label, setLabel] = useState("");
  const [cityInput, setCityInput] = useState("");

  const run = useCallback(async (lat: number, lon: number, label: string) => {
    setLabel(label);
    setPhase("loading");
    try {
      const s = await fetchStations(lat, lon);
      setStations(s);
      setPhase("results");
    } catch {
      setPhase("error");
    }
  }, []);

  const start = useCallback(() => {
    setPhase("locating");
    if (!navigator.geolocation) {
      setPhase("manual");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPhase("loading");
        reverseGeocode(latitude, longitude)
          .then((p) => run(latitude, longitude, placeLabel(p) || "ta position"))
          .catch(() => run(latitude, longitude, "ta position"));
      },
      () => setPhase("manual"),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 600000 }
    );
  }, [run]);

  useEffect(() => {
    start();
  }, [start]);

  async function searchCity() {
    const input = cityInput.trim();
    if (!input) return;
    setPhase("loading");
    try {
      const place = await geocode(input);
      if (!place) {
        setCityInput("");
        setPhase("manual");
        return;
      }
      const lbl = `${place.name}${place.admin1 ? " (" + place.admin1 + ")" : ""}`;
      await run(place.latitude, place.longitude, lbl);
    } catch {
      setPhase("manual");
    }
  }

  const dateLabel = fmtFullDate(new Date());

  if (phase === "manual") {
    return (
      <div className="max-w-[420px] mx-auto px-4 py-6">
        <PageHeader title="Carburant" right={dateLabel} />
        <p className="text-center text-bad text-sm py-3">
          Impossible de te localiser automatiquement.
        </p>
        <div className="bg-surface border border-line rounded-card p-4">
          <h3 className="text-[13px] font-medium mb-2">
            Chercher autour d&apos;une ville
          </h3>
          <div className="space-y-2">
            <input
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") searchCity();
              }}
              placeholder="Ex. : Lyon, 69000…"
              autoFocus
              className="w-full bg-bg border border-line rounded-card2 px-3 py-2.5 text-sm outline-none focus:border-accent/40"
            />
            <button
              onClick={searchCity}
              className="w-full bg-accent-dim text-accent border border-accent/25 rounded-card2 py-2.5 text-sm font-medium"
            >
              Rechercher
            </button>
          </div>
        </div>
        <div className="text-center mt-4">
          <button
            onClick={start}
            className="text-muted border border-line rounded-card2 px-4 py-2 text-xs"
          >
            Réessayer la localisation
          </button>
        </div>
      </div>
    );
  }

  if (phase === "locating" || phase === "loading") {
    return (
      <div className="max-w-[420px] mx-auto px-4 py-6">
        <PageHeader title="Carburant" right={dateLabel} />
        <div className="text-center text-muted text-sm py-10">
          <div className="mx-auto mb-3.5 w-7 h-7 rounded-full border-[3px] border-line border-t-accent animate-spin" />
          {phase === "locating"
            ? "Localisation en cours…"
            : "Localisation trouvée, chargement des prix…"}
        </div>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="max-w-[420px] mx-auto px-4 py-6">
        <PageHeader title="Carburant" right={dateLabel} />
        <p className="text-center text-bad text-sm py-3">
          Impossible de charger les prix des carburants.
          <br />
          Vérifie ta connexion internet.
        </p>
        <div className="text-center mt-4">
          <button
            onClick={start}
            className="text-muted border border-line rounded-card2 px-4 py-2 text-xs"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[420px] mx-auto px-4 py-6">
      <PageHeader title="Carburant" right={dateLabel} />
      <p className="text-[11px] text-faint text-center mb-2">
        SP95-E10 · {RADIUS / 1000} km autour de {label || "ta position"} · le
        moins cher d&apos;abord
      </p>
      <div className="text-center mb-3">
        <button
          onClick={() => setPhase("manual")}
          className="text-muted border border-line rounded-card2 px-4 py-2 text-xs"
        >
          Position erronée · chercher une ville
        </button>
      </div>

      {stations.length === 0 ? (
        <p className="text-center text-muted py-8 text-sm">
          Aucune station SP95-E10 dans un rayon de {RADIUS / 1000} km.
        </p>
      ) : (
        stations.map((s, i) => (
          <div
            key={s.id}
            className={`bg-surface border rounded-card p-4 mb-2.5 relative overflow-hidden ${
              i === 0 ? "border-good/35" : "border-line"
            }`}
          >
            {i === 0 && (
              <span className="absolute top-2.5 right-2.5 bg-good/15 text-good text-[10px] font-medium tracking-wider uppercase px-2 py-0.5 rounded-full">
                Meilleur prix
              </span>
            )}
            <div className="flex items-baseline justify-between gap-2.5">
              <div className="font-display text-3xl tracking-tight text-good">
                {fmtPrice(s.e10_prix)}
                <span className="text-xs text-muted"> €/L</span>
              </div>
              <div className="text-xs text-muted text-right whitespace-nowrap">
                📍 {fmtDist(s.dist)}
              </div>
            </div>
            <div className="text-sm font-medium mt-2">
              {s.adresse || "Station sans adresse"}
            </div>
            <div className="text-xs text-muted mt-0.5">
              {s.cp ? s.cp + " " : ""}
              {s.ville}
            </div>
            <div className="flex items-center justify-between mt-2.5">
              <div className="text-[11px] text-faint">{fmtMaj(s.e10_maj)}</div>
              <a
                className="text-xs text-accent font-medium inline-flex items-center gap-1"
                href={`https://www.google.com/maps/dir/?api=1&destination=${s.geom.lat},${s.geom.lon}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Y aller →
              </a>
            </div>
          </div>
        ))
      )}

      <p className="text-[11px] text-faint text-center mt-4">
        Source : prix-carburants.gouv.fr (open data)
        <br />
        Mis à jour quotidiennement par l&apos;État
      </p>
    </div>
  );
}
