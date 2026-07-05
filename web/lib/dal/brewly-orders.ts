import "server-only";

import { prisma } from "@/lib/prisma";

/**
 * Commandes clients de Brewly — DAL des modules 03/04.
 *
 * ⚠️ Atelier : ces fonctions sont FOURNIES. Vos outils (`tools.ts`) les
 * utilisent, vous ne les codez pas. Comme le catalogue, les données vivent dans
 * une vraie base SQLite (via Prisma) et sont éditables depuis la sandbox : la
 * base est peuplée explicitement via le seeder centralisé (`lib/dal/seed.ts`).
 *
 * `articles` est stocké en JSON (SQLite n'a pas de type liste) et exposé comme
 * `string[]` dans le DTO.
 */

/** Statut d'une commande, tel qu'exposé aux outils (DTO). */
export type Order = {
  numero: string;
  statut: "en_preparation" | "expediee" | "livree" | "annulee";
  articles: string[];
  total: number;
  commandeeLe: string;
  livraisonEstimee: string | null;
  transporteur: string | null;
};

/** Ligne complète (DTO + id), telle qu'utilisée par la sandbox. */
export type OrderRow = Order & { id: string };

/** Entrée de création / mise à jour (sans id ni horodatage). */
export type OrderInput = Order;

/** Données d'amorçage : les commandes canoniques de démo (source du seeder). */
export const ORDERS_SEED: Order[] = [
  {
    numero: "1042",
    statut: "expediee",
    articles: ["Moulin à meules coniques", "Colombie Supremo"],
    total: 140.5,
    commandeeLe: "2026-06-28",
    livraisonEstimee: "2026-07-07",
    transporteur: "Colissimo",
  },
  {
    numero: "1087",
    statut: "en_preparation",
    articles: ["Machine Silvia Pro"],
    total: 749,
    commandeeLe: "2026-07-03",
    livraisonEstimee: "2026-07-10",
    transporteur: null,
  },
  {
    numero: "1091",
    statut: "livree",
    articles: ["Éthiopie Sidamo", "Balance de précision 0,1 g"],
    total: 51.9,
    commandeeLe: "2026-06-20",
    livraisonEstimee: "2026-06-24",
    transporteur: "Chronopost",
  },
  {
    numero: "1102",
    statut: "annulee",
    articles: ["Espresso Bar Italiano"],
    total: 10.9,
    commandeeLe: "2026-07-01",
    livraisonEstimee: null,
    transporteur: null,
  },
];

const SELECT = {
  id: true,
  numero: true,
  statut: true,
  articles: true,
  total: true,
  commandeeLe: true,
  livraisonEstimee: true,
  transporteur: true,
} as const;

type Raw = {
  id: string;
  numero: string;
  statut: string;
  articles: string;
  total: number;
  commandeeLe: string;
  livraisonEstimee: string | null;
  transporteur: string | null;
};

function parseArticles(json: string): string[] {
  try {
    const value = JSON.parse(json);
    return Array.isArray(value) ? value.map(String) : [];
  } catch {
    return [];
  }
}

function toRow(raw: Raw): OrderRow {
  return {
    ...raw,
    statut: raw.statut as Order["statut"],
    articles: parseArticles(raw.articles),
  };
}

/** Transforme un DTO en données de persistance (articles → JSON). */
function toRecord(input: OrderInput) {
  return { ...input, articles: JSON.stringify(input.articles) };
}

/** Nombre de commandes actuellement en base. */
export async function countOrders(): Promise<number> {
  return prisma.brewlyOrder.count();
}

/**
 * Vide puis réinsère les commandes canoniques (`ORDERS_SEED`). Idempotent :
 * appelé par le seeder centralisé. Renvoie le nombre de commandes insérées.
 */
export async function resetOrders(): Promise<number> {
  await prisma.brewlyOrder.deleteMany();
  await prisma.brewlyOrder.createMany({ data: ORDERS_SEED.map(toRecord) });
  return ORDERS_SEED.length;
}

/** Liste toutes les commandes. */
export async function listOrders(): Promise<OrderRow[]> {
  const rows = await prisma.brewlyOrder.findMany({
    orderBy: { numero: "asc" },
    select: SELECT,
  });
  return rows.map(toRow);
}

/**
 * Récupère une commande par son numéro (avec ou sans le « # »).
 * Renvoie `null` si aucune commande ne correspond.
 */
export async function getOrder(numero: string): Promise<OrderRow | null> {
  const clean = numero.replace(/[^0-9]/g, "");
  if (!clean) {
    return null;
  }
  const row = await prisma.brewlyOrder.findUnique({
    where: { numero: clean },
    select: SELECT,
  });
  return row ? toRow(row) : null;
}

/** Crée une commande (sandbox CRUD). */
export async function createOrder(input: OrderInput): Promise<void> {
  await prisma.brewlyOrder.create({ data: toRecord(input) });
}

/** Met à jour une commande par id (sandbox CRUD). */
export async function updateOrder(
  id: string,
  input: OrderInput
): Promise<void> {
  await prisma.brewlyOrder.update({
    where: { id },
    data: { ...toRecord(input), updatedAt: new Date() },
  });
}

/** Supprime une commande par id (sandbox CRUD). */
export async function deleteOrder(id: string): Promise<void> {
  await prisma.brewlyOrder.delete({ where: { id } }).catch(() => {
    // Déjà supprimée : rien à faire.
  });
}
