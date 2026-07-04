"use server";

import { z } from "zod";
import * as models from "@/lib/dal/models";

export type { ManagedModel, ModelOption } from "@/lib/dal/models";

/**
 * Frontière serveur de la gestion des modèles : validation puis délégation au
 * DAL. La clé API n'est jamais renvoyée au client (seul un booléen `hasApiKey`
 * transite via `listManagedModelsAction`).
 */

const idSchema = z.string().min(1);

const modelInputSchema = z.object({
  label: z.string().min(1),
  provider: z.enum(["lmstudio", "ollama", "azure", "custom"]),
  baseUrl: z.string().url(),
  modelId: z.string().min(1),
  apiKey: z.string().optional(),
  contextWindow: z.number().int().positive().nullable().optional(),
  enabled: z.boolean().optional(),
});

export type ModelFormInput = z.input<typeof modelInputSchema>;

/** Normalise l'entrée validée vers le contrat du DAL. */
function toDalInput(input: z.infer<typeof modelInputSchema>): models.ModelInput {
  const apiKey = input.apiKey?.trim();
  return {
    label: input.label.trim(),
    provider: input.provider,
    baseUrl: input.baseUrl.trim(),
    modelId: input.modelId.trim(),
    // Vide → undefined : nulle en création, inchangée en édition (DAL).
    apiKey: apiKey ? apiKey : undefined,
    contextWindow: input.contextWindow ?? null,
    enabled: input.enabled ?? true,
  };
}

export async function listModelOptionsAction() {
  return models.listModelOptions();
}

export async function listManagedModelsAction() {
  return models.listManagedModels();
}

export async function createModelAction(input: ModelFormInput) {
  return models.createModel(toDalInput(modelInputSchema.parse(input)));
}

export async function updateModelAction(id: string, input: ModelFormInput) {
  return models.updateModel(idSchema.parse(id), toDalInput(modelInputSchema.parse(input)));
}

export async function deleteModelAction(id: string) {
  return models.deleteModel(idSchema.parse(id));
}
