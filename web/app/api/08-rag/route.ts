import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
} from "ai";
import type { ChatUIMessage } from "@/components/chat/types";
import { resolveLanguageModel } from "@/lib/ai/models";
import { retrieve } from "@/lib/ai/rag";

/**
 * Module 8 — RAG custom (solution de référence).
 *
 * Le pipeline, à chaque question :
 *   1. `retrieve` : embed de la question + similarité cosinus → top-4 chunks ;
 *   2. les extraits sont injectés dans le system prompt (le modèle ne répond
 *      QUE depuis ces extraits, en citant les références KB-xx) ;
 *   3. les sources partent au client en data part `data-rag-sources`,
 *      affichées sous la réponse.
 */

const K = 4;

function buildInstructions(
  extraits: { reference: string; titre: string; contenu: string }[]
): string {
  const contexte = extraits
    .map((e) => `[${e.reference}] ${e.titre}\n${e.contenu}`)
    .join("\n\n---\n\n");

  return `Tu es l'assistant du support client de Brewly, une boutique de café en ligne. Réponds en français, ton chaleureux et concis.

Réponds UNIQUEMENT à partir des extraits de la base de connaissances ci-dessous. Cite les références entre crochets (ex. [KB-01]) à l'appui de chaque affirmation. Si les extraits ne permettent pas de répondre, dis-le honnêtement et propose de contacter le support — n'invente jamais une politique.

Extraits :

${contexte}`;
}

export async function POST(req: Request) {
  const { messages, model }: { messages: ChatUIMessage[]; model: string } =
    await req.json();

  // La question = le texte du dernier message utilisateur.
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const question = (lastUser?.parts ?? [])
    .map((part) => (part.type === "text" ? part.text : ""))
    .join(" ")
    .trim();

  // ÉTAPE RETRIEVE — avant tout appel au LLM.
  let sources: Awaited<ReturnType<typeof retrieve>>;
  try {
    sources = await retrieve(question, K);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur de recherche inconnue.";
    return new Response(message, { status: 502 });
  }

  // Index vide : on guide au lieu d'halluciner (et sans dépenser un appel LLM).
  if (sources.length === 0) {
    const stream = createUIMessageStream<ChatUIMessage>({
      execute: ({ writer }) => {
        writer.write({ type: "text-start", id: "empty-index" });
        writer.write({
          type: "text-delta",
          id: "empty-index",
          delta:
            "L'index vectoriel est vide : ouvrez le panneau « Indexer la " +
            "base » à gauche et lancez l'indexation, puis reposez votre question.",
        });
        writer.write({ type: "text-end", id: "empty-index" });
      },
    });
    return createUIMessageStreamResponse({ stream });
  }

  const languageModel = await resolveLanguageModel(model);

  const stream = createUIMessageStream<ChatUIMessage>({
    execute: async ({ writer }) => {
      // Les sources d'abord : l'UI les affiche pendant que la réponse streame.
      writer.write({
        type: "data-rag-sources",
        id: "rag-sources",
        data: sources.map(({ reference, titre, score }) => ({
          reference,
          titre,
          score,
        })),
      });

      const result = streamText({
        model: languageModel,
        instructions: buildInstructions(sources),
        messages: await convertToModelMessages(messages),
      });

      writer.merge(
        toUIMessageStream({
          stream: result.stream,
          messageMetadata: ({ part }) => {
            if (part.type === "finish") {
              return { usage: part.totalUsage, modelId: model };
            }
          },
        })
      );
    },
  });

  return createUIMessageStreamResponse({ stream });
}
