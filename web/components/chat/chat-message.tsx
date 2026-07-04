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

          return null;
        })}
      </MessageContent>
    </Message>
  );
}
