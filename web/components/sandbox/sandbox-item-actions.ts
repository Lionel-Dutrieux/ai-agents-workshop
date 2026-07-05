"use server";

import { z } from "zod";
import * as items from "@/lib/dal/sandbox-items";

export type { SandboxItemRow } from "@/lib/dal/sandbox-items";

/**
 * Server Actions de l'exemple sandbox. Modèle à copier : validation zod à la
 * frontière, délégation au DAL.
 */

const idSchema = z.string().min(1);

const inputSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  price: z.number().int().min(0),
  inStock: z.boolean(),
  notes: z.string(),
});

export type SandboxItemFormInput = z.input<typeof inputSchema>;

export async function listSandboxItemsAction() {
  return items.listSandboxItems();
}

export async function createSandboxItemAction(input: SandboxItemFormInput) {
  return items.createSandboxItem(inputSchema.parse(input));
}

export async function updateSandboxItemAction(
  id: string,
  input: SandboxItemFormInput
) {
  return items.updateSandboxItem(idSchema.parse(id), inputSchema.parse(input));
}

export async function deleteSandboxItemAction(id: string) {
  return items.deleteSandboxItem(idSchema.parse(id));
}
