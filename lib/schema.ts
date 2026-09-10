import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const shoppingCategories = sqliteTable("shopping_categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull(),
});

export const shoppingItems = sqliteTable("shopping_items", {
  id: text("id").primaryKey(),
  categoryId: text("category_id"),
  name: text("name").notNull(),
  checked: integer("checked").notNull().default(0),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull(),
});

export const meals = sqliteTable("meals", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  checked: integer("checked").notNull().default(0),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull(),
});

export const links = sqliteTable("links", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  faviconUrl: text("favicon_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull(),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value"),
});
