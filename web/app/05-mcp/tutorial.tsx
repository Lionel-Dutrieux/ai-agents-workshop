import { ArrowLeft, ArrowRight } from "lucide-react";
import { BrewlyCatalogManager } from "@/components/sandbox";
import {
  Callout,
  DocLink,
  DocLinks,
  Tutorial,
  TutorialCode,
  TutorialHeader,
  TutorialSection,
  TutorialSolution,
  TutorialStep,
  TutorialSteps,
} from "@/components/tutorial";
import { cn } from "@/lib/utils";

const SERVER_DEF = `// lib/mcp/brewly-mcp-server.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getOrder } from "@/lib/dal/brewly-orders";

export function createBrewlyMcpServer() {
  const server = new McpServer({ name: "brewly-mcp", version: "1.0.0" });

  server.registerTool(
    "getOrderStatus",
    {
      description: "Récupère le statut d'une commande à partir de son numéro.",
      inputSchema: { numeroCommande: z.string() }, // ⚠️ un « raw shape » zod,
    },                                             //    PAS un z.object(...)
    async ({ numeroCommande }) => {
      const order = await getOrder(numeroCommande); // le MÊME DAL qu'au module 3
      return { content: [{ type: "text", text: JSON.stringify(order) }] };
    }
  );

  // … getProductInfo et listCatalog : même principe
  return server;
}`;

const ENDPOINT = `// app/api/mcp/route.ts — une vraie URL MCP
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createBrewlyMcpServer } from "@/lib/mcp/brewly-mcp-server";

async function handle(req: Request): Promise<Response> {
  const server = createBrewlyMcpServer();
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // « stateless » : un serveur neuf par requête
    enableJsonResponse: true,
  });
  await server.connect(transport);
  return transport.handleRequest(req); // le SDK gère tout : Request → Response
}

export const POST = handle;
export const GET = handle;`;

const CLIENT = `// app/api/05-mcp/route.ts — le chat, côté client MCP
import { createMCPClient } from "@ai-sdk/mcp";
import { streamText, stepCountIs } from "ai";
import { getEnabledMcpServers } from "@/lib/dal/mcp-servers";

// Les serveurs à joindre viennent de la CONFIG (bouton « MCP » du chat) :
// on ne prend que ceux qui sont ACTIVÉS.
const servers = await getEnabledMcpServers();

let tools = {};
for (const server of servers) {
  const mcp = await createMCPClient({
    transport: { type: "http", url: server.url },
  });
  tools = { ...tools, ...(await mcp.tools()) }; // récupérés par le PROTOCOLE
}

const result = streamText({
  model,
  instructions: BREWLY_AGENT_INSTRUCTIONS,
  messages,
  tools,                    // ← assemblés au runtime depuis les serveurs MCP
  stopWhen: stepCountIs(8),
});`;

const TRACE_STEPS = [
  { dir: "req", label: "initialize" },
  { dir: "res", label: "brewly-mcp 1.0.0" },
  { dir: "req", label: "tools/list" },
  { dir: "res", label: "getOrderStatus · getProductInfo · listCatalog" },
  { dir: "req", label: 'tools/call getOrderStatus("1042")' },
  { dir: "res", label: '{ statut: "expediee", … }' },
] as const;

/** Petite trace visuelle du dialogue JSON-RPC client ⇄ serveur. */
function ProtocolTrace() {
  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <div className="mb-3 flex items-center justify-between text-muted-foreground text-xs">
        <span className="rounded-full border bg-background px-2 py-0.5 font-medium">
          Client (agent)
        </span>
        <span className="rounded-full border bg-background px-2 py-0.5 font-medium">
          Serveur · /api/mcp
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        {TRACE_STEPS.map((step) => (
          <div
            className={cn("flex", step.dir === "res" && "justify-end")}
            key={step.label}
          >
            <div
              className={cn(
                "flex max-w-[88%] items-center gap-2 rounded-md border px-2.5 py-1.5 font-mono text-xs",
                step.dir === "req"
                  ? "border-primary/30 bg-primary/5"
                  : "border-emerald-500/30 bg-emerald-500/5"
              )}
            >
              {step.dir === "req" ? (
                <>
                  <span>{step.label}</span>
                  <ArrowRight className="size-3.5 shrink-0 text-primary" />
                </>
              ) : (
                <>
                  <ArrowLeft className="size-3.5 shrink-0 text-emerald-600" />
                  <span>{step.label}</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const FULL_SOLUTION = `// lib/mcp/brewly-mcp-server.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { findProductByName, listProducts } from "@/lib/dal/brewly-catalog";
import { getOrder } from "@/lib/dal/brewly-orders";

export function createBrewlyMcpServer() {
  const server = new McpServer({ name: "brewly-mcp", version: "1.0.0" });

  server.registerTool(
    "getOrderStatus",
    {
      description: "Statut et détails d'une commande à partir de son numéro.",
      inputSchema: { numeroCommande: z.string() },
    },
    async ({ numeroCommande }) => {
      const order = await getOrder(numeroCommande);
      const result = order
        ? { trouvee: true, ...order }
        : { trouvee: false, numeroCommande };
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.registerTool(
    "getProductInfo",
    {
      description: "Fiche d'un produit du catalogue à partir de son nom.",
      inputSchema: { nom: z.string() },
    },
    async ({ nom }) => {
      const product = await findProductByName(nom);
      const result = product ? { trouve: true, ...product } : { trouve: false, nom };
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.registerTool(
    "listCatalog",
    {
      description: "Liste le catalogue, éventuellement filtré par catégorie.",
      inputSchema: {
        categorie: z.enum(["cafe", "machine", "accessoire"]).nullable(),
      },
    },
    async ({ categorie }) => {
      const produits = await listProducts(categorie ?? undefined);
      return {
        content: [
          { type: "text", text: JSON.stringify({ nombre: produits.length, produits }) },
        ],
      };
    }
  );

  return server;
}`;

/** Énoncé du Module 5 — Serveur MCP. */
export function McpTutorial() {
  return (
    <Tutorial>
      <TutorialHeader
        eyebrow="Module 05 · Brewly"
        objective="Ré-exposer les capacités de Brewly via un serveur MCP officiel, puis rebrancher l'agent dessus — non plus par le code, mais par le protocole."
        title="Serveur MCP"
      />

      <Callout title="Objectif" variant="objective">
        Monter un vrai <strong>serveur MCP</strong> (SDK officiel) dans cette même
        app Next.js, sur l’endpoint <code>/api/mcp</code>, puis faire tourner
        l’agent du module 4 en récupérant ses outils <strong>par le
        protocole</strong> plutôt qu’en les important.
      </Callout>

      <Callout title="Le même agent, des outils débranchés" variant="note">
        Aux modules 3 et 4, nos outils étaient <strong>privés</strong> : importés
        dans le code de notre agent, invisibles ailleurs. MCP est un{" "}
        <strong>standard ouvert</strong> qui les publie : n’importe quel client
        (notre agent, mais aussi Claude Desktop, un IDE, un autre service) peut
        s’y brancher — <strong>sans partager une ligne de notre code</strong>.
      </Callout>

      <TutorialSteps>
        <TutorialStep title="Définir le serveur MCP">
          <p>
            Avec le SDK officiel <code>@modelcontextprotocol/sdk</code>. Un outil
            MCP, c’est la même idée qu’au module 3 (nom, description, schéma,
            code) — juste une autre syntaxe. On appelle{" "}
            <strong>le même DAL</strong> : seule la façade change.
          </p>
          <TutorialCode
            code={SERVER_DEF}
            filename="lib/mcp/brewly-mcp-server.ts"
            language="ts"
          />
        </TutorialStep>

        <TutorialStep title="L’exposer sur un endpoint">
          <p>
            Un route handler Next.js <strong>ordinaire</strong> : il reçoit une{" "}
            <code>Request</code>, la passe au transport du SDK, renvoie une{" "}
            <code>Response</code>. Le mode <em>stateless</em> construit un serveur
            neuf à chaque requête — parfait en serverless.
          </p>
          <TutorialCode
            code={ENDPOINT}
            filename="app/api/mcp/route.ts"
            language="ts"
          />
        </TutorialStep>

        <TutorialStep title="Se connecter comme client">
          <p>
            Le chat devient un <strong>client MCP</strong> (<code>@ai-sdk/mcp</code>
            ). Il assemble ses outils <strong>au runtime</strong> à partir des
            serveurs MCP <strong>activés</strong> (bouton « MCP »), puis lance{" "}
            <strong>exactement la même boucle</strong> qu’aux modules 3 et 4. La
            seule ligne qui change : d’où viennent les <code>tools</code>.
          </p>
          <TutorialCode
            code={CLIENT}
            filename="app/api/05-mcp/route.ts"
            language="ts"
          />
        </TutorialStep>

        <TutorialStep title="Suivre le protocole">
          <p>
            Sous le capot, client et serveur dialoguent en JSON-RPC :{" "}
            <code>initialize</code>, puis <code>tools/list</code>, puis un{" "}
            <code>tools/call</code> par outil appelé. C’est ce qui remplace le
            simple <code>import</code> des modules précédents :
          </p>
          <ProtocolTrace />
        </TutorialStep>

        <TutorialStep title="Tester">
          <p>
            Posez « Où en est ma commande #1042 ? » : la réponse est identique au
            module 3… mais les outils ont fait un aller-retour réseau vers le
            serveur MCP. Chaque appel d’outil s’affiche toujours dans le chat.
          </p>
        </TutorialStep>
      </TutorialSteps>

      <Callout title="Le toggle « MCP » pilote vraiment les outils" variant="note">
        <p>
          Comme les outils sont assemblés depuis les serveurs <strong>activés</strong>,
          basculer un serveur sur <em>off</em> (bouton « MCP » → interrupteur)
          retire ses outils de l’agent au tour suivant : il ne peut plus les
          appeler. Pour vous en assurer, le bouton <strong>« Tester »</strong> du
          même dialog rejoue le handshake et liste les outils réellement exposés.
        </p>
        <p className="mt-2 text-muted-foreground">
          Cas particulier : si <strong>aucun</strong> serveur n’est configuré, la
          route se replie sur le serveur Brewly intégré (<code>/api/mcp</code>)
          pour que la démo marche d’entrée.
        </p>
      </Callout>

      <Callout title="Une vraie URL MCP, branchez-y d’autres clients" variant="tip">
        <p className="mb-2">
          <code>/api/mcp</code> n’est pas un jouet interne : c’est un serveur MCP
          conforme. Pointez-y un autre client pour le vérifier :
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            le <strong>MCP Inspector</strong> (
            <code>npx @modelcontextprotocol/inspector</code>) sur{" "}
            <code>http://localhost:3000/api/mcp</code> ;
          </li>
          <li>
            <strong>Claude Desktop</strong> ou un IDE compatible, en ajoutant ce
            serveur HTTP à sa configuration.
          </li>
        </ul>
        <p className="mt-2">
          Ils y verront les <strong>mêmes trois outils</strong> — c’est tout
          l’intérêt : une capacité écrite une fois, réutilisée partout.
        </p>
      </Callout>

      <TutorialSection title="Le catalogue derrière le serveur (sandbox)">
        <p>
          Le serveur MCP lit le <strong>même catalogue SQLite</strong> que les
          modules 3 et 4, via Prisma. Modifiez une ligne ci-dessous, puis
          re-posez une question : le serveur MCP renverra la nouvelle valeur —
          la source de vérité n’a pas bougé, seule la façade a changé.
        </p>
        <div className="rounded-lg border bg-card/40 p-3">
          <BrewlyCatalogManager />
        </div>
      </TutorialSection>

      <TutorialSection title="Pourquoi un MCP, au fond ?">
        <p>
          Un outil local (module 3) est le choix par défaut : simple, typé,
          rapide. On passe à MCP quand la capacité doit être{" "}
          <strong>partagée au-delà d’un seul agent</strong> : plusieurs agents ou
          services qui consomment la même boîte à outils, des clients tiers
          (Claude, un IDE) qu’on ne veut pas coupler à notre code, ou une équipe
          qui publie ses outils comme un produit. Le prix à payer : un
          aller-retour réseau et un peu de plomberie protocolaire — que le SDK
          officiel absorbe presque entièrement.
        </p>
      </TutorialSection>

      <TutorialSolution>
        <TutorialCode
          code={FULL_SOLUTION}
          filename="lib/mcp/brewly-mcp-server.ts"
          language="ts"
        />
      </TutorialSolution>

      <Callout title="Modèles locaux" variant="warning">
        Comme au module 4, l’agent enchaîne plusieurs appels d’outils. Un petit
        modèle local peut s’arrêter trop tôt : privilégiez un modèle « instruct »
        récent, à l’aise avec le function calling.
      </Callout>

      <DocLinks>
        <li>
          <DocLink href="https://modelcontextprotocol.io/introduction">
            Model Context Protocol — introduction
          </DocLink>
        </li>
        <li>
          <DocLink href="https://github.com/modelcontextprotocol/typescript-sdk">
            SDK TypeScript officiel (serveur & client)
          </DocLink>
        </li>
        <li>
          <DocLink href="https://ai-sdk.dev/cookbook/next/mcp-tools">
            MCP Tools avec le AI SDK — cookbook Next.js
          </DocLink>
        </li>
      </DocLinks>
    </Tutorial>
  );
}
