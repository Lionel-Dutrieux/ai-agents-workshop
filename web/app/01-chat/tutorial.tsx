import {
  Callout,
  DocLink,
  DocLinks,
  Tutorial,
  TutorialCode,
  TutorialHeader,
  TutorialSolution,
  TutorialStep,
  TutorialSteps,
} from "@/components/tutorial";

const ROUTE_SKELETON = `// app/api/01-chat/route.ts
export async function POST(req: Request) {
  // Le frontend envoie les messages + l'id du modèle choisi.
  const { messages, model } = await req.json();

  // … appel du modèle ici …
}`;

const SYSTEM_PROMPT = `const BREWLY_SYSTEM_PROMPT = \`Tu es l'assistant du support
client de Brewly, une boutique de café.
- Réponds en français, ton chaleureux et concis.
- Support : lun–ven, 9h–18h. Livraison : 2–4 j en France.
- Tu ne peux pas encore consulter les commandes : ne les invente jamais.\`;`;

const STREAM = `const languageModel = await resolveLanguageModel(model);

const result = streamText({
  model: languageModel,
  instructions: BREWLY_SYSTEM_PROMPT, // (AI SDK 7 : remplace \`system\`)
  messages: await convertToModelMessages(messages),
});

// Diffuse la réponse au format attendu par <Chat/>.
return createUIMessageStreamResponse({
  stream: toUIMessageStream({ stream: result.stream }),
});`;

const FULL_SOLUTION = `import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
} from "ai";
import { resolveLanguageModel } from "@/lib/ai/models";

const BREWLY_SYSTEM_PROMPT = \`Tu es l'assistant du support client de Brewly…\`;

export async function POST(req: Request) {
  const { messages, model } = await req.json();

  const languageModel = await resolveLanguageModel(model);

  const result = streamText({
    model: languageModel,
    instructions: BREWLY_SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
  });

  // Joint l'usage de tokens (jauge) et l'id du modèle à la fin du flux.
  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      messageMetadata: ({ part }) => {
        if (part.type === "finish") {
          return { usage: part.totalUsage, modelId: model };
        }
      },
    }),
  });
}`;

/** Énoncé du Module 1 — Premier chat (panneau de gauche). */
export function Chat01Tutorial() {
  return (
    <Tutorial>
      <TutorialHeader
        eyebrow="Module 01 · Brewly"
        objective="Comprendre le cycle requête → LLM → streaming → UI en implémentant la route qui fait parler l'assistant « Brewly Support »."
        title="Premier chat"
      />

      <Callout title="Objectif" variant="objective">
        Implémenter la route <code>/api/01-chat</code> : elle appelle un modèle
        et diffuse sa réponse en streaming. L’UI (le chat à droite) est déjà
        fournie — tu n’écris que le backend.
      </Callout>

      <Callout title="Juste un appel au modèle — pas encore d’agent" variant="note">
        Ici, on est connecté au modèle presque en direct : il reçoit tes
        messages + les instructions, et renvoie du texte token par token
        (streaming). <strong>Aucune notion d’agent</strong> à ce stade — le
        modèle ne peut ni agir, ni appeler d’outils, ni boucler pour atteindre
        un but. Ça viendra : les outils au module 3, l’agent autonome au
        module 4.
      </Callout>

      <TutorialSteps>
        <TutorialStep title="Créer la route">
          <p>
            Crée le fichier ci-dessous. Une route <code>POST</code> reçoit les
            messages de la conversation et l’id du modèle sélectionné dans l’UI.
          </p>
          <TutorialCode
            code={ROUTE_SKELETON}
            filename="app/api/01-chat/route.ts"
            language="ts"
          />
        </TutorialStep>

        <TutorialStep title="Donner une personnalité (system prompt)">
          <p>
            Le <strong>system prompt</strong> cadre le comportement du modèle :
            ton, périmètre, règles. Ici, la personnalité de Brewly.
          </p>
          <TutorialCode code={SYSTEM_PROMPT} language="ts" />
        </TutorialStep>

        <TutorialStep title="Appeler le modèle et streamer">
          <p>
            <code>resolveLanguageModel(model)</code> (fourni) instancie le
            modèle choisi. <code>streamText</code> lance la génération, et{" "}
            <code>createUIMessageStreamResponse</code> renvoie le flux au format
            attendu par le chat.
          </p>
          <TutorialCode code={STREAM} language="ts" />
        </TutorialStep>

        <TutorialStep title="Tester">
          <p>
            Ajoute un modèle local via le bouton <strong>« Modèles »</strong>{" "}
            (LM Studio par défaut : <code>http://localhost:1234/v1</code>), puis
            pose une question dans le chat, par exemple :
          </p>
          <p className="text-foreground">
            « Quels cafés conseillez-vous pour un espresso corsé ? »
          </p>
        </TutorialStep>
      </TutorialSteps>

      <Callout title="Un SDK, plusieurs providers" variant="note">
        Le AI SDK expose une <strong>API unifiée</strong> : le même code
        (<code>streamText</code>) marche avec OpenAI, Anthropic, Google… ou tout
        endpoint <strong>OpenAI-compatible</strong>. Ici la tuyauterie est déjà
        prête : <code>resolveLanguageModel(model)</code> instancie le modèle
        choisi via <code>@ai-sdk/openai-compatible</code> — tu branches LM
        Studio, Ollama ou Azure AI Foundry depuis « Modèles », sans toucher au
        code de la route.
      </Callout>

      <TutorialSolution>
        <TutorialCode
          code={FULL_SOLUTION}
          filename="app/api/01-chat/route.ts"
          language="ts"
        />
      </TutorialSolution>

      <Callout title="La limite (voulue) de ce module" variant="warning">
        Demande-lui « où en est ma commande #1042 ? » : il ne sait pas. Le
        chatbot ne connaît pas encore les données de la boutique — on lui
        donnera des <em>outils</em> au module 3.
      </Callout>

      <DocLinks>
        <li>
          <DocLink href="https://ai-sdk.dev/docs/reference/ai-sdk-core/stream-text">
            streamText — AI SDK Core
          </DocLink>
        </li>
        <li>
          <DocLink href="https://ai-sdk.dev/docs/foundations/providers-and-models">
            Providers & Models — AI SDK
          </DocLink>
        </li>
        <li>
          <DocLink href="https://ai-sdk.dev/docs/ai-sdk-ui/message-metadata">
            Message metadata (usage de tokens)
          </DocLink>
        </li>
        <li>
          <DocLink href="https://nextjs.org/docs/app/api-reference/file-conventions/route">
            Route Handlers — Next.js
          </DocLink>
        </li>
      </DocLinks>
    </Tutorial>
  );
}
