import { db } from "@/lib/db";
import { settings } from "@/lib/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = db.select().from(settings).all();
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value ?? "";
  return Response.json(map);
}

export async function POST(req: Request) {
  const body = await req.json();
  const key = typeof body.key === "string" ? body.key : "";
  const value = typeof body.value === "string" ? body.value : "";
  if (!key) return Response.json({ error: "key required" }, { status: 400 });

  db.insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value } })
    .run();

  return Response.json({ ok: true });
}
