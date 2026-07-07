# Module 07 — Microsoft Foundry (démo)

> **Durée** : ~15 min · **Dossier** : `foundry/` · **Niveau** : découverte

> 🎬 **Ceci est une démo, pas un exercice.** Il n'y a rien à coder : le code
> complet est déjà dans `foundry/` (script, instructions d'agent, config).
> Cette fiche décrit ce qui est montré en live et comment la rejouer
> vous-même après le workshop.

## 🎯 Objectif

Depuis le module 1, tout vivait dans votre code : prompts, outils, boucle
agentique, garde-fous. Microsoft Foundry inverse la charge : l'agent devient
une **ressource cloud** — instructions, modèle, guardrails et métriques sont
gérés dans le portail — et le code applicatif se réduit à un simple appel.

## 💡 Les concepts en bref

- **Agent managé** : l'agent (`brewly-review-analyst`) est créé et versionné dans le portail Foundry, pas dans le code du repo.
- **`agent_reference`** : le seul lien entre le script et l'agent — un nom. Le modèle et les instructions restent côté cloud.
- **Tâche synchrone one-shot** : pas de thread, pas de boucle, pas de streaming — un appel, une réponse.
- **Auth Entra ID obligatoire** : le Foundry Agent Service n'accepte pas de clé API pour les agents ; il faut `az login` ou un service principal.
- **Gouvernance sans code** : playground, métriques (latence, tokens, erreurs), content safety et traces sont disponibles dans le portail dès la création de l'agent.

## 🎬 Ce que montre la démo

### 1. L'agent, créé dans le portail Foundry

Dans **Build → Agents → Create agent**, l'agent `brewly-review-analyst` est
défini avec le modèle `gpt-5-mini` et les instructions système de
[`foundry/agent-instructions.md`](../foundry/agent-instructions.md) : à
partir d'un avis client brut, produire un JSON `sentiment` / `resume` /
`points_cles` / `action_suggeree` / `priorite`. Il est testé directement
dans le **playground** du portail, avant toute ligne de code.

### 2. L'invocation par script

[`foundry/run-agent.ts`](../foundry/run-agent.ts) fait un unique appel
synchrone à cet agent :

```ts
// 1. Client du projet Foundry (auth Azure : az login / identité managée).
const project = new AIProjectClient(endpoint, new DefaultAzureCredential());
const openai = project.getOpenAIClient();

// 2. Un seul appel, synchrone : pas de thread, pas de boucle, pas de stream.
//    `agent_reference` pointe vers l'agent défini dans le portail — le
//    modèle et les instructions viennent de là-bas, pas d'ici.
const response = await openai.responses.create(
  { input: review },
  { body: { agent_reference: { name: agentName, type: "agent_reference" } } },
);

console.log(response.output_text);
```

Notez ce qui **n'est pas** dans ce code : pas de system prompt, pas de choix
de modèle, pas de schéma de sortie — tout est porté par l'agent côté cloud.

### 3. La sortie

Le script analyse un avis client fictif (commande en retard, paquet ouvert,
mais bon service client) et affiche l'analyse JSON produite par l'agent en
console. Après quelques appels, l'onglet **Monitoring / Metrics** du portail
montre déjà latence, tokens et taux d'erreur — sans une ligne de code.

## ✅ Tester

Pour rejouer la démo vous-même après le workshop :

- Prérequis : Node.js ≥ 20, [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli), un projet Microsoft Foundry avec un modèle déployé.
- Créez l'agent dans le portail en suivant [`foundry/agent-instructions.md`](../foundry/agent-instructions.md) (nom, modèle, instructions à copier-coller).
- Dans le dossier `foundry/` :
  ```bash
  az login                    # authentification Azure
  cp .env.example .env        # puis renseigner PROJECT_ENDPOINT
  npm install
  npm start
  ```
- Vous devriez voir en console l'analyse JSON de l'avis client (sentiment, résumé, points clés, action suggérée, priorité).
- Sans `az login` (ex. CI, poste sans compte Azure interactif) : renseignez `AZURE_TENANT_ID`, `AZURE_CLIENT_ID` et `AZURE_CLIENT_SECRET` dans `.env` (service principal avec le rôle **Foundry User** sur le projet) — `DefaultAzureCredential` les détecte automatiquement, aucun changement de code.

## 🆘 Bloqué ?

- Le code complet (script, instructions d'agent, `.env.example`) est dans [`foundry/`](../foundry/) — rien à comparer avec `main`, il n'y a pas de trou à combler.
- `❌ PROJECT_ENDPOINT manquant` : copiez `.env.example` vers `.env` et renseignez l'endpoint (visible sur l'écran d'accueil du projet Foundry, format `https://<ressource>.services.ai.azure.com/api/projects/<projet>`).
- `❌ L'appel à l'agent a échoué` : vérifiez `az login`, que l'agent existe bien dans le portail sous le nom attendu, et que `PROJECT_ENDPOINT` pointe vers le bon projet.
- Le Foundry Agent Service refuse une clé API : c'est normal, Entra ID est obligatoire pour les agents (la clé API ne couvre que l'inférence de modèle basique).

## 🚀 Pour aller plus loin (optionnel)

1. Modifiez les instructions de l'agent dans le portail (par exemple, ajoutez une catégorie de sentiment) et relancez `npm start` sans toucher au script — la seule chose qui change vit dans le cloud.
2. Ouvrez l'onglet **Monitoring** du portail après plusieurs appels et comparez ce que vous obtenez « gratuitement » avec les garde-fous codés à la main au module 06.
3. Comparez avec l'AI SDK des modules précédents : contrôle total et n'importe quel provider (y compris local) d'un côté, gouvernance centralisée et adhérence à la plateforme de l'autre — les concepts (instructions, outils, garde-fous) restent identiques.
