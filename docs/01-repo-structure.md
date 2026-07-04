# Structure du repo

> High-level, à affiner au fur et à mesure de la création des modules.

## Arborescence cible

```
ai-agents-workshop/
├── README.md                     # Point d'entrée : objectifs, prérequis, liens
├── docs/                         # Planification + supports du workshop
│   ├── 01-repo-structure.md
│   ├── 02-branching-strategy.md
│   ├── 03-workshop-flow.md
│   ├── 04-modules.md
│   └── 05-open-questions.md
│
├── web/                          # App Next.js unique (frontend + backend)
│   ├── app/
│   │   ├── 01-chat/              # Un dossier (route) par module
│   │   ├── 02-structured-output/
│   │   ├── 03-tools/
│   │   ├── 04-agent/
│   │   └── 05-mcp-client/
│   ├── .env.example
│   └── package.json
│
├── mcp-server/                   # Serveur MCP standalone (@modelcontextprotocol/sdk)
│   ├── src/
│   └── package.json
│
├── foundry/                      # Exemple Microsoft Foundry (TypeScript)
│   └── ...
│
└── dotnet-foundry/               # (Bonus) Implémentation light .NET + Foundry SDK
    └── ...
```

## Choix structurant : une seule app Next.js

**Recommandation : une seule app Next.js (`web/`) avec une route par module**, plutôt qu'une app par module.

Pourquoi :
- Un seul `npm install` + un seul `.env` → moins de friction au démarrage (crucial sur 3h).
- Les participants naviguent entre les modules via une simple page d'accueil.
- Le code partagé (config du provider, composants UI de chat) est mutualisé.

Alternative écartée : monorepo avec une app par exemple → trop de setup, trop de temps perdu en installation pendant le workshop.

Les projets **réellement distincts** (serveur MCP, .NET) restent dans des dossiers séparés à la racine car ce sont des runtimes différents.

## Conventions

- Chaque module a un `README.md` local : objectif, énoncé de l'exercice, indices.
- Numérotation `01-`, `02-`… partout pour rendre la progression évidente.
- `.env.example` à la racine de chaque projet listant toutes les clés nécessaires.
