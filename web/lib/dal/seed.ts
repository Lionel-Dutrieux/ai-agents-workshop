import "server-only";

import { countProducts, resetCatalog } from "./brewly-catalog";
import { countOrders, resetOrders } from "./brewly-orders";
import { countConversations, deleteAllConversations } from "./conversations";
import { countSandboxItems, resetSandboxItems } from "./sandbox-items";

/**
 * Seeder centralisé du workshop.
 *
 * Point d'entrée UNIQUE pour (ré)initialiser les données de démonstration,
 * déclenché explicitement depuis l'accueil (jamais automatiquement). Chaque
 * domaine expose son `reset*` ; ce module ne fait que les orchestrer.
 *
 * ⚠️ Périmètre volontaire : on ne touche QU'aux données de démo et à
 * l'historique de chat. Les tables de config runtime `Model` (modèles LLM
 * ajoutés par le participant) et `McpServer` sont PRÉSERVÉES — les vider en
 * pleine session couperait la connexion au LLM. Voir aussi la carte
 * `components/demo-data`.
 */

/** État courant des données de démo, pour l'affichage. */
export type SeedStatus = {
  products: number;
  orders: number;
  sandboxItems: number;
  conversations: number;
};

/** Résumé de ce que le seeder a (ré)inséré / effacé. */
export type SeedResult = {
  products: number;
  orders: number;
  sandboxItems: number;
  conversationsCleared: number;
};

export async function getSeedStatus(): Promise<SeedStatus> {
  const [products, orders, sandboxItems, conversations] = await Promise.all([
    countProducts(),
    countOrders(),
    countSandboxItems(),
    countConversations(),
  ]);
  return { products, orders, sandboxItems, conversations };
}

/**
 * Remet les données de démo dans leur état canonique et efface l'historique
 * de chat. Idempotent : rejouable autant de fois que voulu.
 */
export async function seedDatabase(): Promise<SeedResult> {
  const [products, orders, sandboxItems, conversationsCleared] =
    await Promise.all([
      resetCatalog(),
      resetOrders(),
      resetSandboxItems(),
      deleteAllConversations(),
    ]);
  return { products, orders, sandboxItems, conversationsCleared };
}
