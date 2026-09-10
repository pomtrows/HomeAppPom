import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { shoppingItems } from "@/lib/schema";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  const body = await req.json();
  const ids: unknown = body.ids;
  if (!Array.isArray(ids) || !ids.every((id) => typeof id === "string")) {
    return Response.json({ error: "ids (string[]) required" }, { status: 400 });
  }

  db.transaction((tx) => {
    (ids as string[]).forEach((id, i) => {
      tx.update(shoppingItems).set({ sortOrder: i }).where(eq(shoppingItems.id, id)).run();
    });
  });

  return Response.json({ ok: true });
}
