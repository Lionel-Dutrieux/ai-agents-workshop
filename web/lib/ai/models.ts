import "server-only";

import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { LanguageModel } from "ai";
import { getModelForInference } from "@/lib/dal/models";

/**
 * Instancie un modèle de langage à partir de sa config en base.
 *
 * Tous les modèles ajoutés passent par un endpoint OpenAI-compatible
 * (Ollama, Azure AI Foundry, …), donc un seul provider suffit :
 * `createOpenAICompatible` avec le `baseUrl` et la clé du modèle.
 *
 * À utiliser côté serveur dans les routes d'exercice :
 * ```ts
 * const model = await resolveLanguageModel(modelId);
 * const result = streamText({ model, messages });
 * ```
 */
export async function resolveLanguageModel(
  id: string
): Promise<LanguageModel> {
  const config = await getModelForInference(id);
  if (!config) {
    throw new Error(`Modèle introuvable : ${id}`);
  }

  const provider = createOpenAICompatible({
    name: config.provider,
    baseURL: config.baseUrl,
    // Ollama exige une clé mais l'ignore ; on met une valeur neutre par défaut.
    apiKey: config.apiKey ?? "unused",
    // Utilise `response_format: json_schema` pour la sortie structurée
    // (generateObject/streamObject) — attendu par LM Studio, Ollama, Azure.
    // Sans effet sur le chat (streamText n'envoie pas de response_format).
    supportsStructuredOutputs: true,
  });

  return provider.chatModel(config.modelId);
}
