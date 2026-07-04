"use client";

import { CheckIcon } from "lucide-react";
import { useState } from "react";
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorName,
  ModelSelectorTrigger,
} from "@/components/ai-elements/model-selector";
import { PromptInputButton } from "@/components/ai-elements/prompt-input";
import type { ChatModel } from "./models";

export type ChatModelSelectorProps = {
  models: ChatModel[];
  value: string;
  onValueChange: (modelId: string) => void;
};

export function ChatModelSelector({
  models,
  value,
  onValueChange,
}: ChatModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const selected = models.find((model) => model.id === value);
  const providers = [...new Set(models.map((model) => model.provider))];

  return (
    <ModelSelector onOpenChange={setOpen} open={open}>
      <ModelSelectorTrigger asChild>
        <PromptInputButton tooltip="Choisir le modèle">
          {selected ? (
            <>
              <ModelSelectorLogo provider={selected.provider} />
              <ModelSelectorName>{selected.name}</ModelSelectorName>
            </>
          ) : (
            <ModelSelectorName>Modèle</ModelSelectorName>
          )}
        </PromptInputButton>
      </ModelSelectorTrigger>
      <ModelSelectorContent title="Choisir le modèle">
        <ModelSelectorInput placeholder="Rechercher un modèle…" />
        <ModelSelectorList>
          <ModelSelectorEmpty>Aucun modèle trouvé.</ModelSelectorEmpty>
          {providers.map((provider) => (
            <ModelSelectorGroup
              heading={provider}
              key={provider}
              className="capitalize"
            >
              {models
                .filter((model) => model.provider === provider)
                .map((model) => (
                  <ModelSelectorItem
                    key={model.id}
                    onSelect={() => {
                      onValueChange(model.id);
                      setOpen(false);
                    }}
                    value={model.id}
                  >
                    <ModelSelectorLogo provider={model.provider} />
                    <ModelSelectorName>{model.name}</ModelSelectorName>
                    {value === model.id ? (
                      <CheckIcon className="ml-auto size-4" />
                    ) : (
                      <div className="ml-auto size-4" />
                    )}
                  </ModelSelectorItem>
                ))}
            </ModelSelectorGroup>
          ))}
        </ModelSelectorList>
      </ModelSelectorContent>
    </ModelSelector>
  );
}
