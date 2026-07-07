import { NextResponse } from "next/server";
import {
  clearEmbeddings,
  getIndexStats,
} from "@/lib/dal/brewly-embeddings";
import { EMBEDDINGS_MODEL_ID } from "@/lib/ai/embeddings";
import { indexKnowledge } from "@/lib/ai/rag";

/**
 * Module 8 — Gestion de l'index vectoriel (panneau « Indexer la base »).
 *
 * L'indexation est une étape SÉPARÉE de la conversation : c'est le pipeline
 * d'ingestion du RAG (chunking + embeddings + stockage), déclenché
 * explicitement — comme un batch d'ingestion en production.
 */

/** État de l'index (nombre de chunks, articles, présence de non-publiés). */
export async function GET() {
  return NextResponse.json({
    stats: await getIndexStats(),
    modelId: EMBEDDINGS_MODEL_ID,
  });
}

/** (Ré)indexe la base. `includeUnpublished` = démo « index contaminé ». */
export async function POST(req: Request) {
  const { includeUnpublished = false }: { includeUnpublished?: boolean } =
    await req.json().catch(() => ({}));
  try {
    const indexed = await indexKnowledge({ includeUnpublished });
    return NextResponse.json({ indexed, stats: await getIndexStats() });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur d'indexation inconnue.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

/** Vide l'index. */
export async function DELETE() {
  await clearEmbeddings();
  return NextResponse.json({ stats: await getIndexStats() });
}
