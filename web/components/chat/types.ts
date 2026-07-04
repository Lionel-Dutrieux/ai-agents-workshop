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

export type ChatUIMessage = UIMessage<ChatMessageMetadata>;
