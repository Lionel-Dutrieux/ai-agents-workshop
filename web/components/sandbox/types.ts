import type { ReactNode } from "react";

/** Valeur manipulable par un champ de formulaire sandbox. */
export type SandboxValue = string | number | boolean;

/** Jeu de valeurs d'un enregistrement, tel que géré par le formulaire. */
export type SandboxValues = Record<string, SandboxValue>;

/** Colonne d'affichage du tableau. */
export type SandboxColumn<T> = {
  /** Clé (propriété de la ligne). Sert aussi de clé React. */
  key: string;
  header: string;
  /** Rendu personnalisé (badge, formatage…). Par défaut : valeur brute. */
  cell?: (row: T) => ReactNode;
  className?: string;
};

export type SandboxFieldType =
  | "text"
  | "number"
  | "textarea"
  | "switch"
  | "select";

/** Champ du formulaire de création / édition. */
export type SandboxField = {
  name: string;
  label: string;
  type: SandboxFieldType;
  placeholder?: string;
  required?: boolean;
  /** Options pour le type "select". */
  options?: { label: string; value: string }[];
};

/** Les 4 opérations CRUD, typiquement des Server Actions. */
export type SandboxCrudActions<T, TInput extends SandboxValues> = {
  list: () => Promise<T[]>;
  create: (values: TInput) => Promise<void>;
  update: (id: string, values: TInput) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

/** Configuration complète d'un CRUD sandbox pour un modèle donné. */
export type SandboxCrudConfig<T, TInput extends SandboxValues> = {
  title?: string;
  description?: string;
  /** Identifiant stable d'une ligne (clé React + cible des mutations). */
  getRowId: (row: T) => string;
  columns: SandboxColumn<T>[];
  fields: SandboxField[];
  actions: SandboxCrudActions<T, TInput>;
  /** Valeurs par défaut d'un nouvel enregistrement. */
  emptyValues: TInput;
  /** Dérive les valeurs du formulaire depuis une ligne (édition). */
  toFormValues: (row: T) => TInput;
  /** Libellés personnalisables. */
  addLabel?: string;
  emptyLabel?: string;
};
