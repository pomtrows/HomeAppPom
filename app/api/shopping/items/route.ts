import { db } from "@/lib/db";
import { shoppingItems } from "@/lib/schema";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return Response.json({ error: "name required" }, { status: 400 });

  const rows = db.select().from(shoppingItems).all();
  const sortOrder = rows.length
    ? Math.max(...rows.map((r) => r.sortOrder)) + 1
    : 0;

  const id = crypto.randomUUID();
  db.insert(shoppingItems)
    .values({
      id,
      name,
      categoryId: body.categoryId ?? null,
      checked: 0,
      sortOrder,
      createdAt: new Date().toISOString(),
    })
    .run();

  return Response.json({ id });
}
