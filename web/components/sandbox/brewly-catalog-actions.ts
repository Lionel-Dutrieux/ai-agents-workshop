"use server";

import { z } from "zod";
import * as catalog from "@/lib/dal/brewly-catalog";

export type { ProductRow } from "@/lib/dal/brewly-catalog";

/**
 * Server Actions de la sandbox « Catalogue Brewly » : validation zod à la
 * frontière, délégation au DAL (`lib/dal/brewly-catalog.ts`). C'est ce même DAL
 * que lisent les outils de l'agent — d'où l'effet « je modifie, l'agent voit ».
 */

const idSchema = z.string().min(1);

const inputSchema = z.object({
  reference: z.string().min(1),
  nom: z.string().min(1),
  categorie: z.enum(["cafe", "machine", "accessoire"]),
  prix: z.number().min(0),
  origine: z.string(),
  intensite: z.number().int().min(0).max(10),
  description: z.string(),
  enStock: z.boolean(),
});

/** Entrée telle que produite par le formulaire sandbox (champs plats). */
export type BrewlyProductFormInput = z.input<typeof inputSchema>;

/**
 * Normalise l'entrée du formulaire vers le DTO du DAL : `origine`/`intensite`
 * vides valent `null` (machines et accessoires n'en ont pas).
 */
function toDalInput(input: z.output<typeof inputSchema>) {
  return {
    ...input,
    origine: input.origine.trim() === "" ? null : input.origine.trim(),
    intensite:
      input.categorie === "cafe" && input.intensite > 0
        ? input.intensite
        : null,
  };
}

export async function listBrewlyProductsAction() {
  return catalog.listProducts();
}

export async function createBrewlyProductAction(input: BrewlyProductFormInput) {
  return catalog.createProduct(toDalInput(inputSchema.parse(input)));
}

export async function updateBrewlyProductAction(
  id: string,
  input: BrewlyProductFormInput
) {
  return catalog.updateProduct(
    idSchema.parse(id),
    toDalInput(inputSchema.parse(input))
  );
}

export async function deleteBrewlyProductAction(id: string) {
  return catalog.deleteProduct(idSchema.parse(id));
}
