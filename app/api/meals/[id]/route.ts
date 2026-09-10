import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { meals } from "@/lib/schema";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await req.json();

  if (typeof body.checked === "boolean" || typeof body.checked === "number") {
    db.update(meals)
      .set({ checked: body.checked ? 1 : 0 })
      .where(eq(meals.id, id))
      .run();
  }

  if (typeof body.name === "string" && body.name.trim()) {
    db.update(meals)
      .set({ name: body.name.trim() })
      .where(eq(meals.id, id))
      .run();
  }

  return Response.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  db.delete(meals).where(eq(meals.id, params.id)).run();
  return Response.json({ ok: true });
}
