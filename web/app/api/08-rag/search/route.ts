import { NextResponse } from "next/server";
import { retrieve } from "@/lib/ai/rag";

/**
 * Module 8 — Recherche vectorielle brute (panneau « Tester la recherche »).
 *
 * Le retrieval SEUL, sans LLM : embed de la requête → similarité cosinus →
 * top-K → agrégation par article. C'est exactement ce que la route de chat
 * fait avant d'appeler le modèle — isolé ici pour le voir fonctionner.
 */

/** Un article retrouvé, avec son meilleur chunk en guise d'extrait. */
export type SearchResult = {
  reference: string;
  titre: string;
  score: number;
  extrait: string;
};

export async function POST(req: Request) {
  const { query }: { query?: string } = await req.json().catch(() => ({}));
  const question = (query ?? "").trim();
  if (!question) {
    return NextResponse.json(
      { error: "Saisissez une recherche." },
      { status: 400 }
    );
  }

  try {
    // 6 chunks pour laisser la place aux doublons d'article, puis on agrège
    // par référence (meilleur score gagne) et on garde 3 articles max.
    const chunks = await retrieve(question, 6);
    if (chunks.length === 0) {
      return NextResponse.json({ results: [], indexEmpty: true });
    }

    const results: SearchResult[] = [];
    for (const chunk of chunks) {
      if (results.some((r) => r.reference === chunk.reference)) {
        continue; // déjà vu avec un meilleur score (chunks triés décroissant)
      }
      results.push({
        reference: chunk.reference,
        titre: chunk.titre,
        score: chunk.score,
        extrait: chunk.contenu,
      });
      if (results.length === 3) {
        break;
      }
    }

    return NextResponse.json({ results, indexEmpty: false });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur de recherche inconnue.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
