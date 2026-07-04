import "server-only";

import { prisma } from "@/lib/prisma";

/**
 * Data Access Layer des modèles LLM ajoutés dynamiquement.
 *
 * ⚠️ La clé API est un secret : elle ne quitte JAMAIS le serveur. Les lectures
 * destinées au client (`listModelOptions`, `listManagedModels`) l'excluent ;
 * seul `getModelForInference` la renvoie, pour instancier le provider.
 */

/** Type de fournisseur — pilote les préréglages du formulaire et le badge. */
export type ModelProvider = "lmstudio" | "ollama" | "azure" | "custom";

/** Option pour le sélecteur (aucun secret). */
export type ModelOption = {
  id: string;
  label: string;
  provider: string;
  /** Fenêtre de contexte, pour dimensionner la jauge de tokens. */
  contextWindow: number | null;
};

/** Vue de gestion : tout sauf la valeur de la clé (`hasApiKey` à la place). */
export type ManagedModel = {
  id: string;
  label: string;
  provider: string;
  baseUrl: string;
  modelId: string;
  contextWindow: number | null;
  enabled: boolean;
  hasApiKey: boolean;
};

/** Config complète pour instancier le provider — server-only. */
export type ModelInferenceConfig = {
  provider: string;
  baseUrl: string;
  modelId: string;
  apiKey: string | null;
  contextWindow: number | null;
};

export type ModelInput = {
  label: string;
  provider: ModelProvider;
  baseUrl: string;
  modelId: string;
  /** Vide/absent → inchangée en édition, nulle en création. */
  apiKey?: string | null;
  contextWindow?: number | null;
  enabled?: boolean;
};

/** Modèles proposés au sélecteur (activés uniquement). */
export async function listModelOptions(): Promise<ModelOption[]> {
  const rows = await prisma.model.findMany({
    where: { enabled: true },
    orderBy: { createdAt: "asc" },
    select: { id: true, label: true, provider: true, contextWindow: true },
  });
  return rows;
}

/** Tous les modèles, pour l'écran de gestion (sans exposer la clé). */
export async function listManagedModels(): Promise<ManagedModel[]> {
  const rows = await prisma.model.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      label: true,
      provider: true,
      baseUrl: true,
      modelId: true,
      contextWindow: true,
      enabled: true,
      apiKey: true,
    },
  });
  return rows.map(({ apiKey, ...model }) => ({
    ...model,
    hasApiKey: apiKey != null && apiKey.length > 0,
  }));
}

/** Config d'inférence complète (clé incluse). Réservé au serveur. */
export async function getModelForInference(
  id: string
): Promise<ModelInferenceConfig | null> {
  const model = await prisma.model.findUnique({
    where: { id },
    select: {
      provider: true,
      baseUrl: true,
      modelId: true,
      apiKey: true,
      contextWindow: true,
    },
  });
  return model;
}

export async function createModel(input: ModelInput): Promise<void> {
  const now = new Date();
  await prisma.model.create({
    data: {
      label: input.label,
      provider: input.provider,
      baseUrl: input.baseUrl,
      modelId: input.modelId,
      apiKey: input.apiKey ?? null,
      contextWindow: input.contextWindow ?? null,
      enabled: input.enabled ?? true,
      createdAt: now,
      updatedAt: now,
    },
  });
}

export async function updateModel(
  id: string,
  input: ModelInput
): Promise<void> {
  await prisma.model.update({
    where: { id },
    data: {
      label: input.label,
      provider: input.provider,
      baseUrl: input.baseUrl,
      modelId: input.modelId,
      // Clé vide → on conserve l'existante (ne pas écraser par du vide).
      ...(input.apiKey ? { apiKey: input.apiKey } : {}),
      contextWindow: input.contextWindow ?? null,
      enabled: input.enabled ?? true,
      updatedAt: new Date(),
    },
  });
}

export async function deleteModel(id: string): Promise<void> {
  await prisma.model.delete({ where: { id } }).catch(() => {
    // Déjà supprimé : rien à faire.
  });
}
