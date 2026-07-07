import { tool } from "ai";
import { z } from "zod";
// Décommentez cet import à l'Étape 1/2 (exercices/03-tools.md) :
// import { findProductByName, listProducts } from "@/lib/dal/brewly-catalog";
import { getOrder } from "@/lib/dal/brewly-orders";

/**
 * Les outils que NOTRE agent peut appeler (Module 3).
 *
 * Un outil = trois choses :
 *   1. `description`  → dit au modèle À QUOI sert l'outil (il s'en sert pour
 *                       décider quand l'appeler). Soignez-la !
 *   2. `inputSchema`  → un schéma zod des arguments. Le SDK le transmet au
 *                       modèle ET valide ce que le modèle renvoie.
 *   3. `execute`      → VOTRE code, exécuté côté serveur avec les arguments.
 *                       Ici on délègue au DAL (`lib/dal/brewly-*.ts`) : l'outil
 *                       ne fait que brancher le modèle sur les données.
 *
 * ⚠️ Portée : ces outils sont PRIVÉS à cet agent, dans ce code. Pour partager
 * une boîte à outils entre plusieurs agents ou clients (Claude, un IDE, un
 * autre service), on expose un serveur MCP — c'est l'objet des modules suivants.
 */
export const brewlyTools = {
  // ── Outil FOURNI en exemple ────────────────────────────────────────────
  getOrderStatus: tool({
    description:
      "Récupère le statut et les détails d'une commande client à partir de son numéro (ex. 1042).",
    inputSchema: z.object({
      numeroCommande: z
        .string()
        .describe("Le numéro de commande, avec ou sans le « # »."),
    }),
    execute: async ({ numeroCommande }) => {
      const order = await getOrder(numeroCommande);
      if (!order) {
        return { trouvee: false as const, numeroCommande };
      }
      return { trouvee: true as const, ...order };
    },
  }),

  // ⚠️ À VOUS — Étape 1 (exercices/03-tools.md)
  // Écrivez l'outil `getProductInfo` : donne les infos d'un produit du
  // catalogue (prix, origine, intensité, stock) à partir de son nom, en
  // délégant à `findProductByName` (déjà fourni dans le DAL).
  getProductInfo: tool({
    description: "TODO — à compléter (exercices/03-tools.md, Étape 1)",
    // TODO : décrivez les arguments attendus (ex. le nom du produit).
    inputSchema: z.object({}),
    execute: async () => {
      return "⚠️ Outil à implémenter — suivez exercices/03-tools.md (Étape 1)";
    },
  }),

  // ⚠️ À VOUS — Étape 2 (exercices/03-tools.md)
  // Écrivez l'outil `listCatalog` : liste les produits du catalogue, avec un
  // filtre optionnel par catégorie (cafe, machine, accessoire), en délégant
  // à `listProducts` (déjà fourni dans le DAL).
  listCatalog: tool({
    description: "TODO — à compléter (exercices/03-tools.md, Étape 2)",
    // TODO : décrivez les arguments attendus (ex. la catégorie à filtrer).
    inputSchema: z.object({}),
    execute: async () => {
      return "⚠️ Outil à implémenter — suivez exercices/03-tools.md (Étape 2)";
    },
  }),
};
