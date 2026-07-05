import { tool } from "ai";
import { z } from "zod";
import { findProductByName, listProducts } from "@/lib/dal/brewly-catalog";
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

  // ── Outil À ÉCRIRE n°1 ─────────────────────────────────────────────────
  getProductInfo: tool({
    description:
      "Donne les informations d'un produit du catalogue Brewly (prix, origine, intensité, stock) à partir de son nom.",
    inputSchema: z.object({
      nom: z
        .string()
        .describe("Le nom (ou une partie du nom) du produit recherché."),
    }),
    execute: async ({ nom }) => {
      const product = await findProductByName(nom);
      if (!product) {
        return { trouve: false as const, nom };
      }
      return { trouve: true as const, ...product };
    },
  }),

  // ── Outil À ÉCRIRE n°2 ─────────────────────────────────────────────────
  listCatalog: tool({
    description:
      "Liste les produits du catalogue Brewly, éventuellement filtrés par catégorie (café, machine, accessoire). Utile pour conseiller ou comparer.",
    inputSchema: z.object({
      categorie: z
        .enum(["cafe", "machine", "accessoire"])
        .nullable()
        .describe("Catégorie à filtrer, ou null pour tout le catalogue."),
    }),
    execute: async ({ categorie }) => {
      const produits = await listProducts(categorie ?? undefined);
      return { nombre: produits.length, produits };
    },
  }),
};
