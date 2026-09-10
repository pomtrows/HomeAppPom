import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { shoppingCategories, shoppingItems } from "@/lib/schema";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  db.update(shoppingItems)
    .set({ categoryId: null })
    .where(eq(shoppingItems.categoryId, id))
    .run();

  db.delete(shoppingCategories).where(eq(shoppingCategories.id, id)).run();

  return Response.json({ ok: true });
}
