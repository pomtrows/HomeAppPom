import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { shoppingCategories, shoppingItems } from "@/lib/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const categories = db
    .select()
    .from(shoppingCategories)
    .orderBy(asc(shoppingCategories.sortOrder), asc(shoppingCategories.createdAt))
    .all();

  const items = db
    .select()
    .from(shoppingItems)
    .orderBy(asc(shoppingItems.sortOrder), asc(shoppingItems.createdAt))
    .all();

  return Response.json({ categories, items });
}
