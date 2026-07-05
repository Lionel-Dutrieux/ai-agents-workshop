"use client";

import { Badge } from "@/components/ui/badge";
import {
  type BrewlyOrderFormInput,
  createBrewlyOrderAction,
  deleteBrewlyOrderAction,
  listBrewlyOrdersAction,
  type OrderRow,
  updateBrewlyOrderAction,
} from "./brewly-orders-actions";
import { SandboxCrud } from "./sandbox-crud";
import type { SandboxCrudConfig, SandboxValues } from "./types";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

const STATUT_LABELS: Record<string, string> = {
  en_preparation: "En préparation",
  expediee: "Expédiée",
  livree: "Livrée",
  annulee: "Annulée",
};

const STATUT_VARIANT: Record<string, BadgeVariant> = {
  en_preparation: "outline",
  expediee: "secondary",
  livree: "default",
  annulee: "destructive",
};

/**
 * Sandbox CRUD branchée sur les VRAIES commandes Brewly (`lib/dal/brewly-orders`),
 * celles que lisent les outils de l'agent. Modifier une ligne ici change ce que
 * l'agent répond.
 */
const BREWLY_ORDERS_CONFIG: SandboxCrudConfig<OrderRow, SandboxValues> = {
  title: "Commandes Brewly (base SQLite)",
  description:
    "Les commandes que vos outils interrogent. Passez-en une « Livrée », puis reposez la question à l'agent.",
  addLabel: "Ajouter une commande",
  getRowId: (row) => row.id,
  columns: [
    { key: "numero", header: "N°", cell: (row) => `#${row.numero}` },
    {
      key: "statut",
      header: "Statut",
      cell: (row) => (
        <Badge variant={STATUT_VARIANT[row.statut] ?? "outline"}>
          {STATUT_LABELS[row.statut] ?? row.statut}
        </Badge>
      ),
    },
    {
      key: "articles",
      header: "Articles",
      cell: (row) => row.articles.join(", ") || "—",
    },
    { key: "total", header: "Total", cell: (row) => `${row.total} €` },
    { key: "livraisonEstimee", header: "Livraison", cell: (row) => row.livraisonEstimee ?? "—" },
    { key: "transporteur", header: "Transporteur", cell: (row) => row.transporteur ?? "—" },
  ],
  fields: [
    { name: "numero", label: "Numéro", type: "text", required: true, placeholder: "1103" },
    {
      name: "statut",
      label: "Statut",
      type: "select",
      required: true,
      options: [
        { label: "En préparation", value: "en_preparation" },
        { label: "Expédiée", value: "expediee" },
        { label: "Livrée", value: "livree" },
        { label: "Annulée", value: "annulee" },
      ],
    },
    {
      name: "articles",
      label: "Articles (un par ligne)",
      type: "textarea",
      placeholder: "Éthiopie Sidamo\nMoulin à meules coniques",
    },
    { name: "total", label: "Total (€)", type: "number", placeholder: "51.9" },
    { name: "commandeeLe", label: "Commandée le (AAAA-MM-JJ)", type: "text", placeholder: "2026-07-05" },
    { name: "livraisonEstimee", label: "Livraison estimée (AAAA-MM-JJ)", type: "text", placeholder: "2026-07-12" },
    { name: "transporteur", label: "Transporteur", type: "text", placeholder: "Colissimo" },
  ],
  emptyValues: {
    numero: "",
    statut: "en_preparation",
    articles: "",
    total: 0,
    commandeeLe: "",
    livraisonEstimee: "",
    transporteur: "",
  },
  toFormValues: (row) => ({
    numero: row.numero,
    statut: row.statut,
    articles: row.articles.join("\n"),
    total: row.total,
    commandeeLe: row.commandeeLe,
    livraisonEstimee: row.livraisonEstimee ?? "",
    transporteur: row.transporteur ?? "",
  }),
  actions: {
    list: listBrewlyOrdersAction,
    create: (values) => createBrewlyOrderAction(values as BrewlyOrderFormInput),
    update: (id, values) =>
      updateBrewlyOrderAction(id, values as BrewlyOrderFormInput),
    remove: deleteBrewlyOrderAction,
  },
};

/** Sandbox CRUD des commandes Brewly, prête à l'emploi. */
export function BrewlyOrdersManager() {
  return <SandboxCrud config={BREWLY_ORDERS_CONFIG} />;
}
