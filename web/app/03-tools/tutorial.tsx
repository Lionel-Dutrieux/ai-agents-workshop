import { BrewlyCatalogManager } from "@/components/sandbox";
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

const TOOL_ANATOMY = `// app/api/03-tools/tools.ts
import { tool } from "ai";
import { z } from "zod";
import { getOrder } from "@/lib/dal/brewly-orders";

export const getOrderStatus = tool({
  // 1. Ce que le modèle lit pour décider s'il appelle l'outil
  description:
    "Récupère le statut d'une commande à partir de son numéro.",

  // 2. Les arguments attendus (schéma zod, transmis au modèle + validé)
  inputSchema: z.object({
    numeroCommande: z.string().describe("Le numéro de commande"),
  }),

  // 3. Votre code, exécuté côté serveur. Il délègue au DAL.
  execute: async ({ numeroCommande }) => {
    const order = getOrder(numeroCommande); // ← DAL fourni
    return order ?? { trouvee: false };
  },
});`;

const ROUTE = `import { streamText, stepCountIs } from "ai";
import { brewlyTools } from "./tools";

const result = streamText({
  model: languageModel,
  instructions: BREWLY_SYSTEM_PROMPT,
  messages: await convertToModelMessages(messages),
  tools: brewlyTools,        // ← on donne les outils au modèle
  stopWhen: stepCountIs(5),  // ← indispensable (voir encadré)
});`;

const AGENT_PREVIEW = `// Module 3 (ici) : la boucle est écrite à la main dans la route
streamText({ model, instructions, tools, stopWhen: stepCountIs(5) });

// Module 4 : EXACTEMENT la même boucle, encapsulée dans un objet
const brewlyAgent = new ToolLoopAgent({
  model, instructions, tools, stopWhen: stepCountIs(5),
});
// … réutilisable partout : une route, un job de fond, un autre agent
brewlyAgent.stream({ messages });`;

const DAL = `// lib/dal/brewly-catalog.ts — FOURNI, vous ne le codez pas
export async function findProductByName(nom: string): Promise<Product | null> {
  // lit une vraie base SQLite via Prisma (voir la sandbox ci-dessous)
}

// Votre outil s'en sert, c'est tout :
execute: async ({ nom }) => await findProductByName(nom),`;

const FULL_SOLUTION = `import { tool } from "ai";
import { z } from "zod";
import { findProductByName } from "@/lib/dal/brewly-catalog";

export const getProductInfo = tool({
  description:
    "Donne les infos d'un produit du catalogue (prix, stock…) par son nom.",
  inputSchema: z.object({
    nom: z.string().describe("Nom, ou partie du nom, du produit"),
  }),
  execute: async ({ nom }) => {
    const product = await findProductByName(nom); // ← lecture async en base
    return product ?? { trouve: false };
  },
});`;

/** Énoncé du Module 3 — Tool calling. */
export function ToolsTutorial() {
  return (
    <Tutorial>
      <TutorialHeader
        eyebrow="Module 03 · Brewly"
        objective="Donner des outils au modèle : il ne se contente plus de parler, il peut consulter les commandes et le catalogue avant de répondre."
        title="Tool calling"
      />

      <Callout title="Objectif" variant="objective">
        Écrire des <strong>outils</strong> (<code>tool()</code> + zod) qui
        branchent le modèle sur les données de Brewly, les passer à{" "}
        <code>streamText</code>, et observer le cycle{" "}
        <em>appel d’outil → résultat → réponse</em> directement dans le chat.
      </Callout>

      <Callout title="Le modèle décide, votre code exécute" variant="note">
        Un outil, c’est une fonction que <strong>vous</strong> écrivez et que le{" "}
        <strong>modèle</strong> choisit d’appeler (ou non). Le modèle ne lance
        rien lui-même : il demande un appel, le SDK exécute votre{" "}
        <code>execute</code>, puis lui renvoie le résultat pour qu’il rédige sa
        réponse.
      </Callout>

      <TutorialSteps>
        <TutorialStep title="Comprendre le cycle">
          <p>Pour « Où en est ma commande #1042 ? », il se passe deux étapes :</p>
          <ol className="list-decimal space-y-1 pl-5">
            <li>
              Le modèle produit un <strong>appel d’outil</strong>{" "}
              <code>getOrderStatus({"{ numeroCommande: '1042' }"})</code>. Le SDK
              exécute la fonction et récupère le résultat.
            </li>
            <li>
              Le résultat est renvoyé au modèle, qui rédige la{" "}
              <strong>réponse finale</strong> en langage naturel.
            </li>
          </ol>
        </TutorialStep>

        <TutorialStep title="Anatomie d’un outil">
          <p>
            Trois champs : <code>description</code> (le modèle s’en sert pour
            décider), <code>inputSchema</code> (les arguments, en zod) et{" "}
            <code>execute</code> (votre code).
          </p>
          <TutorialCode
            code={TOOL_ANATOMY}
            filename="app/api/03-tools/tools.ts"
            language="ts"
          />
        </TutorialStep>

        <TutorialStep title="Les données sont fournies (DAL)">
          <p>
            Vous n’écrivez <strong>pas</strong> l’accès aux données : les
            fonctions du <code>lib/dal/brewly-*.ts</code> sont prêtes. Elles
            lisent une <strong>vraie base SQLite</strong> (via Prisma). Votre
            outil ne fait que les <em>brancher</em> sur le modèle.
          </p>
          <TutorialCode code={DAL} language="ts" />
        </TutorialStep>

        <TutorialStep title="Brancher les outils sur la route">
          <p>
            On passe l’objet d’outils à <code>streamText</code> via{" "}
            <code>tools</code>. L’UI du chat affiche déjà les appels d’outils —
            rien à faire côté client.
          </p>
          <TutorialCode
            code={ROUTE}
            filename="app/api/03-tools/route.ts"
            language="ts"
          />
        </TutorialStep>

        <TutorialStep title="Tester">
          <p>
            Essayez « Où en est ma commande #1042 ? » ou « Parlez-moi du café
            Éthiopie ». Dépliez l’encart <strong>outil</strong> dans la réponse
            pour voir les arguments envoyés et le résultat renvoyé.
          </p>
        </TutorialStep>
      </TutorialSteps>

      <TutorialSection title="D’où viennent les données ? (sandbox)">
        <p>
          Le catalogue Brewly n’est pas figé dans le code : il vit dans une{" "}
          <strong>base SQLite</strong>, interrogée par vos outils via{" "}
          <strong>Prisma</strong>. Le tableau ci-dessous lit et écrit dans{" "}
          <em>cette même table</em> (opérations CRUD complètes : créer, lire,
          modifier, supprimer).
        </p>
        <p>
          Faites le test&nbsp;: passez un café <strong>« Épuisé »</strong> ou
          changez son prix ici, puis reposez la question à l’agent à droite. Sa
          réponse reflète votre modification — la preuve que l’outil lit bien la
          base, en direct.
        </p>
        <div className="rounded-lg border bg-card/40 p-3">
          <BrewlyCatalogManager />
        </div>
        <p className="text-muted-foreground text-sm">
          Tableau vide&nbsp;? Le catalogue se peuple explicitement&nbsp;:
          cliquez sur <strong>« Réinitialiser les données de démo »</strong>{" "}
          depuis l’accueil.
        </p>
      </TutorialSection>

      <Callout title="Le piège : sans stopWhen, pas de réponse" variant="warning">
        Par défaut, <code>streamText</code> s’arrête après{" "}
        <strong>une seule étape</strong> : le modèle appellerait l’outil… et se
        tairait. <code>stopWhen: stepCountIs(5)</code> autorise l’enchaînement{" "}
        <em>appel → résultat → réponse</em>, avec un garde-fou (5 étapes max)
        pour éviter les boucles infinies.
      </Callout>

      <TutorialSection title="Au fait : vous venez de créer un agent">
        <p>
          Un <strong>LLM</strong> + des <strong>outils</strong> + une{" "}
          <strong>boucle</strong> qui enchaîne <em>appel → résultat → décision</em>{" "}
          jusqu’au but : c’est la définition d’un agent. Vous en avez donc déjà
          construit un — à la main, dans la route.
        </p>
        <p>
          Au <strong>module 4</strong>, on utilisera le système d’agent du SDK
          (<code>ToolLoopAgent</code>). C’est <strong>exactement la même
          boucle</strong>, mais <strong>encapsulée</strong> dans un objet
          réutilisable :
        </p>
        <TutorialCode code={AGENT_PREVIEW} language="ts" />
        <p>
          C’est du <strong>sucre syntaxique</strong> — mais qui en vaut la peine
          : le code devient plus <strong>maintenable</strong> (un seul endroit
          définit le comportement de l’agent) et <strong>portable</strong> (le
          même agent se réutilise dans une route, un job de fond, un autre
          agent). Ce que la version encapsulée apporte en plus&nbsp;:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Réutilisable partout</strong> — défini une fois, appelé via{" "}
            <code>.stream()</code> / <code>.generate()</code> depuis n’importe
            quel contexte.
          </li>
          <li>
            <strong>Observabilité intégrée</strong> — des callbacks{" "}
            <code>onStepEnd</code> / <code>onToolExecutionEnd</code> pour tracer
            chaque étape (logs, coûts, télémétrie).
          </li>
          <li>
            <strong>Sous-agents</strong> — un agent peut être utilisé comme{" "}
            <em>outil</em> par un autre, pour déléguer une tâche lourde.
          </li>
          <li>
            <strong>Agents durables</strong> (<code>WorkflowAgent</code>) —
            reprise après crash et validation humaine ; ça, on ne peut{" "}
            <em>pas</em> le recoder simplement à la main.
          </li>
        </ul>
      </TutorialSection>

      <TutorialSection title="Ces outils restent privés à notre agent">
        <p>
          Encapsulé ou non, l’agent et ses outils vivent{" "}
          <strong>dans notre code</strong> : ils ne servent qu’à{" "}
          <strong>cet agent-là</strong>. Parfait pour un besoin local et
          maîtrisé.
        </p>
        <p>
          Dès qu’on veut <strong>partager la même boîte à outils</strong> entre
          plusieurs agents ou clients (notre app, Claude Desktop, un IDE, un
          autre service), on ne recopie pas le code : on expose un{" "}
          <strong>serveur MCP</strong>, un standard réutilisable par n’importe
          quel client — c’est l’objet du <strong>module 5</strong>.
        </p>
      </TutorialSection>

      <TutorialSolution>
        <TutorialCode
          code={FULL_SOLUTION}
          filename="app/api/03-tools/tools.ts — getProductInfo"
          language="ts"
        />
      </TutorialSolution>

      <Callout title="Modèles locaux" variant="warning">
        Le tool calling demande un modèle qui le supporte. Si le modèle ignore
        les outils ou répond sans les appeler, essaie un modèle « instruct »
        récent connu pour le function calling.
      </Callout>

      <DocLinks>
        <li>
          <DocLink href="https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling">
            Tool Calling — AI SDK
          </DocLink>
        </li>
        <li>
          <DocLink href="https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling#multi-step-calls-using-stopwhen">
            Multi-step calls (stopWhen) — AI SDK
          </DocLink>
        </li>
        <li>
          <DocLink href="https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-tool-usage">
            Chatbot Tool Usage — AI SDK UI
          </DocLink>
        </li>
      </DocLinks>
    </Tutorial>
  );
}
