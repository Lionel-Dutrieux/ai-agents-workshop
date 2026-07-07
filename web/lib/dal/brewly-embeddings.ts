import "server-only";

import { prisma } from "@/lib/prisma";

/**
 * Index vectoriel du module 08 (RAG) — DAL.
 *
 * ⚠️ Atelier : ces fonctions sont FOURNIES. L'index est reconstruit à la
 * demande depuis le panneau « Indexer la base » du module ; il ne fait pas
 * partie des données de démo du seeder.
 *
 * SQLite n'a pas de type vectoriel : les embeddings sont sérialisés en JSON
 * et la similarité est calculée en TypeScript (voir lib/ai/rag.ts). En
 * production, on prendrait une base adaptée (pgvector sur PostgreSQL, etc.).
 */

/** Un chunk indexé, vecteur désérialisé — l'unité de recherche du RAG. */
export type EmbeddedChunk = {
  reference: string;
  titre: string;
  chunkIndex: number;
  contenu: string;
  vecteur: number[];
  publie: boolean;
};

/** État de l'index, pour le panneau du module. */
export type IndexStats = {
  chunks: number;
  articles: number;
  /** Chunks issus d'articles non publiés (index « contaminé », démo KB-20). */
  nonPublies: number;
};

/** Vide puis réinsère l'index complet (idempotent). Renvoie le nb de chunks. */
export async function replaceEmbeddings(
  chunks: EmbeddedChunk[]
): Promise<number> {
  // Transaction : jamais d'index à moitié vide si l'insertion échoue.
  await prisma.$transaction([
    prisma.brewlyEmbedding.deleteMany(),
    prisma.brewlyEmbedding.createMany({
      data: chunks.map((chunk) => ({
        ...chunk,
        vecteur: JSON.stringify(chunk.vecteur),
      })),
    }),
  ]);
  return chunks.length;
}

/** Charge l'index complet en mémoire (~60 chunks : trivial à cette échelle). */
export async function listEmbeddings(): Promise<EmbeddedChunk[]> {
  const rows = await prisma.brewlyEmbedding.findMany({
    orderBy: [{ reference: "asc" }, { chunkIndex: "asc" }],
  });
  return rows.map((row) => ({
    reference: row.reference,
    titre: row.titre,
    chunkIndex: row.chunkIndex,
    contenu: row.contenu,
    vecteur: parseVector(row.vecteur),
    publie: row.publie,
  }));
}

/** Vide l'index. */
export async function clearEmbeddings(): Promise<void> {
  await prisma.brewlyEmbedding.deleteMany();
}

/** Statistiques pour le panneau d'indexation. */
export async function getIndexStats(): Promise<IndexStats> {
  const rows = await prisma.brewlyEmbedding.findMany({
    select: { reference: true, publie: true },
  });
  return {
    chunks: rows.length,
    articles: new Set(rows.map((row) => row.reference)).size,
    nonPublies: rows.filter((row) => !row.publie).length,
  };
}

function parseVector(serialized: string): number[] {
  try {
    const parsed = JSON.parse(serialized);
    return Array.isArray(parsed) ? parsed.map(Number) : [];
  } catch {
    return [];
  }
}
