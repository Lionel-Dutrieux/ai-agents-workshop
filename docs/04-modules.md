# Détail des modules

> Description high-level de chaque module : objectif pédagogique, contenu, livrable. Les énoncés précis des exercices viendront plus tard.

## Module 1 — Premier chat (AI SDK + Next.js)

- **Objectif** : comprendre le cycle requête → LLM → streaming → UI.
- **Contenu** : route API Next.js avec `streamText`, hook `useChat` côté client, configuration du provider.
- **Exercice starter** : la route API est vide, l'UI est fournie. Implémenter l'appel au modèle et le streaming.
- **Concepts** : messages, rôles, system prompt, streaming.

## Module 2 — Structured output

- **Objectif** : obtenir du JSON typé et fiable plutôt que du texte libre.
- **Contenu** : `generateObject` / `streamObject` avec un schéma zod. Cas d'usage concret (ex. extraction d'infos d'un texte, génération d'une fiche produit).
- **Exercice starter** : le schéma zod est à écrire + l'appel à brancher.
- **Concepts** : schémas, validation, cas d'usage "LLM comme moteur de transformation de données".

## Module 3 — Tool calling

- **Objectif** : le modèle ne fait pas que parler — il agit.
- **Contenu** : définir des outils (`tool()` + zod), les passer au modèle, observer le cycle appel d'outil → résultat → réponse. Outils simples : météo mock, calcul, recherche dans des données locales.
- **Exercice starter** : un outil fourni en exemple, deux à écrire.
- **Concepts** : function calling, description des outils, choix du modèle d'appeler ou non un outil.

## Module 4 — Agent multi-étapes

- **Objectif** : passer de "un appel avec outils" à "un agent qui boucle jusqu'à atteindre son but".
- **Contenu** : boucle multi-step du AI SDK (`stopWhen` / contrôle des étapes), affichage des étapes intermédiaires dans l'UI, limites et garde-fous (nombre max d'étapes).
- **Exercice starter** : transformer le chat du module 3 en agent capable d'enchaîner plusieurs outils pour une tâche composée.
- **Concepts** : boucle agentique, planification implicite, observabilité des étapes.

## Module 5 — Serveur MCP

- **Objectif** : exposer des outils via un standard réutilisable par n'importe quel client (Claude, IDE, notre agent).
- **Contenu** : serveur MCP avec `@modelcontextprotocol/sdk` (dossier `mcp-server/`), quelques tools + éventuellement une resource. Connexion du serveur à l'agent Next.js du module 4, et/ou test avec un client existant (Claude Desktop / inspector MCP).
- **Exercice starter** : squelette du serveur fourni, tools à implémenter, connexion à l'agent à faire.
- **Concepts** : protocole MCP, tools vs resources vs prompts, transports (stdio / HTTP), interopérabilité.

## Module 6 — Microsoft Foundry (démo)

- **Objectif** : ouvrir sur l'écosystème "agents managés" côté Azure.
- **Contenu** : exemple d'agent créé avec le SDK Microsoft Foundry (dossier `foundry/`), comparaison rapide avec l'approche AI SDK (ce que la plateforme gère à votre place : threads, orchestration, outils hébergés).
- **Format** : démo commentée, code complet fourni — pas d'exercice.

## Bonus — .NET + Foundry SDK

- **Objectif** : montrer que les mêmes concepts s'appliquent hors TypeScript.
- **Contenu** : console app .NET minimaliste (dossier `dotnet-foundry/`) reprenant l'exemple du module 6 en C#. Volontairement light.
- **Statut** : optionnel, réalisé seulement si le temps de préparation le permet.
