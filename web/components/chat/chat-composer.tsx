"use client";

import type { ChatStatus, LanguageModelUsage } from "ai";
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
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { ChatModelSelector } from "./chat-model-selector";
import { McpServersDialog } from "./mcp-servers-dialog";
import type { ModelOption } from "./model-actions";
import { ModelManagerDialog } from "./model-manager-dialog";

export type ChatComposerProps = {
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (text: string) => void;
  onStop: () => void;
  status: ChatStatus;
  placeholder: string;

  models: ModelOption[];
  model: string;
  onModelChange: (modelId: string) => void;
  /** Rafraîchit la liste des modèles après ajout/suppression. */
  onModelsChange: () => void;

  showMcpServers: boolean;
  mcpCount: number;
  onMcpServersChange: () => void;

  /** Usage de la dernière réponse, pour la jauge de contexte. */
  usage?: LanguageModelUsage;
  contextWindow: number;
};

/**
 * Boîte de saisie : textarea, outils (modèle, MCP), jauge de contexte, envoi.
 * Sans largeur ni positionnement propres — c'est le parent qui la place
 * (centrée à l'accueil, ancrée en bas une fois la conversation lancée).
 */
export function ChatComposer({
  input,
  onInputChange,
  onSubmit,
  onStop,
  status,
  placeholder,
  models,
  model,
  onModelChange,
  onModelsChange,
  showMcpServers,
  mcpCount,
  onMcpServersChange,
  usage,
  contextWindow,
}: ChatComposerProps) {
  const handleSubmit = (message: PromptInputMessage) => {
    onSubmit(message.text);
  };

  return (
    <div>
    <PromptInput
      className="rounded-3xl shadow-sm transition-shadow focus-within:shadow-md"
      onSubmit={handleSubmit}
    >
      <PromptInputBody>
        <PromptInputTextarea
          onChange={(event) => onInputChange(event.currentTarget.value)}
          placeholder={placeholder}
          value={input}
        />
      </PromptInputBody>
      <PromptInputFooter>
        <PromptInputTools>
          {models.length > 0 && (
            <ChatModelSelector
              models={models}
              onValueChange={onModelChange}
              value={model}
            />
          )}
          <ModelManagerDialog
            count={models.length}
            onModelsChange={onModelsChange}
          />
          {showMcpServers && (
            <McpServersDialog
              count={mcpCount}
              onServersChange={onMcpServersChange}
            />
          )}
        </PromptInputTools>
        <div className="flex items-center gap-2">
          {usage && (
            <Context
              maxTokens={contextWindow}
              modelId={model}
              usage={usage}
              usedTokens={usage.totalTokens ?? 0}
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
            disabled={status === "ready" && (!(input.trim() && model))}
            onStop={onStop}
            status={status}
          />
        </div>
      </PromptInputFooter>
    </PromptInput>

      {models.length === 0 && (
        <p className="mt-2 text-center text-muted-foreground text-xs">
          Aucun modèle configuré. Ajoutez-en un via le bouton{" "}
          <span className="font-medium text-foreground">Modèles</span>.
        </p>
      )}
    </div>
  );
}
