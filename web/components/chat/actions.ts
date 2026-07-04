"use server";

import { z } from "zod";
import * as conversations from "@/lib/dal/conversations";

// Le type DTO vit dans le DAL ; on le ré-expose pour le frontend.
export type { ConversationSummary } from "@/lib/dal/conversations";

/**
 * Frontière serveur du chat : chaque action valide ses entrées (toute donnée
 * venant du client est non fiable) puis délègue au Data Access Layer, seul
 * responsable de l'accès Prisma. Aucune requête n'est écrite ici.
 */

const idSchema = z.string().min(1);

export async function listConversationsAction(exercise: string) {
  return conversations.listConversations(idSchema.parse(exercise));
}

export async function getConversationMessagesAction(id: string) {
  return conversations.getConversationMessages(idSchema.parse(id));
}

const saveSchema = z.object({
  id: idSchema,
  scope: idSchema,
  messages: z
    .array(
      z.object({
        id: z.string(),
        role: z.string(),
        parts: z.array(z.unknown()),
        metadata: z.unknown().optional(),
      })
    )
    .min(1),
});

export type SaveConversationInput = z.input<typeof saveSchema>;

export async function saveConversationAction(input: SaveConversationInput) {
  const { id, scope, messages } = saveSchema.parse(input);
  // `scope` (contrat client) est mappé sur `exercise` (domaine) du DAL.
  return conversations.saveConversation({ id, exercise: scope, messages });
}

export async function deleteConversationAction(id: string) {
  return conversations.deleteConversation(idSchema.parse(id));
}
