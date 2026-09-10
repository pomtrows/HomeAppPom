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
import type { Meal } from "@/lib/types";

type Data = { meals: Meal[] };

export default function MealsPage() {
  const { data, mutate, isLoading } = useSWR<Data>("/api/meals", fetcher, {
    refreshInterval: 2000,
  });

  const [newMeal, setNewMeal] = useState("");
  const [items, setItems] = useState<Meal[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const sensors = useDndSensors();

  useEffect(() => {
    if (data && !isDragging) setItems(data.meals);
  }, [data, isDragging]);

  const meals = items;

  async function addMeal(e: React.FormEvent) {
    e.preventDefault();
    const name = newMeal.trim();
    if (!name) return;
    setNewMeal("");
    await fetch("/api/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    mutate();
  }

  async function toggleMeal(meal: Meal) {
    const newChecked = meal.checked ? 0 : 1;
    setItems((prev) =>
      prev.map((m) => (m.id === meal.id ? { ...m, checked: newChecked } : m))
    );
    await fetch(`/api/meals/${meal.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checked: newChecked }),
    });
    mutate();
  }

  async function deleteMeal(meal: Meal) {
    if (!window.confirm(`Supprimer « ${meal.name} » ?`)) return;
    await fetch(`/api/meals/${meal.id}`, { method: "DELETE" });
    mutate();
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      setIsDragging(false);
      return;
    }
    const oldIndex = items.findIndex((m) => m.id === active.id);
    const newIndex = items.findIndex((m) => m.id === over.id);
    if (oldIndex < 0 || newIndex < 0) {
      setIsDragging(false);
      return;
    }
    const newOrder = arrayMove(items, oldIndex, newIndex);
    setItems(newOrder);
    await fetch("/api/meals/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: newOrder.map((m) => m.id) }),
    });
    mutate();
    setIsDragging(false);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <PageHeader title="Repas" />

      <form onSubmit={addMeal} className="flex gap-2 mb-4">
        <input
          value={newMeal}
          onChange={(e) => setNewMeal(e.target.value)}
          placeholder="Ajouter un repas…"
          className="flex-1 bg-bg border border-line rounded-card2 px-3 py-2.5 text-sm outline-none focus:border-accent/40 transition-colors"
        />
        <button
          type="submit"
          className="bg-accent-dim text-accent border border-accent/25 rounded-card2 px-4 text-sm font-medium shrink-0"
        >
          + Ajouter
        </button>
      </form>

      {isLoading && meals.length === 0 ? (
        <p className="text-center text-muted py-10 text-sm">Chargement…</p>
      ) : meals.length === 0 ? (
        <p className="text-center text-muted py-10 text-sm">
          Aucun repas. Ajoute ton premier repas ci-dessus.
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
            items={meals.map((m) => m.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-2">
              {meals.map((meal) => (
                <SortableItem
                  key={meal.id}
                  id={meal.id}
                  className="flex items-center gap-3 bg-surface border border-line rounded-card2 px-3 py-2.5 cursor-grab active:cursor-grabbing"
                >
                  <Checkbox
                    checked={meal.checked === 1}
                    onChange={() => toggleMeal(meal)}
                  />
                  <span className="flex-1 text-sm text-fg">{meal.name}</span>
                  <button
                    onClick={() => deleteMeal(meal)}
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
