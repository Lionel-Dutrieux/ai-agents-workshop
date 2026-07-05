import type { ReactNode } from "react";
import {
  Callout,
  DocLink,
  DocLinks,
  Tutorial,
  TutorialCode,
  TutorialHeader,
  TutorialSection,
  TutorialSolution,
  TutorialStep,
  TutorialSteps,
} from "@/components/tutorial";

const SCHEMA = `// app/02-structured-output/schema.ts
import { z } from "zod";

export const ticketSchema = z.object({
  intention: z.enum([
    "question_produit", "suivi_commande",
    "reclamation", "remboursement", "autre",
  ]).describe("Intention principale du client"),
  orderId: z.string().nullable()
    .describe("Numéro de commande, ou null si absent"),
  sentiment: z.enum(["positif", "neutre", "negatif"]),
  priorite: z.enum(["basse", "moyenne", "haute"]),
  resume: z.string().describe("Résumé du besoin en une phrase"),
});`;

const ROUTE = `const { email, model } = await req.json();
const languageModel = await resolveLanguageModel(model);

const result = streamObject({
  model: languageModel,
  schema: ticketSchema,          // le schéma guide le modèle
  instructions: "Extrais un ticket de cet email…",
  prompt: email,
});

return result.toTextStreamResponse();`;

const GENERATE = `// Variante « one-shot » : on attend l'objet complet
const { object } = await generateObject({
  model: languageModel,
  schema: ticketSchema,
  instructions: "Extrais un ticket de cet email…",
  prompt: email,
});

return Response.json({ object }); // objet validé, d'un bloc`;

const CLIENT = `import { experimental_useObject as useObject } from "@ai-sdk/react";

const { object, submit, isLoading } = useObject({
  api: "/api/02-structured-output",
  schema: ticketSchema, // le MÊME schéma qu'au serveur
});

// object se remplit progressivement (streaming) :
//   object?.intention, object?.priorite, object?.resume…
submit({ email, model });`;

const FAILURE = `import { generateObject, NoObjectGeneratedError } from "ai";

try {
  const { object } = await generateObject({ model, schema, prompt });
  return Response.json({ object });
} catch (error) {
  // Le modèle n'a pas produit un JSON valide / conforme au schéma.
  if (NoObjectGeneratedError.isInstance(error)) {
    console.log(error.text);   // ce que le modèle a réellement renvoyé
    console.log(error.cause);  // erreur de parsing / de validation
    return Response.json({ error: "Extraction impossible" }, { status: 422 });
  }
  throw error;
}`;

const FULL_SOLUTION = `import { streamObject } from "ai";
import { ticketSchema } from "@/app/02-structured-output/schema";
import { resolveLanguageModel } from "@/lib/ai/models";

const INSTRUCTIONS = \`Extrais un ticket structuré de l'email : intention,
numéro de commande (ou null), sentiment, priorité, résumé.\`;

export async function POST(req: Request) {
  const { email, model } = await req.json();

  const languageModel = await resolveLanguageModel(model);

  const result = streamObject({
    model: languageModel,
    schema: ticketSchema,
    instructions: INSTRUCTIONS,
    prompt: email,
  });

  return result.toTextStreamResponse();
}`;

/** Énoncé du Module 2 — Structured output. */
export function StructuredOutputTutorial() {
  return (
    <Tutorial>
      <TutorialHeader
        eyebrow="Module 02 · Brewly"
        objective="Faire produire au modèle du JSON typé et fiable plutôt que du texte libre : transformer un email client en ticket de support structuré."
        title="Structured output"
      />

      <Callout title="Objectif" variant="objective">
        Écrire le <strong>schéma zod</strong> du ticket, puis brancher{" "}
        <code>streamObject</code> pour transformer un email (texte libre) en
        objet structuré, affiché à droite au fil de sa génération.
      </Callout>

      <Callout title="Le LLM comme transformateur de données" variant="note">
        Ici, pas de conversation ni d’agent : on utilise le modèle comme un{" "}
        <strong>moteur texte → données</strong>. Le schéma <em>contraint</em> la
        sortie, qui devient directement exploitable par du code classique.
      </Callout>

      <TutorialSteps>
        <TutorialStep title="Écrire le schéma du ticket">
          <p>
            Le schéma zod décrit la forme attendue. Les <code>.describe()</code>{" "}
            guident le modèle sur ce qu’il doit remplir.
          </p>
          <TutorialCode
            code={SCHEMA}
            filename="app/02-structured-output/schema.ts"
            language="ts"
          />
        </TutorialStep>

        <TutorialStep title="Créer la route (streamObject)">
          <p>
            <code>streamObject</code> prend le schéma + l’email et diffuse
            l’objet au fur et à mesure. <code>toTextStreamResponse()</code>{" "}
            renvoie ce flux.
          </p>
          <TutorialCode
            code={ROUTE}
            filename="app/api/02-structured-output/route.ts"
            language="ts"
          />
        </TutorialStep>

        <TutorialStep title="Consommer côté client (useObject)">
          <p>
            Le hook <code>useObject</code> reçoit le même schéma et expose un{" "}
            <code>object</code> qui se remplit progressivement — parfait pour
            voir les champs apparaître en direct.
          </p>
          <TutorialCode code={CLIENT} language="tsx" />
        </TutorialStep>

        <TutorialStep title="Tester les deux modes">
          <p>
            Choisis un modèle, clique un email d’exemple, puis{" "}
            <strong>Analyser</strong>. Bascule entre{" "}
            <strong>Streaming</strong> et <strong>One-shot</strong> pour{" "}
            <em>sentir</em> la différence : les champs qui se remplissent un à un
            vs. le ticket qui apparaît d’un bloc.
          </p>
        </TutorialStep>
      </TutorialSteps>

      <TutorialSection title="streamObject ou generateObject ?">
        <p>
          Deux fonctions, même schéma, même résultat typé. La seule différence
          est <strong>quand</strong> tu reçois l’objet.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <CompareCard
            cons={["Client un peu plus complexe (flux à consommer)"]}
            pros={["Retour visuel immédiat", "Idéal pour une UI interactive"]}
            title="streamObject"
          />
          <CompareCard
            cons={["Aucun retour tant que ce n’est pas fini"]}
            pros={[
              "Ultra simple : un await, un objet",
              "Parfait en back / batch / cron",
            ]}
            title="generateObject"
          />
        </div>
        <p>
          Règle simple : <strong>streaming</strong> quand un humain regarde
          l’écran ; <strong>generateObject</strong> quand c’est du traitement
          automatisé côté serveur.
        </p>
        <TutorialCode
          code={GENERATE}
          filename="variante generateObject"
          language="ts"
        />
      </TutorialSection>

      <Callout title="Et si le modèle n’y arrive pas ?" variant="warning">
        <p className="mb-2">
          Un LLM peut renvoyer du JSON invalide ou incomplet. Le SDK{" "}
          <strong>valide la sortie contre le schéma</strong> : si ça ne passe
          pas, <code>generateObject</code> lève{" "}
          <code>NoObjectGeneratedError</code> (plutôt que de te refiler un objet
          à moitié faux). Tu récupères <code>error.text</code> (ce que le modèle
          a vraiment dit) et <code>error.cause</code> pour logguer et gérer le
          cas proprement.
        </p>
        <TutorialCode code={FAILURE} language="ts" />
      </Callout>

      <TutorialSection title="À quoi ça sert ? (spoiler : pas un agent)">
        <p>
          On est sur une <strong>tâche unique, en one-shot</strong> : une prompt
          système + un email en entrée → un objet typé en sortie. Pas de boucle,
          pas d’outils, pas de décision. Juste du{" "}
          <strong>traitement léger automatisé</strong>. Quelques usages
          typiques&nbsp;:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Triage de support</strong> — classer et prioriser les emails
            entrants, router vers la bonne file.
          </li>
          <li>
            <strong>Extraction de données</strong> — sortir des champs
            structurés d’une facture, d’un CV
            <sup>*</sup> ou d’un contrat en PDF.
          </li>
          <li>
            <strong>Enrichissement / normalisation</strong> — transformer un
            avis client en <code>{"{ note, thèmes, sentiment }"}</code> pour
            l’analytics.
          </li>
        </ul>
        <p className="rounded-md border-amber-500/40 border-l-2 bg-amber-500/5 py-1.5 pl-3 text-xs">
          <strong>* AI Act — attention au recrutement.</strong> Trier ou noter
          des CV automatiquement est un <strong>système à « haut risque »</strong>{" "}
          (Annexe III de l’AI Act européen) : pas interdit, mais strictement
          encadré. Une IA ne peut pas <strong>décider seule</strong> — un humain
          doit garder le contrôle et <strong>valider</strong> (supervision
          humaine), l’usage doit être <strong>documenté et tracé</strong>, et le
          candidat doit être <strong>informé</strong> qu’un traitement
          automatisé intervient dans le processus.
        </p>
        <p>
          Dès qu’il faut <em>enchaîner</em> des actions ou appeler des outils, on
          passe au tool calling puis aux agents — les modules suivants.
        </p>
      </TutorialSection>

      <TutorialSolution>
        <TutorialCode
          code={FULL_SOLUTION}
          filename="app/api/02-structured-output/route.ts"
          language="ts"
        />
      </TutorialSolution>

      <Callout title="Une seule source de vérité" variant="tip">
        Le schéma zod est <strong>partagé</strong> entre le serveur
        (<code>streamObject</code>) et le client (<code>useObject</code>) : on
        l’écrit une fois, le typage est garanti des deux côtés.
      </Callout>

      <Callout title="Modèles locaux" variant="warning">
        La sortie structurée demande un modèle qui la supporte. Si le ticket ne
        se remplit pas correctement, essaie un modèle plus capable (ou une
        version « instruct » récente).
      </Callout>

      <DocLinks>
        <li>
          <DocLink href="https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data">
            Generating Structured Data — AI SDK
          </DocLink>
        </li>
        <li>
          <DocLink href="https://ai-sdk.dev/docs/reference/ai-sdk-core/stream-object">
            streamObject — référence
          </DocLink>
        </li>
        <li>
          <DocLink href="https://ai-sdk.dev/docs/reference/ai-sdk-core/generate-object">
            generateObject — référence
          </DocLink>
        </li>
        <li>
          <DocLink href="https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-object">
            useObject — référence
          </DocLink>
        </li>
      </DocLinks>
    </Tutorial>
  );
}

function CompareCard({
  title,
  pros,
  cons,
}: {
  title: string;
  pros: string[];
  cons: string[];
}) {
  return (
    <div className="space-y-2 rounded-lg border p-3">
      <code className="font-medium text-foreground text-sm">{title}</code>
      <ul className="space-y-1">
        {pros.map((item) => (
          <ProConItem key={item} tone="pro">
            {item}
          </ProConItem>
        ))}
        {cons.map((item) => (
          <ProConItem key={item} tone="con">
            {item}
          </ProConItem>
        ))}
      </ul>
    </div>
  );
}

function ProConItem({
  tone,
  children,
}: {
  tone: "pro" | "con";
  children: ReactNode;
}) {
  return (
    <li className="flex items-start gap-1.5 text-xs">
      <span
        aria-hidden
        className={tone === "pro" ? "text-emerald-600" : "text-amber-600"}
      >
        {tone === "pro" ? "+" : "−"}
      </span>
      <span>{children}</span>
    </li>
  );
}
