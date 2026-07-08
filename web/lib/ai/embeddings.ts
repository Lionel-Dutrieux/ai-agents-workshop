import "server-only";

import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/**
 * Modèle d'embeddings du module 08 (RAG) — LM Studio en local.
 *
 * Contrairement aux modèles de chat (gérés dynamiquement en base), le modèle
 * d'embeddings est FIXE, configuré par variables d'environnement : les
 * vecteurs de l'index et ceux des questions doivent provenir du MÊME modèle,
 * sinon la similarité cosinus n'a aucun sens. Changer de modèle = réindexer.
 */

const BASE_URL =
  process.env.EMBEDDINGS_BASE_URL ?? "http://localhost:1234/v1";

/** Identifiant du modèle d'embeddings (tel que servi par LM Studio). */
export const EMBEDDINGS_MODEL_ID =
  process.env.EMBEDDINGS_MODEL_ID ?? "text-embedding-nomic-embed-text-v1.5";

/**
 * Clé API optionnelle. Sans clé, aucun en-tête Authorization n'est envoyé
 * (LM Studio rejette les tokens invalides, même factices). Ne la définir
 * que si l'authentification est activée dans LM Studio.
 */
const API_KEY = process.env.EMBEDDINGS_API_KEY || undefined;

/** Instancie le modèle d'embeddings (endpoint OpenAI-compatible LM Studio). */
export function resolveEmbeddingModel() {
  const provider = createOpenAICompatible({
    name: "lmstudio",
    baseURL: BASE_URL,
    apiKey: API_KEY,
  });
  return provider.embeddingModel(EMBEDDINGS_MODEL_ID);
}

/**
 * Traduit une erreur d'appel embeddings en message actionnable pour l'UI.
 * Cas typiques : LM Studio éteint (fetch failed) ou modèle non chargé (404).
 */
export function toEmbeddingsError(error: unknown): Error {
  const message = error instanceof Error ? error.message : String(error);
  if (/fetch failed|ECONNREFUSED/i.test(message)) {
    return new Error(
      `LM Studio est injoignable sur ${BASE_URL}. Lancez LM Studio, onglet ` +
        "« Developer », et démarrez le serveur local."
    );
  }
  if (/token|401|unauthorized/i.test(message)) {
    return new Error(
      "LM Studio a refusé la clé API. Si l'authentification est activée " +
        "dans LM Studio, définissez EMBEDDINGS_API_KEY dans web/.env ; " +
        "sinon, laissez cette variable vide."
    );
  }
  if (/not found|404|no model/i.test(message)) {
    return new Error(
      `Le modèle d'embeddings « ${EMBEDDINGS_MODEL_ID} » n'est pas chargé ` +
        "dans LM Studio. Chargez-le (ou ajustez EMBEDDINGS_MODEL_ID)."
    );
  }
  return new Error(`Erreur du modèle d'embeddings : ${message}`);
}
