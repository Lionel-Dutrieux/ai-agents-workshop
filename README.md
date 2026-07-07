# AI Agents Workshop

Workshop pratique (3h) : construire des agents IA avec le **AI SDK (Vercel)**, **Next.js**, le **Model Context Protocol (MCP)** et **Microsoft Foundry**.

> 🚧 Repo en cours de construction. La planification détaillée se trouve dans le dossier [`docs/`](docs/).

## Les exercices

Les fiches de chaque module (objectif, concepts, étapes avec les blocs de
code à copier-coller, comment tester) sont dans [`exercices/`](exercices/) —
lisibles sans lancer l'application. Commencez par
[`exercices/README.md`](exercices/README.md).

## Branches

| Branche | Contenu |
|---|---|
| `main` | Version de départ : setup minimal + énoncés des exercices. C'est la branche que les participants clonent. |
| `complete` | Version complète : tous les exercices résolus, code final de référence. |

## Documents de planification

- [Structure du repo](docs/01-repo-structure.md)
- [Stratégie de branches](docs/02-branching-strategy.md)
- [Déroulé du workshop (3h)](docs/03-workshop-flow.md)
- [Détail des modules](docs/04-modules.md)
- [Questions ouvertes / à affiner](docs/05-open-questions.md)
- [Fil rouge : l'application « Brewly »](docs/06-app-concept.md)

## Stack

- **Next.js** (App Router) — frontend + backend des exemples principaux
- **AI SDK (Vercel)** — appels LLM, streaming, tool calling, agents
- **@modelcontextprotocol/sdk** — création d'un serveur MCP
- **Microsoft Foundry** — exemple d'agent via le SDK Foundry
- **.NET** *(bonus, si le temps le permet)* — implémentation light avec le Foundry SDK
