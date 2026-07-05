import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  toUIMessageStream,
} from "ai";
import type { ChatUIMessage } from "@/components/chat/types";
import { resolveLanguageModel } from "@/lib/ai/models";
import { brewlyTools } from "./tools";

/**
 * Module 3 — Tool calling (solution de référence).
 *
 * Le modèle ne fait plus que parler : on lui donne des OUTILS qu'il peut
 * décider d'appeler. Cycle : question → (appel d'outil → résultat) → réponse.
 */

const BREWLY_SYSTEM_PROMPT = `Tu es l'assistant du support client de Brewly, une boutique en ligne de café (machines, grains, accessoires).

Tu disposes d'outils pour consulter les commandes et le catalogue. Utilise-les dès qu'une question porte sur une commande précise, un produit ou le stock, plutôt que d'inventer.

Règles :
- Réponds en français, dans un ton chaleureux et concis.
- Après avoir appelé un outil, formule une réponse claire à partir du résultat.
- Si un outil ne trouve rien (commande ou produit inconnu), dis-le honnêtement.`;

export async function POST(req: Request) {
  const { messages, model }: { messages: ChatUIMessage[]; model: string } =
    await req.json();

  const languageModel = await resolveLanguageModel(model);

  const result = streamText({
    model: languageModel,
    instructions: BREWLY_SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    // Les outils disponibles pour ce tour de conversation.
    tools: brewlyTools,
    // Par défaut, le SDK s'arrête après 1 étape : le modèle appellerait l'outil
    // SANS jamais répondre. `stepCountIs(5)` autorise l'enchaînement
    // appel d'outil → résultat → réponse (jusqu'à 5 étapes max, garde-fou).
    stopWhen: stepCountIs(5),
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
