import type { GasStation } from "./types";

export const RADIUS = 20000; // 20 km
const TARGET = 12; // résultats souhaités dans le rayon
const MAX_FETCH = 1000; // limite totale de stations récupérées
const PAGE = 100;

function buildUrl(
  lat: number,
  lon: number,
  limit: number,
  offset: number
): string {
  const point = `geom'POINT(${lon} ${lat})'`;
  return (
    `https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/records` +
    `?limit=${limit}&offset=${offset}` +
    `&select=id,adresse,ville,cp,geom,e10_prix,e10_maj,distance(geom,${point}) as dist` +
    `&where=e10_prix is not null` +
    `&order_by=distance(geom,${point})` +
    `&timezone=Europe/Paris`
  );
}

export async function fetchStations(
  lat: number,
  lon: number
): Promise<GasStation[]> {
  let all: GasStation[] = [];
  let offset = 0;
  while (offset < MAX_FETCH) {
    const r = await fetch(buildUrl(lat, lon, PAGE, offset));
    if (!r.ok) throw new Error("API error");
    const d = await r.json();
    all = all.concat(d.results);
    const inRadius = all.filter((s) => s.dist <= RADIUS).length;
    if (inRadius >= TARGET || d.results.length === 0) break;
    offset += PAGE;
  }
  return all
    .filter((s) => s.dist <= RADIUS && s.e10_prix !== null)
    .sort((a, b) => a.e10_prix - b.e10_prix)
    .slice(0, 10);
}

export async function geocode(city: string) {
  const r = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      city
    )}&count=1&language=fr&format=json`
  );
  if (!r.ok) throw new Error("geo error");
  const d = await r.json();
  if (!d.results || !d.results.length) return null;
  return d.results[0];
}

export async function reverseGeocode(lat: number, lon: number) {
  const r = await fetch(
    `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&count=1&language=fr&format=json`
  );
  if (!r.ok) throw new Error("geo error");
  const d = await r.json();
  if (!d.results || !d.results.length) return null;
  return d.results[0];
}

export function placeLabel(place: any): string | null {
  return place
    ? `${place.name}${place.admin1 ? " (" + place.admin1 + ")" : ""}`
    : null;
}
