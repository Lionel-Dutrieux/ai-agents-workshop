"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageSquare } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { Suspense, useMemo, useState, useSyncExternalStore } from "react";
import {
  Context,
  ContextCacheUsage,
  ContextContent,
  ContextContentBody,
  ContextContentFooter,
  ContextContentHeader,
  ContextInputUsage,
  ContextOutputUsage,
  ContextReasoningUsage,
  ContextTrigger,
} from "@/components/ai-elements/context";
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
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import {
  Suggestion,
  Suggestions,
} from "@/components/ai-elements/suggestion";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { ChatMessage } from "./chat-message";
import { ChatModelSelector } from "./chat-model-selector";
import { McpServersDialog, type McpServer } from "./mcp-servers-dialog";
import {
  type ChatModel,
  DEFAULT_CHAT_MODELS,
  DEFAULT_MODEL_ID,
} from "./models";
import type { ChatUIMessage } from "./types";

const MCP_SERVERS_STORAGE_KEY = "workshop:mcp-servers";

// Les serveurs MCP sont persistés dans localStorage, lu comme un store
// externe (rendu serveur : liste vide, pas de mismatch d'hydratation).
function subscribeToMcpServers(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getMcpServersSnapshot() {
  return localStorage.getItem(MCP_SERVERS_STORAGE_KEY) ?? "[]";
}

function useMcpServers() {
  const json = useSyncExternalStore(
    subscribeToMcpServers,
    getMcpServersSnapshot,
    () => "[]"
  );
  const servers = useMemo<McpServer[]>(() => {
    try {
      return JSON.parse(json);
    } catch {
      return [];
    }
  }, [json]);

  const setServers = (next: McpServer[]) => {
    localStorage.setItem(MCP_SERVERS_STORAGE_KEY, JSON.stringify(next));
    // L'événement "storage" ne se déclenche pas dans l'onglet courant.
    window.dispatchEvent(new StorageEvent("storage", { key: MCP_SERVERS_STORAGE_KEY }));
  };

  return [servers, setServers] as const;
}

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
  /** Modèles proposés dans le sélecteur. Liste vide pour le masquer. */
  models?: ChatModel[];
  defaultModelId?: string;
  /** Affiche la gestion des serveurs MCP (envoyés au backend dans le body). */
  showMcpServers?: boolean;
  /** Taille de la fenêtre de contexte pour la jauge de tokens. */
  contextWindow?: number;
  className?: string;
};

export function Chat(props: ChatProps) {
  // useQueryState (nuqs) lit les search params : une frontière Suspense est
  // requise pour conserver le prérendu statique des pages.
  return (
    <Suspense fallback={<Spinner className="m-auto" />}>
      <ChatInner {...props} />
    </Suspense>
  );
}

function ChatInner({
  api,
  body,
  placeholder = "Écrivez votre message…",
  emptyStateTitle = "Démarrez la conversation",
  emptyStateDescription = "Envoyez un message pour commencer",
  suggestions,
  models = DEFAULT_CHAT_MODELS,
  defaultModelId = DEFAULT_MODEL_ID,
  showMcpServers = true,
  contextWindow = 200_000,
  className,
}: ChatProps) {
  const [input, setInput] = useState("");
  const [model, setModel] = useQueryState(
    "model",
    parseAsString.withDefault(defaultModelId)
  );
  const [mcpServers, setMcpServers] = useMcpServers();

  const transport = useMemo(() => new DefaultChatTransport({ api }), [api]);
  const { messages, sendMessage, status, stop, error } =
    useChat<ChatUIMessage>({ transport });

  const submit = (text: string) => {
    if (!text.trim()) {
      return;
    }
    sendMessage(
      { text },
      {
        body: {
          ...body,
          model,
          mcpServers: showMcpServers ? mcpServers : undefined,
        },
      }
    );
    setInput("");
  };

  const handleSubmit = (message: PromptInputMessage) => {
    submit(message.text);
  };

  // Usage de la dernière réponse : représente la taille actuelle du contexte.
  const usage = messages.findLast(
    (message) => message.role === "assistant" && message.metadata?.usage
  )?.metadata?.usage;

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
              onClick={submit}
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
          <PromptInputTools>
            {models.length > 0 && (
              <ChatModelSelector
                models={models}
                value={model}
                onValueChange={setModel}
              />
            )}
            {showMcpServers && (
              <McpServersDialog
                servers={mcpServers}
                onServersChange={setMcpServers}
              />
            )}
          </PromptInputTools>
          <div className="flex items-center gap-2">
            {usage && (
              <Context
                maxTokens={contextWindow}
                usedTokens={usage.totalTokens ?? 0}
                usage={usage}
                modelId={model}
              >
                <ContextTrigger />
                <ContextContent>
                  <ContextContentHeader />
                  <ContextContentBody>
                    <ContextInputUsage />
                    <ContextOutputUsage />
                    <ContextReasoningUsage />
                    <ContextCacheUsage />
                  </ContextContentBody>
                  <ContextContentFooter />
                </ContextContent>
              </Context>
            )}
            <PromptInputSubmit
              status={status}
              onStop={stop}
              disabled={status === "ready" && !input.trim()}
            />
          </div>
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}
