import { createMCPClient } from "@ai-sdk/mcp";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  type ToolSet,
  toUIMessageStream,
} from "ai";
import type { ChatUIMessage } from "@/components/chat/types";
import { BREWLY_AGENT_INSTRUCTIONS } from "@/lib/ai/brewly-agent";
import { resolveLanguageModel } from "@/lib/ai/models";
import {
  countMcpServers,
  getEnabledMcpServers,
  type McpServerConfig,
} from "@/lib/dal/mcp-servers";

/**
 * Module 5 — L'agent Brewly, mais outillé PAR MCP (solution de référence).
 *
 * La boucle est celle des modules 3 et 4 (`streamText` + `tools` + `stopWhen`).
 * La différence : les outils ne sont pas importés du code — ils sont assemblés
 * À L'EXÉCUTION à partir des serveurs MCP ACTIVÉS (bouton « MCP » du chat).
 *
 * Conséquence directe : activer / désactiver un serveur dans la config change
 * les outils dont dispose l'agent. Repli pédagogique : si AUCUN serveur n'est
 * configuré, on se branche sur le serveur Brewly intégré (`/api/mcp`) pour que
 * la démo fonctionne d'entrée.
 */

export async function POST(req: Request) {
  const { messages, model }: { messages: ChatUIMessage[]; model: string } =
    await req.json();

  const languageModel = await resolveLanguageModel(model);
  const origin = new URL(req.url).origin;

  // On lit la config : serveurs activés + total. Si rien n'a jamais été
  // configuré, on cible le serveur intégré ; sinon on respecte STRICTEMENT les
  // toggles (un serveur désactivé n'est pas dans `getEnabledMcpServers`).
  const [enabled, total] = await Promise.all([
    getEnabledMcpServers(),
    countMcpServers(),
  ]);
  const targets: McpServerConfig[] =
    total === 0
      ? [{ name: "brewly (intégré)", url: `${origin}/api/mcp`, headers: {} }]
      : enabled;

  // Un client MCP par serveur activé ; on fusionne leurs outils. Un serveur
  // injoignable est simplement ignoré (les autres continuent de fonctionner).
  const clients: Awaited<ReturnType<typeof createMCPClient>>[] = [];
  let tools: ToolSet = {};
  for (const target of targets) {
    try {
      const client = await createMCPClient({
        transport: { type: "http", url: target.url, headers: target.headers },
      });
      clients.push(client);
      tools = { ...tools, ...(await client.tools()) };
    } catch (error) {
      console.error(`[05-mcp] connexion MCP échouée (${target.name}) :`, error);
    }
  }

  // On referme toutes les connexions MCP une fois la génération terminée.
  const closeAll = () => {
    for (const client of clients) {
      void client.close();
    }
  };

  const result = streamText({
    model: languageModel,
    instructions: BREWLY_AGENT_INSTRUCTIONS,
    messages: await convertToModelMessages(messages),
    tools,
    stopWhen: stepCountIs(8),
    onFinish: closeAll,
    onError: closeAll,
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
