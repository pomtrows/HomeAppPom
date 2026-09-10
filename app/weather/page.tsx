"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { svgWeather, wmoGroup, wmoDesc } from "@/lib/weather-icons";
import { fmtFullDate, fmtDayLong } from "@/lib/format";

const DAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

type HourEntry = { hh: number; temp: number; rain: number; svg: string };
type WeatherData = {
  current: any;
  daily: any;
  hourly: any;
  city?: string;
};

function hoursForDay(
  hourly: any,
  dateStr: string,
  filterPast: boolean
): HourEntry[] {
  const now = new Date();
  const currentHour = filterPast ? now.getHours() : -1;
  const out: HourEntry[] = [];
  for (let i = 0; i < hourly.time.length; i++) {
    const t = hourly.time[i];
    if (!t.startsWith(dateStr)) continue;
    const hh = parseInt(t.slice(11, 13));
    if (hh < currentHour) continue;
    out.push({
      hh,
      temp: Math.round(hourly.temperature_2m[i]),
      rain: hourly.precipitation_probability[i],
      svg: svgWeather(wmoGroup(hourly.weather_code[i]), 28, !!hourly.is_day[i]),
    });
  }
  return out;
}

export default function WeatherPage() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [error, setError] = useState(false);
  const [openDayIdx, setOpenDayIdx] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/weather")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <div className="max-w-[420px] mx-auto px-4 py-6">
        <PageHeader title="Météo" />
        <p className="text-center text-bad py-8 text-sm">
          Impossible de charger la météo.
          <br />
          Vérifie ta connexion internet.
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-[420px] mx-auto px-4 py-6">
        <PageHeader title="Météo" />
        <p className="text-center text-muted py-10 text-sm">
          Chargement de la météo…
        </p>
      </div>
    );
  }

  const cur = data.current;
  const daily = data.daily;
  const hourly = data.hourly;
  const grp = wmoGroup(cur.weather_code);
  const mainSvg = svgWeather(grp, 110, !!cur.is_day);
  const dayLabel = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayHours = hoursForDay(hourly, todayStr, true);

  return (
    <div className="max-w-[420px] mx-auto px-4 py-6">
      <PageHeader title={data.city ?? "Météo"} right={dayLabel} />

      <div className="bg-surface border border-line rounded-card p-6 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 80% 10%, rgba(88,166,255,0.06) 0%, transparent 60%)",
          }}
        />
        <div
          className="flex justify-center my-1 mb-3"
          dangerouslySetInnerHTML={{ __html: mainSvg }}
        />
        <div className="text-center font-display text-6xl leading-none tracking-[-0.03em]">
          {Math.round(cur.temperature_2m)}
          <span className="text-2xl text-muted">°C</span>
        </div>
        <div className="text-center text-[13px] text-muted mt-1 tracking-wide">
          ↓ {Math.round(daily.temperature_2m_min[0])}° · ↑{" "}
          {Math.round(daily.temperature_2m_max[0])}°
        </div>
        <div className="text-center text-sm text-fg mt-2 font-light">
          {wmoDesc(cur.weather_code)}
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          <Stat label="Vent" value={`${Math.round(cur.wind_speed_10m)} km/h`} />
          <Stat
            label="Pluie"
            value={`${daily.precipitation_probability_max[0]}%`}
          />
          <Stat
            label="Humidité"
            value={`${cur.relative_humidity_2m}%`}
          />
          <Stat
            label="Rafales"
            value={`${Math.round(daily.wind_speed_10m_max[0])} km/h`}
          />
        </div>
      </div>

      <div className="pt-4">
        <SectionTitle>Heure par heure</SectionTitle>
        <HourlyScroll hours={todayHours} />
      </div>

      <div className="mt-5">
        <SectionTitle>4 prochains jours</SectionTitle>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => {
            const d = new Date(daily.time[i]);
            const fg = wmoGroup(daily.weather_code[i]);
            return (
              <div
                key={i}
                onClick={() =>
                  setOpenDayIdx(openDayIdx === i ? null : i)
                }
                className={`bg-surface border rounded-card2 px-1 py-2.5 text-center cursor-pointer transition-colors ${
                  openDayIdx === i
                    ? "border-accent/35 bg-accent/5"
                    : "border-line"
                }`}
              >
                <div className="text-[11px] text-muted mb-1">
                  {DAYS[d.getDay()]}
                </div>
                <div
                  className="flex justify-center"
                  dangerouslySetInnerHTML={{ __html: svgWeather(fg, 36, true) }}
                />
                <div className="text-sm font-medium mt-1">
                  {Math.round(daily.temperature_2m_max[i])}°
                </div>
                <div className="text-xs text-muted">
                  {Math.round(daily.temperature_2m_min[i])}°
                </div>
                <div className="text-[11px] text-accent mt-0.5">
                  {daily.precipitation_probability_max[i]}%
                </div>
              </div>
            );
          })}
        </div>

        {openDayIdx !== null && (
          <div className="mt-2 bg-surface border border-line rounded-card2 p-2.5">
            <SectionTitle>
              {fmtDayLong(new Date(daily.time[openDayIdx]))} — heure par heure
            </SectionTitle>
            <HourlyScroll
              hours={hoursForDay(hourly, daily.time[openDayIdx], false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-2 border border-line rounded-card2 px-3.5 py-2.5">
      <div className="text-[11px] text-muted uppercase tracking-wider">
        {label}
      </div>
      <div className="text-lg font-medium mt-0.5">{value}</div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] text-muted uppercase tracking-wider mb-2">
      {children}
    </div>
  );
}

function HourlyScroll({ hours }: { hours: HourEntry[] }) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
      {hours.map((h, idx) => (
        <div
          key={idx}
          className="min-w-[58px] bg-surface-2 border border-line rounded-card2 px-1 py-2 text-center shrink-0"
        >
          <div className="text-[11px] text-muted">
            {String(h.hh).padStart(2, "0")}h
          </div>
          <div
            className="flex justify-center my-1"
            dangerouslySetInnerHTML={{ __html: h.svg }}
          />
          <div className="text-sm font-medium">{h.temp}°</div>
          <div className="text-[11px] text-accent mt-0.5">{h.rain}%</div>
        </div>
      ))}
    </div>
  );
}
