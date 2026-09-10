import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { shoppingItems } from "@/lib/schema";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await req.json();

  if (typeof body.checked === "boolean" || typeof body.checked === "number") {
    db.update(shoppingItems)
      .set({ checked: body.checked ? 1 : 0 })
      .where(eq(shoppingItems.id, id))
      .run();
  }

  if (typeof body.name === "string" && body.name.trim()) {
    db.update(shoppingItems)
      .set({ name: body.name.trim() })
      .where(eq(shoppingItems.id, id))
      .run();
  }

  if ("categoryId" in body) {
    db.update(shoppingItems)
      .set({ categoryId: body.categoryId ?? null })
      .where(eq(shoppingItems.id, id))
      .run();
  }

  return Response.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  db.delete(shoppingItems).where(eq(shoppingItems.id, params.id)).run();
  return Response.json({ ok: true });
}
