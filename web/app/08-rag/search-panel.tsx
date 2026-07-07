"use client";

import { Search } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

type SearchResult = {
  reference: string;
  titre: string;
  score: number;
  extrait: string;
};

/**
 * Panneau « Tester la recherche » du module 08 : le retrieval brut, sans LLM.
 * Une requête → embed → similarité cosinus → 1 à 3 articles avec score et
 * extrait. C'est exactement ce que la route de chat fait avant d'appeler le
 * modèle — isolé ici pour voir la recherche sémantique fonctionner à nu.
 */
export function RagSearchPanel() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const runSearch = async (event: FormEvent) => {
    event.preventDefault();
    if (!query.trim() || busy) {
      return;
    }
    setBusy(true);
    setNotice(null);
    setResults(null);
    try {
      const res = await fetch("/api/08-rag/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const body = await res.json();
      if (!res.ok) {
        setNotice(body.error ?? "Erreur de recherche.");
        return;
      }
      if (body.indexEmpty) {
        setNotice("Index vide : lancez d'abord l'indexation ci-dessus.");
        return;
      }
      setResults(body.results);
    } catch {
      setNotice("Erreur de recherche.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="flex items-center gap-2 font-medium text-sm">
        <Search className="size-4" />
        Recherche vectorielle (sans LLM)
      </div>

      <form className="flex items-center gap-2" onSubmit={runSearch}>
        <Input
          className="h-8 text-sm"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ex. comment me faire rembourser ?"
          value={query}
        />
        <Button disabled={busy || !query.trim()} size="sm" type="submit">
          {busy ? <Spinner className="size-4" /> : "Chercher"}
        </Button>
      </form>

      {notice && <p className="text-muted-foreground text-xs">{notice}</p>}

      {results && results.length === 0 && (
        <p className="text-muted-foreground text-xs">Aucun résultat.</p>
      )}

      {results && results.length > 0 && (
        <ol className="flex flex-col gap-2">
          {results.map((result) => (
            <li
              className="rounded-md border bg-card/40 p-2.5"
              key={result.reference}
            >
              <div className="flex items-baseline gap-2 text-xs">
                <span className="font-mono font-medium">
                  {result.reference}
                </span>
                <span className="truncate font-medium">{result.titre}</span>
                <span className="ml-auto shrink-0 text-muted-foreground">
                  {Math.round(result.score * 100)} %
                </span>
              </div>
              <p className="mt-1 line-clamp-3 text-muted-foreground text-xs">
                {result.extrait}
              </p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
