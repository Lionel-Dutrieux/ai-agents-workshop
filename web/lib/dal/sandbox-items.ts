import "server-only";

import { prisma } from "@/lib/prisma";

/**
 * DAL de l'exemple sandbox (`SandboxItem`). Sert de modèle à copier pour
 * exposer les vraies données d'un exercice dans la sandbox CRUD.
 */

export type SandboxItemRow = {
  id: string;
  name: string;
  category: string;
  price: number;
  inStock: boolean;
  notes: string;
};

export type SandboxItemInput = {
  name: string;
  category: string;
  price: number;
  inStock: boolean;
  notes: string;
};

/** Jeu d'exemple canonique de la démo sandbox (source du seeder). */
export const SANDBOX_SEED: SandboxItemInput[] = [
  {
    name: "Espresso Roast",
    category: "cafe",
    price: 12,
    inStock: true,
    notes: "Torréfaction foncée, notes cacaotées.",
  },
  {
    name: "Tasse en grès",
    category: "accessoire",
    price: 18,
    inStock: true,
    notes: "",
  },
  {
    name: "Abonnement Découverte",
    category: "abonnement",
    price: 25,
    inStock: false,
    notes: "Un café différent chaque mois.",
  },
];

const SELECT = {
  id: true,
  name: true,
  category: true,
  price: true,
  inStock: true,
  notes: true,
} as const;

function toRow(item: {
  id: string;
  name: string;
  category: string;
  price: number;
  inStock: boolean;
  notes: string | null;
}): SandboxItemRow {
  return { ...item, notes: item.notes ?? "" };
}

export async function listSandboxItems(): Promise<SandboxItemRow[]> {
  const rows = await prisma.sandboxItem.findMany({
    orderBy: { createdAt: "desc" },
    select: SELECT,
  });
  return rows.map(toRow);
}

export async function createSandboxItem(input: SandboxItemInput): Promise<void> {
  await prisma.sandboxItem.create({
    data: { ...input, notes: input.notes || null },
  });
}

export async function updateSandboxItem(
  id: string,
  input: SandboxItemInput
): Promise<void> {
  await prisma.sandboxItem.update({
    where: { id },
    data: { ...input, notes: input.notes || null, updatedAt: new Date() },
  });
}

export async function deleteSandboxItem(id: string): Promise<void> {
  await prisma.sandboxItem.delete({ where: { id } }).catch(() => {
    // Déjà supprimé : rien à faire.
  });
}

/** Nombre d'items de démo en base. */
export async function countSandboxItems(): Promise<number> {
  return prisma.sandboxItem.count();
}

/**
 * Vide puis réinsère le jeu d'exemple canonique (`SANDBOX_SEED`). Appelé par le
 * seeder centralisé. Renvoie le nombre d'items insérés.
 */
export async function resetSandboxItems(): Promise<number> {
  await prisma.sandboxItem.deleteMany();
  await prisma.sandboxItem.createMany({
    data: SANDBOX_SEED.map((item) => ({
      ...item,
      notes: item.notes || null,
    })),
  });
  return SANDBOX_SEED.length;
}
