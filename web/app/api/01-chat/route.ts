// Décommentez ces imports au fil des étapes :
// import {
//   convertToModelMessages,
//   createUIMessageStreamResponse,
//   streamText,
//   toUIMessageStream,
// } from "ai";
import type { ChatUIMessage } from "@/components/chat/types";
// import { resolveLanguageModel } from "@/lib/ai/models";

/**
 * Module 1 — Premier chat (à compléter — voir exercices/01-chat.md).
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

  // ⚠️ À VOUS — Étape 1 (exercices/01-chat.md)
  // Résolvez le modèle choisi dans l'UI (`model`) en instance utilisable par
  // le AI SDK, avec `resolveLanguageModel(model)`.

  // ⚠️ À VOUS — Étape 2 (exercices/01-chat.md)
  // Appelez `streamText` avec le modèle résolu, le system prompt
  // (`BREWLY_SYSTEM_PROMPT`) et les messages convertis avec
  // `convertToModelMessages(messages)`.

  // ⚠️ À VOUS — Étape 3 (exercices/01-chat.md)
  // Renvoyez le flux au format `UIMessage` attendu par le composant <Chat/>,
  // avec `createUIMessageStreamResponse` + `toUIMessageStream`.
  return new Response(
    "Module 01 à implémenter — suivez exercices/01-chat.md",
    { status: 501 }
  );
}
