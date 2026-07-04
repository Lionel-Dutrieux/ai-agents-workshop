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
import type { ChatUIMessage } from "./types";
import { useChatHistory } from "./use-chat-history";
import { useMcpServers } from "./use-mcp-servers";
import { useModels } from "./use-models";

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
  /** Affiche la gestion des serveurs MCP (lus depuis la base côté serveur). */
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
  showMcpServers = true,
  contextWindow = 200_000,
  className,
}: ChatProps) {
  const [input, setInput] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [model, setModel] = useQueryState(
    "model",
    parseAsString.withDefault("")
  );

  // Modèles disponibles (ajoutés dynamiquement), chargés depuis la base.
  const { options: models, refresh: refreshModels } = useModels();

  // Garde une sélection valide : premier modèle par défaut, et on efface une
  // sélection devenue invalide (modèle supprimé, ou plus aucun modèle).
  useEffect(() => {
    if (models.length === 0) {
      if (model) {
        void setModel(null);
      }
      return;
    }
    if (!model || !models.some((option) => option.id === model)) {
      void setModel(models[0].id);
    }
  }, [models, model, setModel]);
  const { count: mcpCount, refresh: refreshMcp } = useMcpServers();

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
    // Sans modèle sélectionné, le backend ne pourrait pas résoudre le provider.
    if (!(text.trim() && model)) {
      return;
    }
    sendMessage(
      { text },
      {
        body: {
          ...body,
          model,
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

  // Jauge dimensionnée sur le modèle actif (à défaut, la valeur de la prop).
  const activeContextWindow =
    models.find((option) => option.id === model)?.contextWindow ?? contextWindow;

  const composer = (
    <ChatComposer
      contextWindow={activeContextWindow}
      input={input}
      mcpCount={mcpCount}
      model={model}
      models={models}
      onInputChange={setInput}
      onMcpServersChange={refreshMcp}
      onModelChange={setModel}
      onModelsChange={refreshModels}
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
              <ChatSuggestions
                onSelect={submit}
                suggestions={models.length > 0 ? suggestions : undefined}
              />
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
