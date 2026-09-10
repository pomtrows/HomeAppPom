import { eq } from "drizzle-orm";
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

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await req.json();

  if (typeof body.title === "string" && body.title.trim()) {
    db.update(links)
      .set({ title: body.title.trim() })
      .where(eq(links.id, id))
      .run();
  }

  if (typeof body.url === "string" && body.url.trim()) {
    let normalized = body.url.trim();
    if (!/^https?:\/\//i.test(normalized)) normalized = `https://${normalized}`;
    db.update(links)
      .set({ url: normalized, faviconUrl: faviconFor(normalized) })
      .where(eq(links.id, id))
      .run();
  }

  return Response.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  db.delete(links).where(eq(links.id, params.id)).run();
  return Response.json({ ok: true });
}
