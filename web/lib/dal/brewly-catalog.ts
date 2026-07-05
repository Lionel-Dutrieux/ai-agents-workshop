import "server-only";

import { prisma } from "@/lib/prisma";

/**
 * Catalogue produits de Brewly — DAL du module 03 (Tool calling).
 *
 * ⚠️ Atelier : ces fonctions sont FOURNIES. Vous n'avez pas à les modifier —
 * vous les *utilisez* depuis vos outils (`tools.ts`) pour aller chercher
 * l'information. C'est le rôle d'un Data Access Layer : isoler l'accès aux
 * données pour que le reste du code (ici, les outils) ne s'en préoccupe pas.
 *
 * Les données vivent dans une vraie base SQLite (via Prisma). La sandbox CRUD
 * du tutoriel écrit dans cette même table : modifier un produit là-bas change
 * ce que ces fonctions renvoient — et donc ce que l'agent répond. La base est
 * peuplée explicitement via le seeder centralisé (bouton sur l'accueil) : voir
 * `CATALOG_SEED` / `resetCatalog` ci-dessous et `lib/dal/seed.ts`.
 */

/** Un produit du catalogue, tel qu'exposé aux outils (DTO). */
export type Product = {
  reference: string;
  nom: string;
  categorie: "cafe" | "machine" | "accessoire";
  prix: number;
  origine: string | null;
  intensite: number | null;
  description: string;
  enStock: boolean;
};

/** Ligne complète du catalogue (DTO + id), telle qu'utilisée par la sandbox. */
export type ProductRow = Product & { id: string };

/** Entrée de création / mise à jour (sans id ni horodatage). */
export type ProductInput = Product;

/** Données d'amorçage : le catalogue canonique de Brewly (source du seeder). */
export const CATALOG_SEED: Product[] = [
  {
    reference: "CAF-ETH",
    nom: "Éthiopie Sidamo",
    categorie: "cafe",
    prix: 12.9,
    origine: "Éthiopie",
    intensite: 4,
    description:
      "Café de spécialité aux notes florales et fruitées, idéal en filtre.",
    enStock: true,
  },
  {
    reference: "CAF-COL",
    nom: "Colombie Supremo",
    categorie: "cafe",
    prix: 11.5,
    origine: "Colombie",
    intensite: 6,
    description: "Équilibré et rond, sur des notes de chocolat et de noisette.",
    enStock: true,
  },
  {
    reference: "CAF-ITA",
    nom: "Espresso Bar Italiano",
    categorie: "cafe",
    prix: 10.9,
    origine: "Assemblage",
    intensite: 9,
    description:
      "Assemblage corsé pour un espresso intense avec une belle crema.",
    enStock: false,
  },
  {
    reference: "MAC-SIL",
    nom: "Machine Silvia Pro",
    categorie: "machine",
    prix: 749,
    origine: null,
    intensite: null,
    description:
      "Machine espresso à porte-filtre pour les passionnés qui veulent tout régler.",
    enStock: true,
  },
  {
    reference: "MAC-AUT",
    nom: "Machine Auto Barista",
    categorie: "machine",
    prix: 499,
    origine: null,
    intensite: null,
    description:
      "Machine automatique avec broyeur intégré : espresso en un bouton.",
    enStock: true,
  },
  {
    reference: "ACC-MOU",
    nom: "Moulin à meules coniques",
    categorie: "accessoire",
    prix: 129,
    origine: null,
    intensite: null,
    description:
      "Moulin réglable de l'espresso au filtre, pour une mouture régulière.",
    enStock: true,
  },
  {
    reference: "ACC-BAL",
    nom: "Balance de précision 0,1 g",
    categorie: "accessoire",
    prix: 39,
    origine: null,
    intensite: null,
    description: "Balance avec minuteur pour doser au gramme près.",
    enStock: true,
  },
];

const SELECT = {
  id: true,
  reference: true,
  nom: true,
  categorie: true,
  prix: true,
  origine: true,
  intensite: true,
  description: true,
  enStock: true,
} as const;

type Raw = {
  id: string;
  reference: string;
  nom: string;
  categorie: string;
  prix: number;
  origine: string | null;
  intensite: number | null;
  description: string;
  enStock: boolean;
};

function toRow(raw: Raw): ProductRow {
  return { ...raw, categorie: raw.categorie as Product["categorie"] };
}

/** Nombre de produits actuellement en base. */
export async function countProducts(): Promise<number> {
  return prisma.brewlyProduct.count();
}

/**
 * Vide puis réinsère le catalogue canonique (`CATALOG_SEED`). Idempotent :
 * appelé par le seeder centralisé pour remettre la base dans un état propre.
 * Renvoie le nombre de produits insérés.
 */
export async function resetCatalog(): Promise<number> {
  await prisma.brewlyProduct.deleteMany();
  await prisma.brewlyProduct.createMany({ data: CATALOG_SEED });
  return CATALOG_SEED.length;
}

/** Liste tout le catalogue (éventuellement filtré par catégorie). */
export async function listProducts(
  categorie?: Product["categorie"]
): Promise<ProductRow[]> {
  const rows = await prisma.brewlyProduct.findMany({
    where: categorie ? { categorie } : undefined,
    orderBy: { reference: "asc" },
    select: SELECT,
  });
  return rows.map(toRow);
}

/**
 * Recherche un produit par nom (insensible à la casse et aux accents).
 * Renvoie le premier produit dont le nom contient le terme, ou `null`.
 */
export async function findProductByName(
  query: string
): Promise<ProductRow | null> {
  const needle = normalize(query);
  if (!needle) {
    return null;
  }
  const rows = await prisma.brewlyProduct.findMany({ select: SELECT });
  return rows.map(toRow).find((p) => normalize(p.nom).includes(needle)) ?? null;
}

/** Crée un produit (sandbox CRUD). */
export async function createProduct(input: ProductInput): Promise<void> {
  await prisma.brewlyProduct.create({ data: input });
}

/** Met à jour un produit par id (sandbox CRUD). */
export async function updateProduct(
  id: string,
  input: ProductInput
): Promise<void> {
  await prisma.brewlyProduct.update({
    where: { id },
    data: { ...input, updatedAt: new Date() },
  });
}

/** Supprime un produit par id (sandbox CRUD). */
export async function deleteProduct(id: string): Promise<void> {
  await prisma.brewlyProduct.delete({ where: { id } }).catch(() => {
    // Déjà supprimé : rien à faire.
  });
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}
