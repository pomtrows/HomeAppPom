"use client";

import useSWR from "swr";
import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { PageHeader } from "@/components/PageHeader";
import { Checkbox } from "@/components/ui/Checkbox";
import { SortableItem } from "@/components/ui/SortableItem";
import { GripHandle } from "@/components/ui/GripHandle";
import { useDndSensors } from "@/components/ui/useDndSensors";
import { fetcher } from "@/lib/fetcher";
import type { Category, ShoppingItem } from "@/lib/types";

type Data = { categories: Category[]; items: ShoppingItem[] };

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fallthrough */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export default function ShoppingPage() {
  const { data, mutate, isLoading } = useSWR<Data>("/api/shopping", fetcher, {
    refreshInterval: 2000,
  });

  const [filter, setFilter] = useState<string | null>(null);
  const [newItem, setNewItem] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [copied, setCopied] = useState(false);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const sensors = useDndSensors();

  useEffect(() => {
    if (data && !isDragging) setItems(data.items);
  }, [data, isDragging]);

  const categories = data?.categories ?? [];

  const checkedItems = items.filter((i) => i.checked === 1);

  const catName = (id: string | null) =>
    id === null ? null : categories.find((c) => c.id === id)?.name ?? "…";

  const filteredItems =
    filter === null ? items : items.filter((i) => i.categoryId === filter);

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    const name = newItem.trim();
    if (!name) return;
    setNewItem("");
    await fetch("/api/shopping/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, categoryId: filter }),
    });
    mutate();
  }

  async function toggleItem(item: ShoppingItem) {
    const newChecked = item.checked ? 0 : 1;
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, checked: newChecked } : i))
    );
    await fetch(`/api/shopping/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checked: newChecked }),
    });
    mutate();
  }

  async function deleteItem(item: ShoppingItem) {
    if (!window.confirm(`Supprimer « ${item.name} » ?`)) return;
    await fetch(`/api/shopping/items/${item.id}`, { method: "DELETE" });
    mutate();
  }

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    const name = newCategory.trim();
    if (!name) return;
    setNewCategory("");
    setShowNewCategory(false);
    await fetch("/api/shopping/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    mutate();
  }

  async function deleteCategory(cat: Category) {
    if (!window.confirm(`Supprimer la catégorie « ${cat.name} » ?`)) return;
    if (filter === cat.id) setFilter(null);
    await fetch(`/api/shopping/categories/${cat.id}`, { method: "DELETE" });
    mutate();
  }

  async function copyChecked() {
    const text = checkedItems.map((i) => i.name).join("\n");
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      setIsDragging(false);
      return;
    }

    let newOrder: ShoppingItem[];

    if (filter === null) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      if (oldIndex < 0 || newIndex < 0) {
        setIsDragging(false);
        return;
      }
      newOrder = arrayMove(items, oldIndex, newIndex);
    } else {
      const visible = items.filter((i) => i.categoryId === filter);
      const oldIndex = visible.findIndex((i) => i.id === active.id);
      const newIndex = visible.findIndex((i) => i.id === over.id);
      if (oldIndex < 0 || newIndex < 0) {
        setIsDragging(false);
        return;
      }
      const reordered = arrayMove(visible, oldIndex, newIndex);
      let k = 0;
      newOrder = items.map((item) =>
        item.categoryId === filter ? reordered[k++] : item
      );
    }

    setItems(newOrder);
    await fetch("/api/shopping/items/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: newOrder.map((i) => i.id) }),
    });
    mutate();
    setIsDragging(false);
  }

  const activeCategory = filter === null ? null : catName(filter);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <PageHeader
        title="Liste de courses"
        right={
          <button
            onClick={copyChecked}
            disabled={checkedItems.length === 0}
            className={`rounded-card2 px-3 py-1 text-xs font-medium border transition-colors ${
              checkedItems.length === 0
                ? "text-faint border-line cursor-not-allowed"
                : "text-accent border-accent/25 hover:bg-accent-dim"
            }`}
          >
            {copied
              ? "Copié ✓"
              : `Copier les cochés (${checkedItems.length})`}
          </button>
        }
      />

      <form onSubmit={addItem} className="flex gap-2 mb-4">
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder={
            activeCategory
              ? `Ajouter dans « ${activeCategory} »`
              : "Ajouter un article…"
          }
          className="flex-1 bg-bg border border-line rounded-card2 px-3 py-2.5 text-sm outline-none focus:border-accent/40 transition-colors"
        />
        <button
          type="submit"
          className="bg-accent-dim text-accent border border-accent/25 rounded-card2 px-4 text-sm font-medium shrink-0"
        >
          + Ajouter
        </button>
      </form>

      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3 -mx-4 px-4 pb-1">
        <Chip active={filter === null} onClick={() => setFilter(null)}>
          Tous
        </Chip>
        {categories.map((c) => (
          <div key={c.id} className="relative shrink-0">
            <Chip active={filter === c.id} onClick={() => setFilter(c.id)}>
              {c.name}
            </Chip>
            <button
              onClick={() => deleteCategory(c)}
              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-surface-2 border border-line text-muted text-[10px] leading-none flex items-center justify-center"
              aria-label={`Supprimer ${c.name}`}
            >
              ×
            </button>
          </div>
        ))}
        <button
          onClick={() => setShowNewCategory((v) => !v)}
          className="shrink-0 text-accent border border-accent/25 rounded-full px-3 py-1 text-xs font-medium"
        >
          + Catégorie
        </button>
      </div>

      {showNewCategory && (
        <form onSubmit={addCategory} className="flex gap-2 mb-3">
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Nouvelle catégorie…"
            autoFocus
            className="flex-1 bg-bg border border-line rounded-card2 px-3 py-2 text-sm outline-none focus:border-accent/40"
          />
          <button
            type="submit"
            className="bg-accent-dim text-accent border border-accent/25 rounded-card2 px-3 text-sm"
          >
            OK
          </button>
        </form>
      )}

      {isLoading && !data ? (
        <p className="text-center text-muted py-10 text-sm">Chargement…</p>
      ) : filteredItems.length === 0 ? (
        <p className="text-center text-muted py-10 text-sm">
          {filter === null
            ? "Aucun article. Ajoute ton premier article ci-dessus."
            : "Aucun article dans cette catégorie."}
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setIsDragging(false)}
        >
          <SortableContext
            items={filteredItems.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-2">
              {filteredItems.map((item) => (
                <SortableItem
                  key={item.id}
                  id={item.id}
                  className="flex items-center gap-3 bg-surface border border-line rounded-card2 px-3 py-2.5 cursor-grab active:cursor-grabbing"
                >
                  <Checkbox
                    checked={item.checked === 1}
                    onChange={() => toggleItem(item)}
                  />
                  <span className="flex-1 text-sm text-fg">{item.name}</span>
                  {filter === null && item.categoryId && (
                    <span className="text-xs text-muted">
                      {catName(item.categoryId)}
                    </span>
                  )}
                  <button
                    onClick={() => deleteItem(item)}
                    className="text-muted hover:text-bad text-base leading-none px-1"
                    aria-label="Supprimer"
                  >
                    ×
                  </button>
                  <GripHandle />
                </SortableItem>
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
        active
          ? "bg-accent text-bg border-accent"
          : "bg-surface border-line text-fg"
      }`}
    >
      {children}
    </button>
  );
}
