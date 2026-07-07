import { NoObjectGeneratedError } from "ai";
// Décommentez ces imports au fil des étapes :
// import { generateObject, streamObject } from "ai";
import { ticketSchema } from "@/app/02-structured-output/schema";
import { resolveLanguageModel } from "@/lib/ai/models";

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

  const languageModel = await resolveLanguageModel(model);

  // Mode « one-shot » : on attend l'objet complet et validé, puis on le renvoie
  // d'un bloc. Simple à consommer, mais aucun retour visuel avant la fin.
  if (mode === "generate") {
    try {
      // ⚠️ À VOUS — Étape 2b (exercices/02-structured-output.md)
      // Appelez `generateObject` avec `model: languageModel`,
      // `schema: ticketSchema`, `instructions: INSTRUCTIONS` et
      // `prompt: email`, puis renvoyez `{ object }` au client.
      return new Response(
        "Module 02 (mode generate) à implémenter — suivez exercices/02-structured-output.md",
        { status: 501 }
      );
    } catch (error) {
      // Quand le modèle n'arrive pas à produire un objet conforme au schéma
      // (JSON invalide ou champs manquants), le SDK lève NoObjectGeneratedError
      // plutôt que de renvoyer un objet à moitié faux.
      if (NoObjectGeneratedError.isInstance(error)) {
        return Response.json(
          {
            error:
              "Le modèle n'a pas réussi à produire un ticket conforme au schéma. Essaie un modèle plus capable ou reformule l'email.",
            text: error.text,
          },
          { status: 422 }
        );
      }
      throw error;
    }
  }

  // Mode « streaming » : diffuse le JSON partiel, consommé par `useObject`.
  // ⚠️ À VOUS — Étape 2a (exercices/02-structured-output.md)
  // Appelez `streamObject` avec `model: languageModel`, `schema: ticketSchema`,
  // `instructions: INSTRUCTIONS` et `prompt: email`, puis renvoyez le flux au
  // client avec `result.toTextStreamResponse()`.
  return new Response(
    "Module 02 (mode stream) à implémenter — suivez exercices/02-structured-output.md",
    { status: 501 }
  );
}
