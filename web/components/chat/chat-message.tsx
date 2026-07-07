"use client";

import { getToolName, isToolUIPart, type UIMessage } from "ai";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import type { RagSource } from "./types";

export type ChatMessageProps = {
  message: UIMessage;
  isLastMessage: boolean;
  isStreaming: boolean;
};

export function ChatMessage({
  message,
  isLastMessage,
  isStreaming,
}: ChatMessageProps) {
  // Les parts "reasoning" sont consolidées en un seul bloc pour éviter
  // plusieurs indicateurs "Thinking..." (certains modèles en émettent plusieurs).
  const reasoningParts = message.parts.filter(
    (part) => part.type === "reasoning"
  );
  const reasoningText = reasoningParts
    .map((part) => part.text)
    .join("\n\n");
  const isReasoningStreaming =
    isLastMessage &&
    isStreaming &&
    message.parts.at(-1)?.type === "reasoning";

  return (
    <Message from={message.role}>
      <MessageContent>
        {reasoningParts.length > 0 && (
          <Reasoning className="w-full" isStreaming={isReasoningStreaming}>
            <ReasoningTrigger />
            <ReasoningContent>{reasoningText}</ReasoningContent>
          </Reasoning>
        )}
        {message.parts.map((part, i) => {
          if (part.type === "text") {
            return (
              <MessageResponse key={`${message.id}-${i}`}>
                {part.text}
              </MessageResponse>
            );
          }

          if (isToolUIPart(part)) {
            return (
              <Tool key={part.toolCallId ?? `${message.id}-${i}`}>
                <ToolHeader type={`tool-${getToolName(part)}`} state={part.state} />
                <ToolContent>
                  <ToolInput input={part.input} />
                  <ToolOutput output={part.output} errorText={part.errorText} />
                </ToolContent>
              </Tool>
            );
          }

          if (part.type === "data-rag-sources") {
            const sources = part.data as RagSource[];
            return (
              <div
                className="flex flex-wrap items-center gap-1.5 text-muted-foreground text-xs"
                key={`${message.id}-${i}`}
              >
                <span className="font-medium">Sources :</span>
                {sources.map((source) => (
                  <span
                    className="rounded-md border bg-muted/50 px-1.5 py-0.5 font-mono"
                    key={source.reference}
                    title={source.titre}
                  >
                    {source.reference} · {Math.round(source.score * 100)} %
                  </span>
                ))}
              </div>
            );
          }

          return null;
        })}
      </MessageContent>
    </Message>
  );
}
