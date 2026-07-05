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

const AGENT_DEF = `// lib/ai/brewly-agent.ts
import { ToolLoopAgent, stepCountIs } from "ai";
import { brewlyTools } from "@/app/api/03-tools/tools"; // les MÊMES outils

export function createBrewlyAgent(model) {
  return new ToolLoopAgent({
    model,
    instructions: BREWLY_AGENT_INSTRUCTIONS,
    tools: brewlyTools,
    stopWhen: stepCountIs(8), // garde-fou : 8 étapes max
  });
}`;

const ROUTE = `// app/api/04-agent/route.ts
const agent = createBrewlyAgent(languageModel);

// agent.stream() renvoie le MÊME résultat que streamText
const result = await agent.stream({
  messages: await convertToModelMessages(messages),
  onStepEnd: ({ toolCalls }) => {
    // observabilité : on trace chaque étape
    console.log(toolCalls?.map((t) => t.toolName));
  },
});

// … puis on renvoie le flux exactement comme au module 3`;

const LOOP = `« Tous les articles de ma commande #1042 sont-ils en stock ? »

étape 1  getOrderStatus("1042")       → [Moulin, Colombie Supremo]
étape 2  getProductInfo("Moulin")     → en stock ✓
étape 3  getProductInfo("Colombie")   → en stock ✓
étape 4  (réponse)  « Oui, les deux articles sont disponibles. »`;

const FULL_SOLUTION = `// lib/ai/brewly-agent.ts
import { ToolLoopAgent, stepCountIs, type LanguageModel } from "ai";
import { brewlyTools } from "@/app/api/03-tools/tools";

export const BREWLY_AGENT_INSTRUCTIONS = \`Tu es l'agent du support Brewly.
Enchaîne les outils autant que nécessaire pour répondre : décompose la
demande, appelle un outil, lis le résultat, décide de la suite.\`;

export function createBrewlyAgent(model: LanguageModel) {
  return new ToolLoopAgent({
    model,
    instructions: BREWLY_AGENT_INSTRUCTIONS,
    tools: brewlyTools,
    stopWhen: stepCountIs(8),
  });
}`;

/** Énoncé du Module 4 — Agent multi-étapes. */
export function AgentTutorial() {
  return (
    <Tutorial>
      <TutorialHeader
        eyebrow="Module 04 · Brewly"
        objective="Passer d'« un appel avec des outils » à « un agent encapsulé qui enchaîne plusieurs outils, tout seul, jusqu'à atteindre son but »."
        title="Agent multi-étapes"
      />

      <Callout title="Objectif" variant="objective">
        Empaqueter la boucle du module 3 dans un <code>ToolLoopAgent</code>,
        l’appeler via <code>agent.stream()</code>, puis lui confier une{" "}
        <strong>tâche composée</strong> qui l’oblige à enchaîner plusieurs outils
        — et regarder sa trajectoire dans le chat.
      </Callout>

      <Callout title="La même boucle, mieux rangée" variant="note">
        On ne change pas de mécanique : sous le capot, <code>ToolLoopAgent</code>{" "}
        c’est <code>streamText</code> + <code>tools</code> + <code>stopWhen</code>
        , exactement comme au module 3. On le range dans un objet{" "}
        <strong>réutilisable</strong> — et on lui donne enfin un vrai travail
        d’enquête.
      </Callout>

      <TutorialSteps>
        <TutorialStep title="Encapsuler l’agent">
          <p>
            On définit l’agent à <strong>un seul endroit</strong> :
            modèle, instructions, outils et garde-fou. On réutilise{" "}
            <strong>les mêmes outils</strong> que le module 3 — c’est ça, la
            portabilité.
          </p>
          <TutorialCode
            code={AGENT_DEF}
            filename="lib/ai/brewly-agent.ts"
            language="ts"
          />
        </TutorialStep>

        <TutorialStep title="L’utiliser dans la route">
          <p>
            La route devient minimale : on construit l’agent avec le modèle
            choisi et on appelle <code>agent.stream()</code>. Le retour est
            identique à <code>streamText</code>, donc le streaming vers l’UI ne
            change pas.
          </p>
          <TutorialCode
            code={ROUTE}
            filename="app/api/04-agent/route.ts"
            language="ts"
          />
        </TutorialStep>

        <TutorialStep title="Confier une tâche composée">
          <p>
            Une seule question, mais qui demande <strong>plusieurs
            recherches</strong> enchaînées. L’agent planifie tout seul — vous
            n’avez scripté aucune de ces étapes :
          </p>
          <pre className="overflow-x-auto rounded-lg border bg-muted/30 p-3 text-xs leading-relaxed">
            {LOOP}
          </pre>
        </TutorialStep>

        <TutorialStep title="Observer la boucle">
          <p>
            Côté serveur, <code>onStepEnd</code> trace chaque étape. Côté UI,{" "}
            <strong>chaque appel d’outil s’affiche dans le chat</strong> : la
            suite des encarts, c’est la <em>trajectoire</em> de l’agent, rendue
            visible. Dépliez-les pour suivre son raisonnement.
          </p>
        </TutorialStep>

        <TutorialStep title="Tester">
          <p>
            Essayez « Tous les articles de ma commande #1042 sont-ils en stock ?
            ». Vous devriez voir <strong>plusieurs</strong> encarts d’outils
            s’enchaîner avant la réponse finale.
          </p>
        </TutorialStep>
      </TutorialSteps>

      <TutorialSection title="Le catalogue de l’agent (sandbox)">
        <p>
          L’agent lit le <strong>même catalogue SQLite</strong> que le module 3,
          via Prisma. Le tableau ci-dessous écrit dans cette même table (CRUD
          complet).
        </p>
        <p>
          Testez la boucle&nbsp;: passez un article de la commande{" "}
          <strong>#1042</strong> (le <em>Moulin</em> ou le{" "}
          <em>Colombie Supremo</em>) en <strong>« Épuisé »</strong>, puis
          redemandez à l’agent si tout est en stock. Il refera son enquête
          multi-étapes et sa réponse changera — en direct.
        </p>
        <div className="rounded-lg border bg-card/40 p-3">
          <BrewlyCatalogManager />
        </div>
      </TutorialSection>

      <Callout title="Garder la main : contrôle de la boucle" variant="warning">
        <p className="mb-2">
          Un agent autonome doit rester borné. <code>stopWhen</code> est votre
          garde-fou, et il accepte plusieurs conditions :
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <code>stepCountIs(8)</code> — stoppe après 8 étapes (anti-boucle
            infinie).
          </li>
          <li>
            <code>{'hasToolCall("getOrderStatus")'}</code> — stoppe dès qu’un
            outil
            précis est appelé.
          </li>
          <li>
            Une condition <strong>sur mesure</strong> (fonction qui inspecte les
            étapes) — et on peut les combiner dans un tableau.
          </li>
        </ul>
      </Callout>

      <TutorialSection title="Pourquoi encapsuler, déjà ?">
        <p>
          Rappel du module 3 : c’est du <strong>sucre syntaxique qui en vaut la
          peine</strong>. Défini une fois, l’agent se réutilise partout (route,
          job de fond, autre agent), il est typé et testable. En prime, l’objet
          agent débloque des usages difficiles à recoder à la main :{" "}
          <strong>sous-agents</strong> (un agent utilisé comme outil par un
          autre) et <strong>agents durables</strong> (<code>WorkflowAgent</code>{" "}
          : reprise après crash, validation humaine).
        </p>
        <p>
          Prochaine étape — <strong>module 5</strong> : nos outils sont encore
          <strong> privés à cet agent</strong>. Pour les partager avec d’autres
          agents et clients (Claude, un IDE…), on les exposera via un{" "}
          <strong>serveur MCP</strong>.
        </p>
      </TutorialSection>

      <TutorialSolution>
        <TutorialCode
          code={FULL_SOLUTION}
          filename="lib/ai/brewly-agent.ts"
          language="ts"
        />
      </TutorialSolution>

      <Callout title="Modèles locaux" variant="warning">
        Une tâche composée demande au modèle d’enchaîner plusieurs appels
        d’outils. Un petit modèle local peut s’arrêter trop tôt ou boucler :
        privilégiez un modèle « instruct » récent à l’aise avec le function
        calling.
      </Callout>

      <DocLinks>
        <li>
          <DocLink href="https://ai-sdk.dev/docs/agents/building-agents">
            Building Agents (ToolLoopAgent) — AI SDK
          </DocLink>
        </li>
        <li>
          <DocLink href="https://ai-sdk.dev/docs/agents/loop-control">
            Loop Control (stopWhen) — AI SDK
          </DocLink>
        </li>
        <li>
          <DocLink href="https://ai-sdk.dev/docs/reference/ai-sdk-core/tool-loop-agent">
            ToolLoopAgent — référence
          </DocLink>
        </li>
      </DocLinks>
    </Tutorial>
  );
}
