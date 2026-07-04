"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { parseAsString, useQueryState } from "nuqs";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { ChatComposer } from "./chat-composer";
import { ChatHeader } from "./chat-header";
import { ChatHistoryPanel } from "./chat-history-panel";
import { ChatMessages } from "./chat-messages";
import { ChatSuggestions } from "./chat-suggestions";
import { ChatWelcome } from "./chat-welcome";
import {
  type ChatModel,
  DEFAULT_CHAT_MODELS,
  DEFAULT_MODEL_ID,
} from "./models";
import type { ChatUIMessage } from "./types";
import { useChatHistory } from "./use-chat-history";
import { useMcpServers } from "./use-mcp-servers";

/** Closure de persistance courante, appelée depuis `onFinish`. */
type ChatHistoryRef = (messages: ChatUIMessage[]) => Promise<void>;

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
  const [historyOpen, setHistoryOpen] = useState(false);
  const [model, setModel] = useQueryState(
    "model",
    parseAsString.withDefault(defaultModelId)
  );
  const [mcpServers, setMcpServers] = useMcpServers();

  // Scope de l'historique : le dernier segment de l'endpoint (ex. "01-chat").
  const scope = useMemo(() => api.split("/").filter(Boolean).at(-1) ?? api, [api]);

  const transport = useMemo(() => new DefaultChatTransport({ api }), [api]);

  // La persistance est appelée depuis onFinish, mais `save` dépend de l'état de
  // l'historique (lui-même construit à partir de `setMessages`). Une ref casse
  // cette dépendance circulaire tout en gardant toujours la dernière closure.
  const saveRef = useRef<ChatHistoryRef>(null);

  const { messages, sendMessage, status, stop, error, setMessages } =
    useChat<ChatUIMessage>({
      transport,
      onFinish: ({ messages: finalMessages, isAbort, isError }) => {
        if (isAbort || isError) {
          return;
        }
        void saveRef.current?.(finalMessages);
      },
    });

  const history = useChatHistory({ scope, setMessages });

  // Garde la ref synchronisée avec la dernière closure de persistance.
  useEffect(() => {
    saveRef.current = history.save;
  }, [history.save]);

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

  // Usage de la dernière réponse : représente la taille actuelle du contexte.
  const usage = messages.findLast(
    (message) => message.role === "assistant" && message.metadata?.usage
  )?.metadata?.usage;

  // Titre de la conversation active, pour le header.
  const activeTitle = history.conversationId
    ? (history.conversations.find(
        (conversation) => conversation.id === history.conversationId
      )?.title ?? null)
    : null;

  const isEmpty = messages.length === 0;
  const headerTitle = activeTitle ?? (isEmpty ? null : "Nouvelle conversation");

  const composer = (
    <ChatComposer
      contextWindow={contextWindow}
      input={input}
      mcpServers={mcpServers}
      model={model}
      models={models}
      onInputChange={setInput}
      onMcpServersChange={setMcpServers}
      onModelChange={setModel}
      onStop={stop}
      onSubmit={submit}
      placeholder={placeholder}
      showMcpServers={showMcpServers}
      status={status}
      usage={usage}
    />
  );

  return (
    <div className={cn("relative flex h-full min-h-0 overflow-hidden", className)}>
      <div className="flex min-w-0 flex-1 flex-col">
        <ChatHeader
          historyOpen={historyOpen}
          onNew={() => void history.startNew()}
          onToggleHistory={() => setHistoryOpen((open) => !open)}
          title={headerTitle}
        />

        {isEmpty ? (
          // Accueil : saisie centrée, façon ChatGPT / Claude.
          <div className="flex flex-1 flex-col items-center justify-center px-4">
            <div className="-mt-8 w-full max-w-2xl space-y-6">
              <ChatWelcome
                description={emptyStateDescription}
                title={emptyStateTitle}
              />
              {composer}
              <ChatSuggestions onSelect={submit} suggestions={suggestions} />
            </div>
          </div>
        ) : (
          // Conversation lancée : messages qui défilent, saisie ancrée en bas.
          <>
            <ChatMessages
              emptyStateDescription={emptyStateDescription}
              emptyStateTitle={emptyStateTitle}
              error={error}
              messages={messages}
              status={status}
            />
            <div className="px-4 pb-4">
              <div className="mx-auto w-full max-w-3xl">{composer}</div>
            </div>
          </>
        )}
      </div>

      {historyOpen && (
        <>
          {/* En dessous de lg, le volet passe en superposition : ce fond
              cliquable le referme sans écraser la largeur du chat. */}
          <button
            aria-label="Fermer l'historique"
            className="absolute inset-0 z-20 bg-foreground/20 duration-150 animate-in fade-in lg:hidden"
            onClick={() => setHistoryOpen(false)}
            type="button"
          />
          <ChatHistoryPanel
            activeId={history.conversationId}
            className="absolute inset-y-0 right-0 z-30 shadow-xl lg:static lg:z-auto lg:shadow-none"
            conversations={history.conversations}
            onClose={() => setHistoryOpen(false)}
            onDelete={(id) => void history.remove(id)}
            onNew={() => void history.startNew()}
            onSelect={(id) => void history.select(id)}
          />
        </>
      )}
    </div>
  );
}
