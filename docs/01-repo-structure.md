# Structure du repo

## Arborescence

```
ai-agents-workshop/
├── README.md                     # Point d'entrée : objectifs, prérequis, liens
├── docs/                         # Documentation du workshop
│   ├── 01-repo-structure.md
│   ├── 02-branching-strategy.md
│   ├── 03-workshop-flow.md
│   ├── 04-modules.md
│   └── 06-app-concept.md
│
├── exercices/                    # Les fiches d'exercices (une par module)
│   ├── 00-prerequis.md
│   ├── 01-chat.md … 08-rag.md
│   └── README.md
│
├── web/                          # App Next.js unique (frontend + backend)
│   ├── app/
│   │   ├── 01-chat/              # Un dossier (route) par module
│   │   ├── 02-structured-output/
│   │   ├── 03-tools/
│   │   ├── 04-agent/
│   │   ├── 05-mcp/
│   │   ├── 06-guardrails/
│   │   ├── 07-foundry/
│   │   ├── 08-rag/
│   │   └── api/                  # Routes API des modules + serveur MCP (/api/mcp)
│   ├── lib/                      # DAL Brewly, agent, guardrails, RAG, serveur MCP
│   ├── prisma/                   # Schéma, migrations et base SQLite versionnée
│   └── package.json
│
└── foundry/                      # Module 07 : script d'invocation d'un agent Microsoft Foundry
    ├── run-agent.ts
    ├── agent-instructions.md
    └── README.md
```

## Choix structurant : une seule app Next.js

Le workshop repose sur **une seule app Next.js (`web/`) avec une route par module**, plutôt qu'une app par module :

- Un seul `npm install`, une seule configuration → moins de friction au démarrage (crucial sur 3h).
- Les participants naviguent entre les modules via la page d'accueil.
- Le code partagé (résolution du modèle, composant `<Chat/>`, données Brewly) est mutualisé : chaque module ne montre que ce qui lui est propre.

Le serveur MCP du module 05 est lui aussi hébergé dans l'app (`web/lib/mcp/` + route `/api/mcp`) : le protocole reste identique à un serveur standalone, sans coût de setup supplémentaire.

Seul le module 07 (Microsoft Foundry) vit dans un dossier séparé (`foundry/`) : c'est un script Node autonome avec son propre runtime et sa propre authentification Azure.

## Conventions

- Chaque module a sa fiche dans `exercices/` : objectif, concepts, étapes avec les blocs de code, tests, dépannage.
- Numérotation `01-`, `02-`… partout (routes, fiches, API) pour rendre la progression évidente.
- Les emplacements à compléter sont marqués `⚠️ À VOUS` dans le code de la branche `main`.
