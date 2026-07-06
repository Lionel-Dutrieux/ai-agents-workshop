"use server";

import { z } from "zod";
import * as knowledge from "@/lib/dal/brewly-knowledge";

export type { KnowledgeRow } from "@/lib/dal/brewly-knowledge";

/**
 * Server Actions de la sandbox « Centre de connaissances » : validation zod à
 * la frontière, délégation au DAL (`lib/dal/brewly-knowledge.ts`). C'est cette
 * base documentaire que le module RAG découpera et interrogera.
 */

const idSchema = z.string().min(1);

const inputSchema = z.object({
  reference: z.string().min(1),
  titre: z.string().min(1),
  categorie: z.enum(["politique", "faq", "guide", "produit", "interne"]),
  contenu: z.string().min(1),
  /** Tags saisis en texte libre, séparés par des virgules. */
  tags: z.string(),
  publie: z.boolean(),
});

/** Entrée telle que produite par le formulaire sandbox (champs plats). */
export type BrewlyKnowledgeFormInput = z.input<typeof inputSchema>;

/** Normalise l'entrée du formulaire vers le DTO du DAL (tags → tableau). */
function toDalInput(input: z.output<typeof inputSchema>) {
  return {
    ...input,
    tags: input.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0),
  };
}

export async function listBrewlyKnowledgeAction() {
  return knowledge.listKnowledge();
}

export async function createBrewlyKnowledgeAction(
  input: BrewlyKnowledgeFormInput
) {
  return knowledge.createKnowledge(toDalInput(inputSchema.parse(input)));
}

export async function updateBrewlyKnowledgeAction(
  id: string,
  input: BrewlyKnowledgeFormInput
) {
  return knowledge.updateKnowledge(
    idSchema.parse(id),
    toDalInput(inputSchema.parse(input))
  );
}

export async function deleteBrewlyKnowledgeAction(id: string) {
  return knowledge.deleteKnowledge(idSchema.parse(id));
}
