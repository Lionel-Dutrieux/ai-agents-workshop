import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  toUIMessageStream,
} from "ai";
import { createBrewlyAgent } from "@/lib/ai/brewly-agent";
import type { ChatUIMessage } from "@/components/chat/types";
import { resolveLanguageModel } from "@/lib/ai/models";

/**
 * Module 4 — Agent multi-étapes (solution de référence).
 *
 * Même boucle qu'au module 3, mais encapsulée dans un `ToolLoopAgent`
 * (voir `lib/ai/brewly-agent.ts`). Ici on ne fait qu'appeler `agent.stream()`.
 */

export async function POST(req: Request) {
  const { messages, model }: { messages: ChatUIMessage[]; model: string } =
    await req.json();

  const languageModel = await resolveLanguageModel(model);

  // On construit l'agent avec le modèle choisi, puis on le laisse mener sa
  // boucle. `agent.stream()` renvoie le même résultat que `streamText`.
  const agent = createBrewlyAgent(languageModel);

  const result = await agent.stream({
    messages: await convertToModelMessages(messages),
    // Observabilité de la boucle : on trace chaque étape côté serveur.
    // (Côté UI, chaque appel d'outil s'affiche déjà dans le chat : c'est la
    // trajectoire de l'agent, rendue visible.)
    onStepEnd: ({ toolCalls }) => {
      const called = toolCalls?.map((call) => call.toolName).join(", ");
      if (called) {
        console.log(`[agent] outils appelés : ${called}`);
      }
    },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      messageMetadata: ({ part }) => {
        if (part.type === "finish") {
          return { usage: part.totalUsage, modelId: model };
        }
      },
    }),
  });
}
