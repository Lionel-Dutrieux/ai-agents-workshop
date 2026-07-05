import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createBrewlyMcpServer } from "@/lib/mcp/brewly-mcp-server";

/**
 * Endpoint MCP de Brewly (Module 5) — `POST /api/mcp`.
 *
 * C'est un route handler Next.js CLASSIQUE : il reçoit une `Request` web et
 * renvoie une `Response`. Tout le protocole (handshake `initialize`, `tools/list`,
 * `tools/call`…) est géré par le transport officiel du SDK, à qui on passe la
 * requête telle quelle : `transport.handleRequest(req)` → `Response`.
 *
 * Mode « stateless » : on construit un serveur + un transport NEUFS à chaque
 * requête (`sessionIdGenerator: undefined`). Pas de session à conserver entre
 * les appels — idéal en serverless, et amplement suffisant pour de l'appel
 * d'outils. `enableJsonResponse` répond en JSON simple plutôt qu'en flux SSE.
 *
 * 👉 Cette URL est un vrai serveur MCP : branchez-y le MCP Inspector, Claude
 *    Desktop ou n'importe quel client MCP, ils y verront les outils Brewly.
 */

async function handle(req: Request): Promise<Response> {
  const server = createBrewlyMcpServer();
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  await server.connect(transport);
  return transport.handleRequest(req);
}

// Les clients MCP dialoguent en POST (messages JSON-RPC). Le GET/DELETE
// existent pour le flux SSE et la fermeture de session ; en stateless le
// transport répond correctement (405) de lui-même, on les branche pareil.
export const POST = handle;
export const GET = handle;
export const DELETE = handle;
