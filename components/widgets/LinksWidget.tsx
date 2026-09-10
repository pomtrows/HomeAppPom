"use client";

import useSWR from "swr";
import { useState } from "react";
import { WidgetCard } from "@/components/WidgetCard";
import { fetcher } from "@/lib/fetcher";
import type { LinkItem } from "@/lib/types";

type Data = { links: LinkItem[] };

export function LinksWidget() {
  const { data } = useSWR<Data>("/api/links", fetcher, {
    refreshInterval: 10000,
  });

  const links = data?.links ?? [];

  return (
    <WidgetCard
      href="/links"
      title="Liens rapides"
      subtitle={`${links.length} favori${links.length > 1 ? "s" : ""}`}
    >
      {links.length > 0 ? (
        <div className="flex gap-2 flex-wrap">
          {links.slice(0, 8).map((l) => (
            <FaviconChip key={l.id} link={l} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">Aucun favori</p>
      )}
    </WidgetCard>
  );
}

function FaviconChip({ link }: { link: LinkItem }) {
  const [error, setError] = useState(false);
  return (
    <span className="w-9 h-9 rounded-lg bg-surface-2 border border-line flex items-center justify-center overflow-hidden">
      {link.faviconUrl && !error ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={link.faviconUrl}
          alt={link.title}
          width={20}
          height={20}
          className="w-5 h-5"
          onError={() => setError(true)}
        />
      ) : (
        <span className="text-sm text-accent">
          {link.title.charAt(0).toUpperCase()}
        </span>
      )}
    </span>
  );
}
