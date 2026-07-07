import type { LanguageModelUsage, UIMessage } from "ai";

/**
 * Métadonnées attachées aux messages assistant par les routes API du
 * workshop (via `toUIMessageStreamResponse({ messageMetadata })`).
 * Convention partagée entre le frontend et les exercices backend.
 */
export type ChatMessageMetadata = {
  usage?: LanguageModelUsage;
  modelId?: string;
};

/** Une source citée par le RAG (module 08) : article + score de similarité. */
export type RagSource = {
  reference: string;
  titre: string;
  score: number;
};

/**
 * Data parts custom streamés par les routes du workshop.
 * `rag-sources` (module 08) : les extraits retrouvés, envoyés AVANT la
 * réponse pour afficher les sources sous le message.
 */
export type ChatDataParts = {
  "rag-sources": RagSource[];
};

export type ChatUIMessage = UIMessage<ChatMessageMetadata, ChatDataParts>;
