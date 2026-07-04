"use client";

import {
  PromptInputSelect,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
} from "@/components/ai-elements/prompt-input";
import type { ModelOption } from "./model-actions";

export type ChatModelSelectorProps = {
  models: ModelOption[];
  value: string;
  onValueChange: (modelId: string) => void;
};

export function ChatModelSelector({
  models,
  value,
  onValueChange,
}: ChatModelSelectorProps) {
  return (
    <PromptInputSelect onValueChange={onValueChange} value={value}>
      <PromptInputSelectTrigger>
        <PromptInputSelectValue placeholder="Modèle" />
      </PromptInputSelectTrigger>
      <PromptInputSelectContent>
        {models.map((model) => (
          <PromptInputSelectItem key={model.id} value={model.id}>
            {model.label}
          </PromptInputSelectItem>
        ))}
      </PromptInputSelectContent>
    </PromptInputSelect>
  );
}
