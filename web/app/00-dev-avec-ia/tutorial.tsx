import {
  Callout,
  DocLink,
  DocLinks,
  Tutorial,
  TutorialCode,
  TutorialHeader,
  TutorialStep,
  TutorialSteps,
} from "@/components/tutorial";

const AGENTS_MD = `# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file
structure may all differ from your training data. Read the relevant
guide in \`node_modules/next/dist/docs/\` before writing any code.`;

const SKILLS_INSTALL = `# Les skills utilisés pour construire ce workshop
# (voir skills-lock.json et .claude/skills/ dans le repo)
npx skills add vercel/ai          # ai-sdk : l'API réelle du AI SDK 7
npx skills add vercel/ai-elements # les composants de chat de l'UI`;

const CONTEXT7 = `# Claude Code
claude mcp add context7 -- npx -y @upstash/context7-mcp

# VS Code (Copilot) — .vscode/mcp.json
{
  "servers": {
    "context7": { "command": "npx", "args": ["-y", "@upstash/context7-mcp"] }
  }
}`;

const PROMPT_COMPRENDRE = `Explique-moi comment fonctionne l'agent du module 04, de la requête
HTTP jusqu'à l'affichage des étapes d'outils dans l'UI. Cite les
fichiers impliqués et le rôle de chacun dans le flux.`;

const PROMPT_SOMMELIER = `Je veux une page /sommelier : « le Sommelier Brewly », un agent qui
recommande des cafés du catalogue selon les goûts du client (corsé,
fruité, doux, décaféiné…).

Comportement attendu :
- Persona : sommelier du café, chaleureux et expert. Si les goûts ne
  sont pas clairs, il pose UNE question avant de recommander.
- Il recommande UNIQUEMENT des produits du catalogue (via les outils),
  en stock, avec prix, origine et intensité — 2 options max, et un mot
  sur pourquoi chacune correspond aux goûts exprimés.
- Réponses en français, courtes et engageantes.

Interface :
- Réutilise le composant <Chat/> existant (components/chat), en
  t'inspirant de app/04-agent/page.tsx : titre d'accueil
  « Sommelier Brewly », description d'accueil, et 3 suggestions
  cliquables (prop \`suggestions\`) pour tester sans rien taper :
  « Un café corsé pour le matin », « Plutôt doux et fruité, une
  idée ? », « Un décaféiné pour le soir ».
- Une page simple : pas besoin du panneau tutoriel (ExerciseShell).

Contraintes strictes :
- La route calque le pattern du module 04 (route + ToolLoopAgent).
- Réutilise les brewlyTools existants tels quels — aucun nouvel
  outil, aucune modification de la base de données.
- Ne modifie aucun fichier des modules existants (01 à 08).
- La seule vraie nouveauté : les instructions de l'agent.

Présente-moi d'abord ton plan complet. N'écris aucun code avant ma
validation.`;

/** Énoncé du Module 0 — Développer avec l'IA (démo + take-home). */
export function DevAvecIaTutorial() {
  return (
    <Tutorial>
      <TutorialHeader
        eyebrow="Module 00 · Transverse · Démo + take-home"
        objective="Utiliser un agent de code (Claude Code, GitHub Copilot…) comme binôme de développement — en le pilotant, jamais l'inverse."
        title="Développer avec l'IA"
      />

      <Callout title="Ce module retourne la caméra" variant="objective">
        Les modules 01-08 construisent des agents <strong>dans</strong>{" "}
        l&apos;application. Ici, l&apos;agent est{" "}
        <strong>votre outil de travail</strong> — et l&apos;exemple est méta :
        ce workshop a été construit exactement comme ça. Les traces sont
        versionnées dans le repo (<code>.claude/skills/</code>,{" "}
        <code>skills-lock.json</code>, <code>web/AGENTS.md</code>). La fiche
        complète : <code>exercices/00-dev-avec-ia.md</code>.
      </Callout>

      <Callout title="La règle d'or — avant toute technique" variant="warning">
        <strong>On drive l&apos;agent, on ne se fait pas driver.</strong> On
        n&apos;accepte <strong>jamais</strong> du code qu&apos;on ne comprend
        pas : c&apos;est de la dette technique instantanée et un risque de
        sécurité réel (validation manquante, secret loggé, injection — module
        06). Petites boucles : demande ciblée → petit diff → relecture →
        commit.
      </Callout>

      <TutorialSteps>
        <TutorialStep title="Donner du contexte : les instructions de repo">
          <p>
            Un fichier versionné (<code>CLAUDE.md</code>, <code>AGENTS.md</code>
            , <code>.github/copilot-instructions.md</code>) que l&apos;agent
            lit à chaque session — le « system prompt » de votre projet. Celui
            de ce repo tient en trois lignes décisives :
          </p>
          <TutorialCode code={AGENTS_MD} filename="web/AGENTS.md" language="md" />
          <p>
            Sans lui, l&apos;agent génère du Next.js « d&apos;avant » —
            plausible, mais faux.
          </p>
        </TutorialStep>

        <TutorialStep title="Les skills : le contexte de vos technologies">
          <p>
            Un skill est un paquet de connaissances chargé à la demande — la
            réponse au problème n°1 des LLM : leurs connaissances datent de
            leur entraînement. Pour construire ce workshop, les skills
            officiels de Vercel ont fourni l&apos;API <em>actuelle</em> du AI
            SDK 7 (<code>streamText</code>, <code>ToolLoopAgent</code>…) :
          </p>
          <TutorialCode
            code={SKILLS_INSTALL}
            filename="Terminal"
            language="bash"
          />
        </TutorialStep>

        <TutorialStep title="Des MCP au service du dev (context7…)">
          <p>
            Votre agent de code est un <strong>client MCP</strong> (module
            05, dans l&apos;autre sens). <strong>context7</strong> va chercher
            la documentation à jour des librairies et l&apos;injecte dans le
            contexte : l&apos;anti-hallucination d&apos;API — un RAG de
            documentation, le pattern du module 08 en produit fini. Aussi
            utiles : GitHub MCP (issues, PR), Playwright MCP (l&apos;agent
            vérifie sa feature dans un vrai navigateur).
          </p>
          <TutorialCode code={CONTEXT7} filename="Configuration" language="bash" />
        </TutorialStep>

        <TutorialStep title="Le bon modèle, le plan mode, la revue">
          <p>
            <strong>Modèle</strong> : rapide et économique pour le mécanique,
            le plus capable pour la conception — le réflexe du sélecteur de
            modèle (module 01) appliqué à votre outillage.{" "}
            <strong>Plan mode</strong> : pour toute feature non triviale,
            exiger un plan (fichiers touchés, approche) et le valider{" "}
            <em>avant</em> la première ligne — corriger un plan coûte 10 fois
            moins qu&apos;un diff de 15 fichiers. <strong>Revue</strong> : on
            relit 100 % du diff, comme la PR d&apos;un collègue junior
            brillant mais pressé ; petits commits ; la revue par IA est une
            seconde paire d&apos;yeux, jamais un remplacement.
          </p>
        </TutorialStep>

        <TutorialStep title="La démo 1 — comprendre une codebase (lecture seule)">
          <p>
            L&apos;usage n°1 au quotidien, avant même de générer du code :
            l&apos;onboarding.
          </p>
          <TutorialCode
            code={PROMPT_COMPRENDRE}
            filename="Prompt — à rejouer chez vous"
            language="md"
          />
        </TutorialStep>

        <TutorialStep title="La démo 2 — le Sommelier Brewly (plan → diff → revue)">
          <p>
            Une mini-feature en <strong>réassemblage pur</strong> : que des
            briques existantes, le but est de montrer la <em>méthode</em>.
            Plan mode, exécution, revue du diff en live — puis la preuve par
            la sandbox : un produit inventé ajouté en direct, et le sommelier
            le recommande via un tool call visible dans l&apos;UI.
          </p>
          <TutorialCode
            code={PROMPT_SOMMELIER}
            filename="Prompt — à rejouer chez vous"
            language="md"
          />
        </TutorialStep>
      </TutorialSteps>

      <Callout title="Ce projet n'est pas un modèle d'architecture" variant="warning">
        L&apos;application du workshop est volontairement simple — pensée pour
        être lue en 3 h, pas pour la production. IA ou pas,
        l&apos;architecture reste <strong>votre</strong> travail : ne partez
        pas de ce repo pour une vraie application.
      </Callout>

      <Callout title="Les pièges" variant="note">
        <strong>Secrets</strong> : tout ce que l&apos;agent lit peut finir
        dans une requête LLM — pas de <code>.env</code> de production dans son
        périmètre. <strong>MCP tiers</strong> : du code que vous exécutez et
        du contenu qui entre dans votre contexte — l&apos;injection indirecte
        (module 06) peut se cacher dans une doc ou une issue.{" "}
        <strong>Permissions</strong> : ne passez pas en « tout autoriser » par
        confort. Et si vous ne sauriez pas relire la sortie, ne déléguez pas
        l&apos;entrée.
      </Callout>

      <DocLinks>
        <li>
          <DocLink href="https://code.claude.com/docs">
            Claude Code — documentation
          </DocLink>
        </li>
        <li>
          <DocLink href="https://docs.github.com/copilot">
            GitHub Copilot — documentation
          </DocLink>
        </li>
        <li>
          <DocLink href="https://github.com/upstash/context7">
            context7 — documentation à jour via MCP
          </DocLink>
        </li>
        <li>
          <DocLink href="https://github.com/vercel-labs/skills">
            skills — installer des skills (Claude Code, Copilot, Cursor…)
          </DocLink>
        </li>
      </DocLinks>
    </Tutorial>
  );
}
