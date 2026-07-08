import { z } from "zod";

/**
 * Schéma du ticket de support (Module 2 — Structured output).
 *
 * Source de vérité unique : le même schéma zod est utilisé côté serveur
 * (`streamObject`) et côté client (`useObject`). Les `.describe()` guident le
 * modèle sur ce qu'il doit remplir.
 */
export const ticketSchema = z.object({
  intention: z
    .enum([
      "question_produit",
      "suivi_commande",
      "reclamation",
      "remboursement",
      "autre",
    ])
    .describe("Intention principale du client"),
  orderId: z
    .string()
    .nullable()
    .describe("Numéro de commande mentionné dans l'email, ou null si absent"),
  sentiment: z
    .enum(["positif", "neutre", "negatif"])
    .describe("Ton général de l'email"),
  priorite: z
    .enum(["basse", "moyenne", "haute"])
    .describe("Priorité de traitement du ticket"),
  resume: z.string().describe("Résumé du besoin du client en une phrase"),
});

export type Ticket = z.infer<typeof ticketSchema>;

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
