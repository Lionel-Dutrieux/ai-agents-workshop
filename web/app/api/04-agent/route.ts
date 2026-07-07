// Décommentez ces imports à l'Étape 2 (exercices/04-agent.md) :
// import {
//   convertToModelMessages,
//   createUIMessageStreamResponse,
//   toUIMessageStream,
// } from "ai";
// import { createBrewlyAgent } from "@/lib/ai/brewly-agent";
import type { ChatUIMessage } from "@/components/chat/types";
// import { resolveLanguageModel } from "@/lib/ai/models";

/**
 * Module 4 — Agent multi-étapes (à compléter — voir exercices/04-agent.md).
 *
 * Même boucle qu'au module 3, mais encapsulée dans un `ToolLoopAgent`
 * (voir `lib/ai/brewly-agent.ts`). Ici on ne fait qu'appeler `agent.stream()`.
 */

export async function POST(req: Request) {
  const { messages, model }: { messages: ChatUIMessage[]; model: string } =
    await req.json();

  // ⚠️ À VOUS — Étape 2 (exercices/04-agent.md)
  // Résolvez le modèle, construisez l'agent avec `createBrewlyAgent`, puis
  // appelez `agent.stream({ messages, onStepEnd })` — même retour que
  // `streamText`, à renvoyer comme aux modules précédents.
  return new Response(
    "Module 04 à implémenter — suivez exercices/04-agent.md",
    { status: 501 }
  );
}
