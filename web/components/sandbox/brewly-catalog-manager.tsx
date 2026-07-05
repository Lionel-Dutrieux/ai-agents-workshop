"use client";

import { Badge } from "@/components/ui/badge";
import { SandboxCrud } from "./sandbox-crud";
import {
  type BrewlyProductFormInput,
  createBrewlyProductAction,
  deleteBrewlyProductAction,
  listBrewlyProductsAction,
  type ProductRow,
  updateBrewlyProductAction,
} from "./brewly-catalog-actions";
import type { SandboxCrudConfig, SandboxValues } from "./types";

const CATEGORY_LABELS: Record<string, string> = {
  cafe: "Café",
  machine: "Machine",
  accessoire: "Accessoire",
};

/**
 * Sandbox CRUD branchée sur le VRAI catalogue Brewly (`lib/dal/brewly-catalog`),
 * celui-là même que lisent les outils de l'agent au module 03. Modifier une
 * ligne ici change ce que l'agent répond : c'est la démonstration « d'où
 * viennent les données ». Config au niveau module (référence stable).
 */
const BREWLY_CATALOG_CONFIG: SandboxCrudConfig<ProductRow, SandboxValues> = {
  title: "Catalogue Brewly (base SQLite)",
  description:
    "La table que vos outils interrogent. Modifiez une ligne, puis reposez la question à l'agent.",
  addLabel: "Ajouter un produit",
  getRowId: (row) => row.id,
  columns: [
    { key: "reference", header: "Réf." },
    { key: "nom", header: "Nom" },
    {
      key: "categorie",
      header: "Catégorie",
      cell: (row) => (
        <Badge variant="outline">
          {CATEGORY_LABELS[row.categorie] ?? row.categorie}
        </Badge>
      ),
    },
    { key: "prix", header: "Prix", cell: (row) => `${row.prix} €` },
    {
      key: "intensite",
      header: "Intensité",
      cell: (row) => (row.intensite == null ? "—" : `${row.intensite}/10`),
    },
    {
      key: "enStock",
      header: "Stock",
      cell: (row) =>
        row.enStock ? (
          <Badge variant="secondary">En stock</Badge>
        ) : (
          <Badge variant="outline">Épuisé</Badge>
        ),
    },
  ],
  fields: [
    {
      name: "reference",
      label: "Référence",
      type: "text",
      required: true,
      placeholder: "CAF-KEN",
    },
    {
      name: "nom",
      label: "Nom",
      type: "text",
      required: true,
      placeholder: "Kenya AA",
    },
    {
      name: "categorie",
      label: "Catégorie",
      type: "select",
      required: true,
      options: [
        { label: "Café", value: "cafe" },
        { label: "Machine", value: "machine" },
        { label: "Accessoire", value: "accessoire" },
      ],
    },
    { name: "prix", label: "Prix (€)", type: "number", placeholder: "12.9" },
    {
      name: "origine",
      label: "Origine (cafés)",
      type: "text",
      placeholder: "Kenya",
    },
    {
      name: "intensite",
      label: "Intensité 1–10 (cafés)",
      type: "number",
      placeholder: "5",
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Notes de dégustation…",
    },
    { name: "enStock", label: "En stock", type: "switch" },
  ],
  emptyValues: {
    reference: "",
    nom: "",
    categorie: "cafe",
    prix: 0,
    origine: "",
    intensite: 0,
    description: "",
    enStock: true,
  },
  toFormValues: (row) => ({
    reference: row.reference,
    nom: row.nom,
    categorie: row.categorie,
    prix: row.prix,
    origine: row.origine ?? "",
    intensite: row.intensite ?? 0,
    description: row.description,
    enStock: row.enStock,
  }),
  actions: {
    list: listBrewlyProductsAction,
    create: (values) =>
      createBrewlyProductAction(values as BrewlyProductFormInput),
    update: (id, values) =>
      updateBrewlyProductAction(id, values as BrewlyProductFormInput),
    remove: deleteBrewlyProductAction,
  },
};

/** Sandbox CRUD du catalogue Brewly, prête à l'emploi pour le module 03. */
export function BrewlyCatalogManager() {
  return <SandboxCrud config={BREWLY_CATALOG_CONFIG} />;
}
