"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageSquare } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import {
  Suggestion,
  Suggestions,
} from "@/components/ai-elements/suggestion";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { ChatMessage } from "./chat-message";

export type ChatProps = {
  /** Endpoint de l'API de chat, propre à chaque exercice (ex. "/api/01-chat"). */
  api: string;
  /** Champs additionnels envoyés dans le body de chaque requête. */
  body?: Record<string, unknown>;
  placeholder?: string;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  /** Prompts d'exemple proposés tant que la conversation est vide. */
  suggestions?: string[];
  className?: string;
};

export function Chat({
  api,
  body,
  placeholder = "Écrivez votre message…",
  emptyStateTitle = "Démarrez la conversation",
  emptyStateDescription = "Envoyez un message pour commencer",
  suggestions,
  className,
}: ChatProps) {
  const [input, setInput] = useState("");
  const transport = useMemo(
    () => new DefaultChatTransport({ api, body }),
    [api, body]
  );
  const { messages, sendMessage, status, stop, error } = useChat({
    transport,
  });

  const handleSubmit = (message: PromptInputMessage) => {
    if (!message.text.trim()) {
      return;
    }
    sendMessage({ text: message.text });
    setInput("");
  };

  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      <Conversation>
        <ConversationContent>
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
          {error && (
            <p className="rounded-md bg-destructive/10 p-3 text-destructive text-sm">
              Une erreur est survenue : {error.message}
            </p>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {suggestions && suggestions.length > 0 && messages.length === 0 && (
        <Suggestions className="mb-2">
          {suggestions.map((suggestion) => (
            <Suggestion
              key={suggestion}
              suggestion={suggestion}
              onClick={(text) => sendMessage({ text })}
            />
          ))}
        </Suggestions>
      )}

      <PromptInput onSubmit={handleSubmit}>
        <PromptInputBody>
          <PromptInputTextarea
            value={input}
            placeholder={placeholder}
            onChange={(e) => setInput(e.currentTarget.value)}
          />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputSubmit
            className="ml-auto"
            status={status}
            onStop={stop}
            disabled={status === "ready" && !input.trim()}
          />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}
