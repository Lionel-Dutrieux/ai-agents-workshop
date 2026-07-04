import "server-only";

import type { ChatUIMessage } from "@/components/chat/types";
import { prisma } from "@/lib/prisma";

/**
 * Data Access Layer des conversations : c'est le SEUL endroit qui touche
 * Prisma pour cette entité. Les Server Actions valident puis délèguent ici.
 * `server-only` casse le build si ce module fuit côté client.
 */

/** DTO léger d'une conversation, pour la liste d'historique. */
export type ConversationSummary = {
  id: string;
  title: string;
  /** ISO 8601 — les Date ne traversent pas la frontière serveur/client. */
  updatedAt: string;
};

/** Message tel que reçu du client, avant sérialisation. */
export type SaveableMessage = {
  id: string;
  role: string;
  parts: unknown[];
  metadata?: unknown;
};

export type SaveConversationInput = {
  id: string;
  exercise: string;
  messages: SaveableMessage[];
};

/** Liste les conversations d'un exercice, les plus récentes d'abord. */
export async function listConversations(
  exercise: string
): Promise<ConversationSummary[]> {
  const rows = await prisma.conversation.findMany({
    where: { exercise },
    orderBy: { updatedAt: "desc" },
    // `select` explicite : on n'expose que le nécessaire, jamais le modèle brut.
    select: { id: true, title: true, updatedAt: true },
  });

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    updatedAt: row.updatedAt.toISOString(),
  }));
}

/**
 * Recharge les messages d'une conversation au format UIMessage.
 * Retourne `null` si la conversation n'existe pas (ex. lien mort dans l'URL).
 */
export async function getConversationMessages(
  id: string
): Promise<ChatUIMessage[] | null> {
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: { messages: { orderBy: { position: "asc" } } },
  });

  if (!conversation) {
    return null;
  }

  return conversation.messages.map((message) => ({
    id: message.uiId,
    role: message.role as ChatUIMessage["role"],
    parts: JSON.parse(message.parts),
    metadata: message.metadata ? JSON.parse(message.metadata) : undefined,
  }));
}

/**
 * Persiste (upsert) l'intégralité d'une conversation. Les messages sont
 * remplacés en bloc : simple et robuste pour un petit historique local.
 */
export async function saveConversation({
  id,
  exercise,
  messages,
}: SaveConversationInput): Promise<void> {
  const now = new Date();

  await prisma.$transaction([
    prisma.conversation.upsert({
      where: { id },
      // Le titre n'est fixé qu'à la création : il reste stable ensuite.
      create: {
        id,
        exercise,
        title: deriveTitle(messages),
        createdAt: now,
        updatedAt: now,
      },
      update: { updatedAt: now },
    }),
    prisma.message.deleteMany({ where: { conversationId: id } }),
    prisma.message.createMany({
      data: messages.map((message, position) => ({
        uiId: message.id,
        conversationId: id,
        role: message.role,
        parts: JSON.stringify(message.parts),
        metadata:
          message.metadata != null ? JSON.stringify(message.metadata) : null,
        position,
      })),
    }),
  ]);
}

/** Supprime une conversation (cascade sur ses messages). No-op si absente. */
export async function deleteConversation(id: string): Promise<void> {
  await prisma.conversation.delete({ where: { id } }).catch(() => {
    // Déjà supprimée : rien à faire.
  });
}

/** Dérive un titre lisible du premier message utilisateur. */
function deriveTitle(messages: SaveableMessage[]): string {
  const firstUser = messages.find((message) => message.role === "user");
  const text = firstUser?.parts
    .filter(
      (part): part is { type: "text"; text: string } =>
        typeof part === "object" &&
        part !== null &&
        (part as { type?: unknown }).type === "text"
    )
    .map((part) => part.text)
    .join(" ")
    .trim();

  if (!text) {
    return "Nouvelle conversation";
  }

  return text.length > 60 ? `${text.slice(0, 57)}…` : text;
}
