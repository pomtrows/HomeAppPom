import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { links } from "@/lib/schema";

export const dynamic = "force-dynamic";

function faviconFor(url: string): string | null {
  try {
    const host = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${host}&sz=64`;
  } catch {
    return null;
  }
}

export async function GET() {
  const rows = db
    .select()
    .from(links)
    .orderBy(asc(links.sortOrder), asc(links.createdAt))
    .all();
  return Response.json({ links: rows });
}

export async function POST(req: Request) {
  const body = await req.json();
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const url = typeof body.url === "string" ? body.url.trim() : "";
  if (!title || !url) {
    return Response.json({ error: "title and url required" }, { status: 400 });
  }

  let normalized = url;
  if (!/^https?:\/\//i.test(normalized)) normalized = `https://${normalized}`;

  const rows = db.select().from(links).all();
  const sortOrder = rows.length ? Math.max(...rows.map((r) => r.sortOrder)) + 1 : 0;

  const id = crypto.randomUUID();
  db.insert(links)
    .values({
      id,
      title,
      url: normalized,
      faviconUrl: faviconFor(normalized),
      sortOrder,
      createdAt: new Date().toISOString(),
    })
    .run();

  return Response.json({ id });
}
