"use client";

import { Suggestion } from "@/components/ai-elements/suggestion";
import { cn } from "@/lib/utils";

export type ChatSuggestionsProps = {
  suggestions?: string[];
  onSelect: (suggestion: string) => void;
  className?: string;
};

/** Prompts d'exemple, en pills centrées sous la boîte de saisie. */
export function ChatSuggestions({
  suggestions,
  onSelect,
  className,
}: ChatSuggestionsProps) {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap justify-center gap-2", className)}>
      {suggestions.map((suggestion) => (
        <Suggestion
          className="text-muted-foreground hover:text-foreground"
          key={suggestion}
          onClick={onSelect}
          suggestion={suggestion}
        />
      ))}
    </div>
  );
}
