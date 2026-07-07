// Décommentez ces imports au fil des étapes :
// import { generateObject, NoObjectGeneratedError, streamObject } from "ai";
// import { ticketSchema } from "@/app/02-structured-output/schema";
// import { resolveLanguageModel } from "@/lib/ai/models";

/**
 * Module 2 — Structured output (à compléter — voir exercices/02-structured-output.md).
 *
 * Transforme un email client (texte libre) en ticket structuré et typé.
 * Deux modes, pour comparer les deux approches du SDK :
 *  - `stream`   → `streamObject` : diffuse l'objet au fil de sa génération ;
 *  - `generate` → `generateObject` : attend l'objet complet, puis le renvoie.
 */

const INSTRUCTIONS = `Tu analyses les emails reçus par le support client de Brewly (boutique de café).
À partir de l'email fourni, extrais un ticket structuré :
- déduis l'intention, le sentiment et la priorité à partir du contenu et du ton ;
- si un numéro de commande est mentionné (ex. #1087), reporte-le, sinon mets null ;
- rédige un résumé neutre en une phrase.`;

type RequestBody = {
  email: string;
  model: string;
  mode?: "stream" | "generate";
};

export async function POST(req: Request) {
  const { email, model, mode = "stream" }: RequestBody = await req.json();

  // ⚠️ À VOUS — Étape 2 (exercices/02-structured-output.md)
  // Résolvez le modèle, puis appelez `generateObject` (mode "generate") ou
  // `streamObject` (mode "stream") avec `schema: ticketSchema` et
  // `instructions: INSTRUCTIONS`. Renvoyez le résultat au client (voir la
  // fiche pour la gestion de `NoObjectGeneratedError`).
  return new Response(
    "Module 02 à implémenter — suivez exercices/02-structured-output.md",
    { status: 501 }
  );
}
