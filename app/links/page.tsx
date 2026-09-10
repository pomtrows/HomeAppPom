"use client";

import useSWR from "swr";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { fetcher } from "@/lib/fetcher";
import type { LinkItem } from "@/lib/types";

type Data = { links: LinkItem[] };

export default function LinksPage() {
  const { data, mutate, isLoading } = useSWR<Data>("/api/links", fetcher, {
    refreshInterval: 5000,
  });

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const links = data?.links ?? [];

  async function addLink(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    setTitle("");
    setUrl("");
    await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), url: url.trim() }),
    });
    mutate();
  }

  async function deleteLink(link: LinkItem) {
    if (!window.confirm(`Supprimer le lien « ${link.title} » ?`)) return;
    await fetch(`/api/links/${link.id}`, { method: "DELETE" });
    mutate();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <PageHeader title="Liens rapides" />

      <form onSubmit={addLink} className="flex gap-2 mb-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre"
          className="w-1/3 bg-bg border border-line rounded-card2 px-3 py-2.5 text-sm outline-none focus:border-accent/40"
        />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://…"
          className="flex-1 bg-bg border border-line rounded-card2 px-3 py-2.5 text-sm outline-none focus:border-accent/40"
        />
        <button
          type="submit"
          className="bg-accent-dim text-accent border border-accent/25 rounded-card2 px-4 text-sm font-medium shrink-0"
        >
          + Ajouter
        </button>
      </form>

      {isLoading && !data ? (
        <p className="text-center text-muted py-10 text-sm">Chargement…</p>
      ) : links.length === 0 ? (
        <p className="text-center text-muted py-10 text-sm">
          Aucun lien. Ajoute ton premier favori ci-dessus.
        </p>
      ) : (
        <ul className="space-y-2">
          {links.map((link) => (
            <LinkRow
              key={link.id}
              link={link}
              editing={editingId === link.id}
              onEdit={() => setEditingId(link.id)}
              onCancel={() => setEditingId(null)}
              onSaved={() => {
                setEditingId(null);
                mutate();
              }}
              onDelete={() => deleteLink(link)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function LinkRow({
  link,
  editing,
  onEdit,
  onCancel,
  onSaved,
  onDelete,
}: {
  link: LinkItem;
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSaved: () => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(link.title);
  const [url, setUrl] = useState(link.url);

  async function save() {
    await fetch(`/api/links/${link.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), url: url.trim() }),
    });
    onSaved();
  }

  if (editing) {
    return (
      <li className="bg-surface border border-line rounded-card2 p-3 space-y-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-bg border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-accent/40"
          placeholder="Titre"
        />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full bg-bg border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-accent/40"
          placeholder="https://…"
        />
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="text-muted text-sm border border-line rounded-lg px-3 py-1.5"
          >
            Annuler
          </button>
          <button
            onClick={save}
            className="text-accent text-sm border border-accent/25 rounded-lg px-3 py-1.5"
          >
            Enregistrer
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-3 bg-surface border border-line rounded-card2 px-3 py-2.5">
      <Favicon link={link} />
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 min-w-0 no-underline"
      >
        <div className="text-sm text-fg truncate">{link.title}</div>
        <div className="text-xs text-muted truncate">{link.url}</div>
      </a>
      <button
        onClick={onEdit}
        className="text-muted hover:text-fg text-sm px-1"
        aria-label="Modifier"
      >
        ✎
      </button>
      <button
        onClick={onDelete}
        className="text-muted hover:text-bad text-base leading-none px-1"
        aria-label="Supprimer"
      >
        ×
      </button>
    </li>
  );
}

function Favicon({ link }: { link: LinkItem }) {
  const [error, setError] = useState(false);
  if (!link.faviconUrl || error) {
    return (
      <span className="w-8 h-8 rounded-lg bg-surface-2 border border-line flex items-center justify-center text-sm text-accent shrink-0">
        {link.title.charAt(0).toUpperCase()}
      </span>
    );
  }
  return (
    <img
      src={link.faviconUrl}
      alt=""
      width={32}
      height={32}
      className="w-8 h-8 rounded-lg shrink-0"
      onError={() => setError(true)}
    />
  );
}
