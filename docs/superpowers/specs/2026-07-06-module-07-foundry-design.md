# Module 07 — Microsoft Foundry (démo) — Design

**Date** : 2026-07-06 · **Statut** : validé

## Objectif pédagogique

Ouvrir sur l'écosystème « agents managés » : avec Microsoft Foundry, l'agent
devient une **ressource cloud** (instructions, modèle, guardrails, métriques,
versions gérés dans le portail) et le code applicatif se réduit à un simple
appel. Contraste volontaire avec les modules 01→06 où tout vit dans le code.

## Décisions

- **Format** : démo commentée, pas d'exercice. Page `web/app/07-foundry/`
  (tutoriel) + dossier autonome `foundry/` (script exécutable en live).
- **Agent créé dans le portail Foundry**, pas par code : le tutoriel fournit
  les instructions système complètes à copier-coller
  (`foundry/agent-instructions.md`). Le script ne fait qu'invoquer.
- **Tâche synchrone one-shot** (pas un chat) : analyse d'un avis client Brewly
  → sentiment + résumé + action suggérée, sortie JSON en console.
- **Pas de kit UI** : fait vérifié (docs Microsoft 2026) — le Foundry SDK est
  un SDK backend « thin-client » ; aucun équivalent à AI Elements. Encadré
  dédié dans le tutoriel.

## SDK (vérifié sur learn.microsoft.com, doc du 2026-06-19)

- Paquets : `@azure/ai-projects` **2.x** (« Foundry projects (new) API »)
  + `@azure/identity` (auth via `az login` + `DefaultAzureCredential`).
- Invocation d'un agent existant :
  `new AIProjectClient(endpoint, credential)` → `getOpenAIClient()` →
  `openai.responses.create({ input }, { body: { agent_reference: { name, type: "agent_reference" } } })`
  → `response.output_text`.

## Composants

1. **`foundry/`** (racine) : `package.json` (type module, tsx),
   `run-agent.ts` (~40 lignes, erreurs guidées : endpoint manquant, auth),
   `agent-instructions.md`, `.env.example`, `README.md`.
2. **`web/app/07-foundry/`** : `page.tsx` (ExerciseShell, panneau droit =
   sortie console simulée de la démo, pas de Chat) + `tutorial.tsx`
   (pourquoi Foundry, étape portail avec prompt à copier, étape code,
   « ce que vous ne codez plus », encadré kit UI, DocLinks).
3. **`web/app/page.tsx`** : carte 07 ajoutée (niveau « Démo »).
4. **`docs/04-modules.md`** : module Foundry renuméroté 07, aligné.

## Test

Exécution réelle du script contre le projet Azure du présentateur avant le
workshop. Lint/build du site Next.js pour la page 07.
