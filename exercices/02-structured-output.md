# Module 02 — Structured output

> **Durée** : ~20 min · **Fichiers à modifier** : `web/app/02-structured-output/schema.ts` et `web/app/api/02-structured-output/route.ts` · **Niveau** : facile

## 🎯 Objectif

Faire produire au modèle du JSON typé et fiable plutôt que du texte libre : transformer un email client (texte brut) en ticket de support structuré (intention, priorité, résumé…). C'est la brique de base de tout traitement automatisé de données par un LLM.

## 💡 Les concepts en bref

- **Schéma zod** : la « forme » attendue de la réponse — comme un moule qui contraint le modèle à remplir des champs précis, pas du texte libre.
- **`streamObject`** : diffuse l'objet au fil de sa génération, champ par champ — utile quand un humain regarde l'écran.
- **`generateObject`** : attend l'objet complet et validé avant de le renvoyer — plus simple, adapté à un traitement automatisé côté serveur.
- **Validation stricte** : si la sortie du modèle ne respecte pas le schéma, le SDK lève une erreur au lieu de vous refiler un objet à moitié faux.
- **Une seule source de vérité** : le même schéma zod sert côté serveur (`streamObject`) et côté client (`useObject`).

## 📝 Étapes

> **Comment combler un trou :** repérez le commentaire `⚠️ À VOUS` dans le
> fichier, décommentez les imports indiqués en tête de fichier, collez le
> bloc de l'étape à l'emplacement du trou, puis **supprimez le code
> provisoire** (`return … 501`, `throw new Error("⚠️ …")` ou lignes
> `void …;`). Le commentaire `⚠️ À VOUS` peut rester, il documente ce que
> vous avez fait.

### Étape 1 — Écrire le schéma du ticket

Le schéma zod décrit la forme attendue : quels champs, quels types, quelles valeurs possibles. Les `.describe()` sont des indices en langage naturel qui guident le modèle sur ce qu'il doit remplir dans chaque champ.

```ts
// web/app/02-structured-output/schema.ts
import { z } from "zod";

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
```

Une fois le schéma en place, remplacez tout le bloc `export type Ticket = { … }` (plus bas dans le même fichier) par cette seule ligne — le type est alors **dérivé** du schéma, une seule source de vérité :

```ts
export type Ticket = z.infer<typeof ticketSchema>;
```

### Étape 2 — Brancher `streamObject` et `generateObject` dans la route

`streamObject` prend le modèle, le schéma et l'email, puis diffuse l'objet au fur et à mesure de sa génération. `toTextStreamResponse()` renvoie ce flux au client, qui le consomme avec le hook `useObject`. La route gère aussi un mode « one-shot » avec `generateObject`, qui attend l'objet complet avant de le renvoyer, et intercepte `NoObjectGeneratedError` si le modèle échoue à produire un objet conforme au schéma.

```ts
// web/app/api/02-structured-output/route.ts
import { generateObject, NoObjectGeneratedError, streamObject } from "ai";
import { ticketSchema } from "@/app/02-structured-output/schema";
import { resolveLanguageModel } from "@/lib/ai/models";

/**
 * Module 2 — Structured output (solution de référence).
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
      const { object } = await generateObject({
        model: languageModel,
        schema: ticketSchema,
        instructions: INSTRUCTIONS,
        prompt: email,
      });
      return Response.json({ object });
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
  const result = streamObject({
    model: languageModel,
    schema: ticketSchema,
    instructions: INSTRUCTIONS,
    prompt: email,
  });

  return result.toTextStreamResponse();
}
```

## ✅ Tester

- Ouvrez [http://localhost:3000/02-structured-output](http://localhost:3000/02-structured-output).
- Choisissez un modèle, cliquez sur un des emails d'exemple fournis (ex. « Colis en retard »).
- Cliquez **Analyser** : les champs du ticket (intention, priorité, résumé…) doivent se remplir progressivement à droite, au fil du streaming.
- Basculez sur le mode **One-shot** et relancez : le ticket doit apparaître d'un coup, une fois complet, plutôt que champ par champ.
- Essayez un email sans numéro de commande : le champ `orderId` doit ressortir à `null`, pas une chaîne vide ou inventée.

## 🆘 Bloqué ?

- La solution complète est sur la branche `complete` : `git diff main complete -- web/app/api/02-structured-output/route.ts web/app/02-structured-output/schema.ts` ou ouvrez les fichiers sur GitHub.
- Le ticket ne se remplit pas ou reste vide : vérifiez que le modèle choisi supporte la sortie structurée — les modèles locaux (LM Studio) peu capables échouent parfois ; essayez un modèle plus récent ou une version « instruct ».
- Erreur 422 « Le modèle n'a pas réussi à produire un ticket conforme au schéma » : c'est le SDK qui protège contre un JSON invalide (voir `NoObjectGeneratedError` dans le code de la route) — reformulez l'email ou changez de modèle.

## 🚀 Pour aller plus loin (optionnel)

1. Ajoutez un champ au schéma (ex. `langue: z.enum(["fr", "en"])`) et observez comme il se remplit sans changer une ligne de logique.
2. Retirez les `.describe()` d'un champ et comparez la qualité de l'extraction — l'effet des descriptions sur le modèle.
3. Inventez votre propre email de test (copier-coller dans le champ) et vérifiez que le ticket produit reste cohérent.
