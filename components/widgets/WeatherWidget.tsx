"use client";

import { useEffect, useState } from "react";
import { WidgetCard } from "@/components/WidgetCard";
import { svgWeather, wmoGroup, wmoDesc } from "@/lib/weather-icons";

export function WeatherWidget() {
  const [data, setData] = useState<any>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch("/api/weather")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setFailed(true));
  }, []);

  if (failed) {
    return (
      <WidgetCard href="/weather" title="Météo" subtitle="Neuilly-sur-Seine">
        <p className="text-sm text-muted">Indisponible</p>
      </WidgetCard>
    );
  }

  if (!data) {
    return (
      <WidgetCard href="/weather" title="Météo" subtitle="Chargement…" />
    );
  }

  const cur = data.current;
  const city = data.city ?? "Neuilly-sur-Seine";
  return (
    <WidgetCard href="/weather" title="Météo" subtitle={city}>
      <div className="flex items-center gap-3">
        <div
          dangerouslySetInnerHTML={{
            __html: svgWeather(wmoGroup(cur.weather_code), 48, !!cur.is_day),
          }}
        />
        <div>
          <div className="font-display text-3xl leading-none">
            {Math.round(cur.temperature_2m)}°
          </div>
          <div className="text-sm text-muted mt-1">{wmoDesc(cur.weather_code)}</div>
          <div className="text-sm text-accent mt-1">
            Pluie : {data.daily.precipitation_probability_max[0]}%
          </div>
        </div>
      </div>
    </WidgetCard>
  );
}
