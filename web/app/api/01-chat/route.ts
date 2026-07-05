import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
} from "ai";
import type { ChatUIMessage } from "@/components/chat/types";
import { resolveLanguageModel } from "@/lib/ai/models";

/**
 * Module 1 — Premier chat (solution de référence).
 *
 * Cycle : requête (messages + modèle choisi) → LLM → streaming vers l'UI.
 * L'UI (le composant <Chat/>) est déjà fournie ; seule cette route est à écrire.
 */

// System prompt : donne au chatbot la personnalité et les infos de Brewly.
//
// Ici on le garde inline pour la lisibilité du tutoriel. Sur un vrai projet,
// externalisez les prompts dans un module dédié (ex. `lib/ai/prompts.ts`) —
// voire des fichiers `.md` — pour les réutiliser, versionner et tester
// indépendamment de la logique des routes.
// Doc : https://ai-sdk.dev/docs/foundations/prompts
const BREWLY_SYSTEM_PROMPT = `Tu es l'assistant du support client de Brewly, une boutique en ligne de café (machines, grains, accessoires).

Ton rôle :
- Répondre aux clients de façon chaleureuse, concise et professionnelle.
- Conseiller sur les produits selon les goûts (cafés, machines, accessoires).
- Renseigner les informations générales de la boutique.

Informations générales :
- Support : du lundi au vendredi, 9h–18h (CET).
- Livraison standard : 2 à 4 jours ouvrés en France, 5 à 8 jours en Europe.
- Retours acceptés sous 30 jours.

Règles :
- Réponds en français, dans le ton de la marque : passionné de café et accessible.
- Tu ne peux pas encore consulter les commandes, le stock ou les prix précis : si on te le demande, dis-le honnêtement et n'invente jamais ces informations.`;

export async function POST(req: Request) {
  // Le frontend envoie les messages de la conversation et l'id du modèle choisi.
  const { messages, model }: { messages: ChatUIMessage[]; model: string } =
    await req.json();

  // Résout le modèle (LM Studio, Ollama, Azure…) depuis la base.
  const languageModel = await resolveLanguageModel(model);

  const result = streamText({
    model: languageModel,
    // AI SDK 7 : `instructions` remplace `system` (déprécié).
    instructions: BREWLY_SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
  });

  // Diffuse la réponse au format UIMessage, en joignant l'usage de tokens
  // (pour la jauge de contexte) et l'id du modèle à la fin.
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
