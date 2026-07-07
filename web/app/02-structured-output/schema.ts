import { z } from "zod";

/**
 * Schéma du ticket de support (Module 2 — Structured output).
 *
 * Source de vérité unique : le même schéma zod est utilisé côté serveur
 * (`streamObject`) et côté client (`useObject`). Les `.describe()` guident le
 * modèle sur ce qu'il doit remplir.
 */
// ⚠️ À VOUS — Étape 1 (exercices/02-structured-output.md)
// Décrivez la forme du ticket que le modèle doit produire : intention
// (enum), orderId (string nullable), sentiment (enum), priorite (enum),
// resume (string). Utilisez `.describe()` sur chaque champ pour guider le
// modèle.
export const ticketSchema = z.object({
  /* ⚠️ À VOUS — Étape 1 */
});

// Le type `Ticket` ci-dessous est utilisé par l'UI (TicketCard,
// TicketExtractor) pour afficher les champs du ticket. Pour que l'app
// compile même avant que vous ayez écrit `ticketSchema` (Étape 1), on le
// déclare ici explicitement plutôt que de le dériver du schéma avec
// `z.infer<typeof ticketSchema>` — une fois le schéma complété, gardez ce
// type synchronisé avec les champs que vous y ajoutez.
export type Ticket = {
  intention:
    | "question_produit"
    | "suivi_commande"
    | "reclamation"
    | "remboursement"
    | "autre";
  orderId: string | null;
  sentiment: "positif" | "neutre" | "negatif";
  priorite: "basse" | "moyenne" | "haute";
  resume: string;
};

/** Emails clients d'exemple, pour tester rapidement l'extraction. */
export const EXAMPLE_EMAILS: { label: string; body: string }[] = [
  {
    label: "Colis en retard (furieux)",
    body: "Bonjour, ma commande #1087 devait arriver il y a 10 jours et je n'ai toujours rien reçu. C'est absolument inadmissible, je veux une solution immédiatement !",
  },
  {
    label: "Question produit",
    body: "Bonjour, je cherche un café bien corsé pour faire des espressos à la maison. Que me conseillez-vous dans votre gamme de grains ? Merci d'avance.",
  },
  {
    label: "Demande de remboursement",
    body: "Bonjour, le moulin que j'ai reçu (commande #1042) est arrivé cassé. J'aimerais être remboursé, comment dois-je procéder ? Cordialement.",
  },
];
