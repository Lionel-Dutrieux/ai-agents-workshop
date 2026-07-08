import "server-only";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
// Décommentez cet import aux Étapes 1/2 (exercices/05-mcp.md) :
// import { findProductByName, listProducts } from "@/lib/dal/brewly-catalog";
import { getOrder } from "@/lib/dal/brewly-orders";

/**
 * Le serveur MCP de Brewly (Module 5), avec le SDK OFFICIEL
 * `@modelcontextprotocol/sdk`.
 *
 * Aux modules 3 et 4, nos outils étaient PRIVÉS : importés dans le code de
 * notre agent, invisibles pour le reste du monde. Ici on les ré-expose via le
 * Model Context Protocol — un standard ouvert. Résultat : n'importe quel client
 * MCP (notre agent du module 5, mais aussi Claude Desktop, un IDE, un autre
 * service…) peut se brancher sur ces mêmes capacités, sans partager notre code.
 *
 * Anatomie d'un outil MCP — la même idée qu'au module 3, autre syntaxe :
 *   1. un `name`                → l'identifiant appelé par le client ;
 *   2. `description`            → dit au modèle À QUOI sert l'outil ;
 *   3. `inputSchema`            → un « raw shape » zod ({ champ: z.string() }),
 *                                 PAS un `z.object(...)` comme le AI SDK ;
 *   4. le callback              → VOTRE code, qui renvoie un `content` : le
 *                                 résultat est du texte lisible par le modèle.
 *
 * On réutilise EXACTEMENT le même DAL (`lib/dal/brewly-*.ts`) que les outils
 * locaux : seule la façade change, pas la source de vérité.
 */
export function createBrewlyMcpServer() {
  const server = new McpServer({
    name: "brewly-mcp",
    version: "1.0.0",
  });

  server.registerTool(
    "getOrderStatus",
    {
      title: "Statut d'une commande",
      description:
        "Récupère le statut et les détails d'une commande client à partir de son numéro (ex. 1042).",
      inputSchema: {
        numeroCommande: z
          .string()
          .describe("Le numéro de commande, avec ou sans le « # »."),
      },
    },
    async ({ numeroCommande }) => {
      const order = await getOrder(numeroCommande);
      const result = order
        ? { trouvee: true as const, ...order }
        : { trouvee: false as const, numeroCommande };
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  // ⚠️ À VOUS — Étape 1 (exercices/05-mcp.md)
  // Ajoutez ici un `server.registerTool("getProductInfo", { ... }, async (...) => { ... })`
  // qui donne les infos d'un produit du catalogue (prix, origine, intensité,
  // stock) à partir de son nom, en délégant à `findProductByName` (DAL).
  server.registerTool(
    "getProductInfo",
    {
      title: "TODO",
      description: "TODO — à compléter (exercices/05-mcp.md, Étape 1)",
      inputSchema: {},
    },
    async () => {
      return {
        content: [
          {
            type: "text",
            text: "⚠️ Outil à implémenter — suivez exercices/05-mcp.md (Étape 1)",
          },
        ],
      };
    }
  );

  // ⚠️ À VOUS — Étape 2 (exercices/05-mcp.md)
  // Ajoutez ici un `server.registerTool("listCatalog", { ... }, async (...) => { ... })`
  // qui liste les produits du catalogue, avec un filtre optionnel par
  // catégorie (cafe, machine, accessoire), en délégant à `listProducts` (DAL).
  server.registerTool(
    "listCatalog",
    {
      title: "TODO",
      description: "TODO — à compléter (exercices/05-mcp.md, Étape 2)",
      inputSchema: {},
    },
    async () => {
      return {
        content: [
          {
            type: "text",
            text: "⚠️ Outil à implémenter — suivez exercices/05-mcp.md (Étape 2)",
          },
        ],
      };
    }
  );

  return server;
}
