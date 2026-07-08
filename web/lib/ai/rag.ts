import "server-only";

import { cosineSimilarity, embed, embedMany } from "ai";
import {
  type EmbeddedChunk,
  listEmbeddings,
  replaceEmbeddings,
} from "@/lib/dal/brewly-embeddings";
import { listKnowledge } from "@/lib/dal/brewly-knowledge";
import { resolveEmbeddingModel, toEmbeddingsError } from "./embeddings";

/**
 * Le cœur du module 08 : un pipeline RAG entièrement visible.
 *
 * Indexation : articles → chunks (1 paragraphe) → `embedMany` → SQLite.
 * Interrogation : question → `embed` → similarité cosinus → top-K.
 *
 * ⚠️ Atelier : `topK` et les appels `embed`/`embedMany` sont les parties que
 * vous écrivez pendant l'exercice. La similarité cosinus, elle, vient
 * directement du AI SDK (`cosineSimilarity`) : inutile de réécrire la
 * formule, l'important est de comprendre ce qu'elle mesure — 1 = même
 * direction (très proche), 0 = orthogonal (sans rapport).
 */

/** Un extrait retrouvé par la recherche sémantique, avec son score [−1, 1]. */
export type RetrievedChunk = {
  reference: string;
  titre: string;
  contenu: string;
  score: number;
};

/**
 * Découpe un article en chunks : un paragraphe = un chunk (FOURNI).
 * Nos articles font ~3 paragraphes chacun — assez fin pour cibler le bon
 * passage, assez large pour rester compréhensible hors contexte.
 */
export function chunkArticle(contenu: string): string[] {
  return contenu
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
}

/**
 * Scoring : chaque chunk de l'index est comparé au vecteur de la question
 * avec `cosineSimilarity` (fourni par le AI SDK), trié par similarité
 * décroissante ; on garde les k meilleurs.
 */
export function topK(
  question: number[],
  index: EmbeddedChunk[],
  k: number
): RetrievedChunk[] {
  return index
    .map((chunk) => ({
      reference: chunk.reference,
      titre: chunk.titre,
      contenu: chunk.contenu,
      score: cosineSimilarity(question, chunk.vecteur),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

/**
 * Indexe la base de connaissances : chunking + embeddings + stockage.
 * `includeUnpublished` sert la démo « échec puis fix » : un index naïf qui
 * avale KB-20 (ancienne politique de retours) répondra 14 jours au lieu de 30.
 */
export async function indexKnowledge(
  options: { includeUnpublished?: boolean } = {}
): Promise<number> {
  const articles = await listKnowledge();
  const retained = options.includeUnpublished
    ? articles
    : articles.filter((article) => article.publie);

  const chunks = retained.flatMap((article) =>
    chunkArticle(article.contenu).map((contenu, chunkIndex) => ({
      article,
      contenu,
      chunkIndex,
    }))
  );

  // Vectorisation de tous les chunks en un seul lot (`embedMany`).
  // Le titre est préfixé au paragraphe : il porte du sens que le paragraphe
  // seul n'a pas toujours (ex. « Le remboursement est émis… » → retours).
  let embeddings: number[][];
  try {
    ({ embeddings } = await embedMany({
      model: resolveEmbeddingModel(),
      values: chunks.map((chunk) => `${chunk.article.titre}\n\n${chunk.contenu}`),
    }));
  } catch (error) {
    throw toEmbeddingsError(error);
  }

  return replaceEmbeddings(
    chunks.map((chunk, i) => ({
      reference: chunk.article.reference,
      titre: chunk.article.titre,
      chunkIndex: chunk.chunkIndex,
      contenu: chunk.contenu,
      vecteur: embeddings[i],
      publie: chunk.article.publie,
    }))
  );
}

/**
 * Recherche sémantique : vectorise la question et renvoie les k chunks les
 * plus proches. Renvoie `[]` si l'index est vide (à indexer d'abord).
 */
export async function retrieve(
  question: string,
  k = 4
): Promise<RetrievedChunk[]> {
  const index = await listEmbeddings();
  if (index.length === 0) {
    return [];
  }

  // Vectorisation de la question (`embed`) — avec le MÊME modèle que l'index.
  let embedding: number[];
  try {
    ({ embedding } = await embed({
      model: resolveEmbeddingModel(),
      value: question,
    }));
  } catch (error) {
    throw toEmbeddingsError(error);
  }

  try {
    return topK(embedding, index, k);
  } catch {
    // `cosineSimilarity` du SDK refuse deux vecteurs de tailles différentes :
    // l'index a été construit avec un autre modèle d'embeddings.
    throw new Error(
      "Dimensions incompatibles : l'index a probablement été construit avec " +
        "un autre modèle d'embeddings. Videz l'index puis réindexez."
    );
  }
}
