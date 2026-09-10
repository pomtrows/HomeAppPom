import { getSetting } from "@/lib/settings";

export const dynamic = "force-dynamic";

const DEFAULT_LAT = 48.8845;
const DEFAULT_LON = 2.2682;

export async function GET() {
  const lat =
    parseFloat(getSetting("weather_lat") ?? "") || DEFAULT_LAT;
  const lon =
    parseFloat(getSetting("weather_lon") ?? "") || DEFAULT_LON;
  const city = getSetting("weather_city") ?? "Neuilly-sur-Seine";

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,weather_code` +
    `&hourly=temperature_2m,precipitation_probability,weather_code,is_day` +
    `&current=temperature_2m,weather_code,is_day,wind_speed_10m,relative_humidity_2m` +
    `&timezone=Europe%2FParis&forecast_days=6`;

  const r = await fetch(url);
  if (!r.ok) {
    return Response.json({ error: "API error" }, { status: 502 });
  }
  const data = await r.json();
  data.city = city;
  return Response.json(data);
}
