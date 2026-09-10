export async function fetcher<T = unknown>(url: string): Promise<T> {
  const r = await fetch(url);
  if (!r.ok) throw new Error("fetch error");
  return r.json();
}
