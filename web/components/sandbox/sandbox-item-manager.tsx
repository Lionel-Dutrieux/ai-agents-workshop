"use client";

import { Badge } from "@/components/ui/badge";
import { SandboxCrud } from "./sandbox-crud";
import {
  createSandboxItemAction,
  deleteSandboxItemAction,
  listSandboxItemsAction,
  type SandboxItemFormInput,
  type SandboxItemRow,
  updateSandboxItemAction,
} from "./sandbox-item-actions";
import type { SandboxCrudConfig, SandboxValues } from "./types";

/**
 * EXEMPLE / TEMPLATE de sandbox CRUD (modèle `SandboxItem`).
 *
 * À copier pour exposer les vraies données d'un exercice : dupliquez le modèle
 * Prisma, le DAL, les Server Actions, puis cette config. La `config` est
 * définie au niveau module (référence stable, requise par SandboxCrud).
 */
const SANDBOX_ITEM_CONFIG: SandboxCrudConfig<SandboxItemRow, SandboxValues> = {
  title: "Catalogue (exemple)",
  description: "Données de démonstration — testez l'ajout, l'édition, la suppression.",
  addLabel: "Ajouter",
  getRowId: (row) => row.id,
  columns: [
    { key: "name", header: "Nom" },
    { key: "category", header: "Catégorie" },
    { key: "price", header: "Prix", cell: (row) => `${row.price} €` },
    {
      key: "inStock",
      header: "Stock",
      cell: (row) =>
        row.inStock ? (
          <Badge variant="secondary">En stock</Badge>
        ) : (
          <Badge variant="outline">Épuisé</Badge>
        ),
    },
  ],
  fields: [
    {
      name: "name",
      label: "Nom",
      type: "text",
      required: true,
      placeholder: "Espresso Roast",
    },
    {
      name: "category",
      label: "Catégorie",
      type: "select",
      required: true,
      options: [
        { label: "Café", value: "cafe" },
        { label: "Accessoire", value: "accessoire" },
        { label: "Abonnement", value: "abonnement" },
      ],
    },
    { name: "price", label: "Prix (€)", type: "number", placeholder: "12" },
    { name: "inStock", label: "En stock", type: "switch" },
    { name: "notes", label: "Notes", type: "textarea", placeholder: "Optionnel" },
  ],
  emptyValues: { name: "", category: "cafe", price: 0, inStock: true, notes: "" },
  toFormValues: (row) => ({
    name: row.name,
    category: row.category,
    price: row.price,
    inStock: row.inStock,
    notes: row.notes,
  }),
  actions: {
    list: listSandboxItemsAction,
    create: (values) => createSandboxItemAction(values as SandboxItemFormInput),
    update: (id, values) =>
      updateSandboxItemAction(id, values as SandboxItemFormInput),
    remove: deleteSandboxItemAction,
  },
};

/** Sandbox CRUD de démonstration prête à l'emploi. */
export function SandboxItemManager() {
  return <SandboxCrud config={SANDBOX_ITEM_CONFIG} />;
}
