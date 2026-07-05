"use server";

import { z } from "zod";
import * as orders from "@/lib/dal/brewly-orders";

export type { OrderRow } from "@/lib/dal/brewly-orders";

/**
 * Server Actions de la sandbox « Commandes Brewly » : validation zod à la
 * frontière, délégation au DAL (`lib/dal/brewly-orders.ts`) — le même DAL que
 * lisent les outils de l'agent.
 */

const idSchema = z.string().min(1);

const inputSchema = z.object({
  numero: z.string().min(1),
  statut: z.enum(["en_preparation", "expediee", "livree", "annulee"]),
  // Saisi en textarea : un article par ligne.
  articles: z.string(),
  total: z.number().min(0),
  commandeeLe: z.string(),
  livraisonEstimee: z.string(),
  transporteur: z.string(),
});

/** Entrée telle que produite par le formulaire sandbox (champs plats). */
export type BrewlyOrderFormInput = z.input<typeof inputSchema>;

/** Normalise l'entrée du formulaire vers le DTO du DAL. */
function toDalInput(input: z.output<typeof inputSchema>) {
  const emptyToNull = (value: string) =>
    value.trim() === "" ? null : value.trim();
  return {
    numero: input.numero.trim(),
    statut: input.statut,
    articles: input.articles
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
    total: input.total,
    commandeeLe: input.commandeeLe.trim(),
    livraisonEstimee: emptyToNull(input.livraisonEstimee),
    transporteur: emptyToNull(input.transporteur),
  };
}

export async function listBrewlyOrdersAction() {
  return orders.listOrders();
}

export async function createBrewlyOrderAction(input: BrewlyOrderFormInput) {
  return orders.createOrder(toDalInput(inputSchema.parse(input)));
}

export async function updateBrewlyOrderAction(
  id: string,
  input: BrewlyOrderFormInput
) {
  return orders.updateOrder(
    idSchema.parse(id),
    toDalInput(inputSchema.parse(input))
  );
}

export async function deleteBrewlyOrderAction(id: string) {
  return orders.deleteOrder(idSchema.parse(id));
}
