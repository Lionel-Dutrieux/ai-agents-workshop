"use client";

import { AlertTriangle, Database, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";

type IndexStats = { chunks: number; articles: number; nonPublies: number };

/**
 * Panneau « Indexer la base » du module 08 : déclenche le pipeline
 * d'ingestion (chunking + embeddings + stockage) et affiche l'état de
 * l'index. Le toggle « inclure les non-publiés » sert la démo
 * « échec puis fix » (KB-20, ancienne politique de retours).
 */
export function RagIndexPanel() {
  const [stats, setStats] = useState<IndexStats | null>(null);
  const [modelId, setModelId] = useState<string>("");
  const [includeUnpublished, setIncludeUnpublished] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/08-rag/index");
    if (!res.ok) {
      setError("Impossible de lire l'état de l'index.");
      return;
    }
    const body = await res.json();
    setStats(body.stats);
    setModelId(body.modelId);
  }, []);

  // Le panneau vit toute la durée de la page (pas de démontage en
  // pratique) : pas besoin de garde de démontage ici.
  useEffect(() => {
    const loadStats = async () => {
      try {
        await refresh();
      } catch {
        setError("Impossible de lire l'état de l'index.");
      }
    };

    loadStats();
  }, [refresh]);

  const runIndex = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/08-rag/index", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ includeUnpublished }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Erreur d'indexation.");
        return;
      }
      setStats(body.stats);
    } finally {
      setBusy(false);
    }
  };

  const clearIndex = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/08-rag/index", { method: "DELETE" });
      if (!res.ok) {
        setError("Impossible de vider l'index.");
        return;
      }
      const body = await res.json();
      setStats(body.stats);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="flex items-center gap-2 font-medium text-sm">
        <Database className="size-4" />
        Index vectoriel
        {stats && (
          <span className="ml-auto font-normal text-muted-foreground text-xs">
            {stats.chunks} chunks · {stats.articles} articles
          </span>
        )}
      </div>

      {modelId && (
        <p className="text-muted-foreground text-xs">
          Modèle d&apos;embeddings : <code>{modelId}</code> (LM Studio)
        </p>
      )}

      {stats && stats.nonPublies > 0 && (
        <p className="flex items-center gap-1.5 text-amber-600 text-xs dark:text-amber-500">
          <AlertTriangle className="size-3.5" />
          Index contaminé : {stats.nonPublies} chunk(s) non publié(s) (KB-20).
        </p>
      )}

      <label className="flex items-center gap-2 text-sm">
        <Switch
          checked={includeUnpublished}
          disabled={busy}
          onCheckedChange={setIncludeUnpublished}
        />
        Inclure les articles non publiés (démo « index naïf »)
      </label>

      <div className="flex items-center gap-2">
        <Button disabled={busy} onClick={runIndex} size="sm">
          {busy ? <Spinner className="size-4" /> : null}
          Indexer la base
        </Button>
        <Button
          disabled={busy || !stats || stats.chunks === 0}
          onClick={clearIndex}
          size="sm"
          variant="outline"
        >
          <Trash2 className="size-4" />
          Vider l&apos;index
        </Button>
      </div>

      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
