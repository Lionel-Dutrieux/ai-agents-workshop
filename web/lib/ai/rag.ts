import "server-only";

// Décommentez ces imports au fil des étapes (exercices/08-rag.md) :
// import { cosineSimilarity, embed, embedMany } from "ai";
import {
  type EmbeddedChunk,
  listEmbeddings,
  // Décommentez cet import à l'Étape 2 (exercices/08-rag.md) :
  // replaceEmbeddings,
} from "@/lib/dal/brewly-embeddings";
import { listKnowledge } from "@/lib/dal/brewly-knowledge";
// Décommentez cet import aux Étapes 2/3 (exercices/08-rag.md) :
// import { resolveEmbeddingModel, toEmbeddingsError } from "./embeddings";

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
 * ⚠️ À VOUS — Étape 1 (exercices/08-rag.md)
 * Scorez chaque chunk de l'index contre le vecteur de la question avec
 * `cosineSimilarity` (fourni par le AI SDK), triez par similarité
 * décroissante et gardez les k meilleurs.
 */
export function topK(
  question: number[],
  index: EmbeddedChunk[],
  k: number
): RetrievedChunk[] {
  void question;
  void index;
  void k;
  return [];
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

  // ⚠️ À VOUS — Étape 2 (exercices/08-rag.md)
  // Vectorisez tous les chunks en un lot avec `embedMany`. Le titre est à
  // préfixer à chaque paragraphe : il porte du sens que le paragraphe seul
  // n'a pas toujours (ex. « Le remboursement est émis… » → retours). Le
  // résultat doit être stocké avec `replaceEmbeddings(...)`.
  void chunks;
  throw new Error("⚠️ À implémenter — suivez exercices/08-rag.md (Étape 2)");
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

  // ⚠️ À VOUS — Étape 3 (exercices/08-rag.md)
  // Vectorisez la question avec `embed` (le MÊME modèle que pour l'index),
  // puis appelez `topK(embedding, index, k)`. Attrapez les erreurs
  // d'embeddings avec `toEmbeddingsError` et les dimensions incompatibles
  // (l'index a été construit avec un autre modèle) séparément.
  void k;
  throw new Error("⚠️ À implémenter — suivez exercices/08-rag.md (Étape 3)");
}
