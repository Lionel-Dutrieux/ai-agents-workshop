"use client";

import type { ChatStatus } from "ai";
import { MessageSquare } from "lucide-react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Spinner } from "@/components/ui/spinner";
import { ChatError } from "./chat-error";
import { ChatMessage } from "./chat-message";
import type { ChatUIMessage } from "./types";

export type ChatMessagesProps = {
  messages: ChatUIMessage[];
  status: ChatStatus;
  error?: Error;
  emptyStateTitle: string;
  emptyStateDescription: string;
};

/** Zone scrollable des messages, avec état vide, spinner et erreur. */
export function ChatMessages({
  messages,
  status,
  error,
  emptyStateTitle,
  emptyStateDescription,
}: ChatMessagesProps) {
  return (
    <Conversation>
      <ConversationContent className="mx-auto w-full max-w-3xl">
        {messages.length === 0 ? (
          <ConversationEmptyState
            icon={<MessageSquare className="size-12" />}
            title={emptyStateTitle}
            description={emptyStateDescription}
          />
        ) : (
          messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              message={message}
              isLastMessage={index === messages.length - 1}
              isStreaming={status === "streaming"}
            />
          ))
        )}
        {status === "submitted" && <Spinner className="mx-auto" />}
        {error && <ChatError error={error} />}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
}
