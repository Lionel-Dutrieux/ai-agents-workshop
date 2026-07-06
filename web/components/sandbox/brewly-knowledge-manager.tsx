"use client";

import { Badge } from "@/components/ui/badge";
import { SandboxCrud } from "./sandbox-crud";
import {
  type BrewlyKnowledgeFormInput,
  createBrewlyKnowledgeAction,
  deleteBrewlyKnowledgeAction,
  type KnowledgeRow,
  listBrewlyKnowledgeAction,
  updateBrewlyKnowledgeAction,
} from "./brewly-knowledge-actions";
import type { SandboxCrudConfig, SandboxValues } from "./types";

const CATEGORY_LABELS: Record<string, string> = {
  politique: "Politique",
  faq: "FAQ",
  guide: "Guide",
  produit: "Produit",
  interne: "Interne",
};

/**
 * Sandbox CRUD du centre de connaissances Brewly (`lib/dal/brewly-knowledge`),
 * la base documentaire du module RAG. Piégée à dessein : article obsolète non
 * publié, note interne, politiques qui se recoupent — modifier un article ici
 * changera ce que le pipeline RAG récupère. Config au niveau module.
 */
const BREWLY_KNOWLEDGE_CONFIG: SandboxCrudConfig<KnowledgeRow, SandboxValues> =
  {
    title: "Centre de connaissances (base SQLite)",
    description:
      "Les articles que le pipeline RAG découpera en chunks et interrogera. Modifiez un article, la récupération changera.",
    addLabel: "Ajouter un article",
    getRowId: (row) => row.id,
    columns: [
      { key: "reference", header: "Réf." },
      { key: "titre", header: "Titre" },
      {
        key: "categorie",
        header: "Catégorie",
        cell: (row) => (
          <Badge variant="outline">
            {CATEGORY_LABELS[row.categorie] ?? row.categorie}
          </Badge>
        ),
      },
      {
        key: "contenu",
        header: "Contenu",
        cell: (row) => (
          <span className="text-muted-foreground text-xs">
            {row.contenu.length > 80
              ? `${row.contenu.slice(0, 80)}…`
              : row.contenu}
          </span>
        ),
      },
      {
        key: "publie",
        header: "Statut",
        cell: (row) =>
          row.publie ? (
            <Badge variant="secondary">Publié</Badge>
          ) : (
            <Badge variant="outline">Archivé</Badge>
          ),
      },
    ],
    fields: [
      {
        name: "reference",
        label: "Référence",
        type: "text",
        required: true,
        placeholder: "KB-21",
      },
      {
        name: "titre",
        label: "Titre",
        type: "text",
        required: true,
        placeholder: "Guide — …",
      },
      {
        name: "categorie",
        label: "Catégorie",
        type: "select",
        required: true,
        options: [
          { label: "Politique", value: "politique" },
          { label: "FAQ", value: "faq" },
          { label: "Guide", value: "guide" },
          { label: "Produit", value: "produit" },
          { label: "Interne", value: "interne" },
        ],
      },
      {
        name: "contenu",
        label: "Contenu",
        type: "textarea",
        required: true,
        placeholder: "Le corps de l'article, plusieurs paragraphes…",
      },
      {
        name: "tags",
        label: "Tags (séparés par des virgules)",
        type: "text",
        placeholder: "retours, remboursement",
      },
      { name: "publie", label: "Publié", type: "switch" },
    ],
    emptyValues: {
      reference: "",
      titre: "",
      categorie: "guide",
      contenu: "",
      tags: "",
      publie: true,
    },
    toFormValues: (row) => ({
      reference: row.reference,
      titre: row.titre,
      categorie: row.categorie,
      contenu: row.contenu,
      tags: row.tags.join(", "),
      publie: row.publie,
    }),
    actions: {
      list: listBrewlyKnowledgeAction,
      create: (values) =>
        createBrewlyKnowledgeAction(values as BrewlyKnowledgeFormInput),
      update: (id, values) =>
        updateBrewlyKnowledgeAction(id, values as BrewlyKnowledgeFormInput),
      remove: deleteBrewlyKnowledgeAction,
    },
  };

/** Sandbox CRUD du centre de connaissances, prête pour le module RAG. */
export function BrewlyKnowledgeManager() {
  return <SandboxCrud config={BREWLY_KNOWLEDGE_CONFIG} />;
}
