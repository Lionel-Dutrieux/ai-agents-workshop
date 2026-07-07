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

## Module 6 — Garde-fous

- **Objectif** : ajouter la couche de sécurité de l'agent (anti-jailbreak, anti-fuite de secret, injection indirecte).
- **Contenu** : middleware `wrapLanguageModel` du AI SDK — durcissement et neutralisation en entrée (`transformParams`), redaction en sortie (`wrapGenerate`), défense en profondeur.
- **Exercice starter** : le détecteur est fourni, le middleware est à écrire et à brancher sur l'agent du module 3.
- **Concepts** : prompt injection directe/indirecte, guardrails déterministes, middleware composable.

## Module 7 — Microsoft Foundry (démo)

- **Objectif** : ouvrir sur l'écosystème "agents managés" : l'agent devient une ressource cloud, le code ne fait qu'appeler.
- **Contenu** : agent `brewly-review-analyst` créé dans le portail Foundry (instructions fournies à copier-coller), invoqué en une tâche synchrone par un script JS minimal (`foundry/run-agent.ts`, SDK `@azure/ai-projects` 2.x). Comparaison avec l'approche AI SDK : ce que la plateforme gère à votre place (versions, guardrails, content safety, métriques, playground) — et ce qu'elle ne fournit pas (kit UI).
- **Format** : démo commentée, code complet fourni — pas d'exercice.

## Module 8 — RAG custom

- **Objectif** : construire une recherche sémantique de A à Z et comprendre chaque étape d'un RAG — sans boîte noire.
- **Contenu** : indexation de la base de connaissances Brewly (20 articles) — chunking par paragraphe, `embedMany` vers un modèle d'embeddings local (LM Studio), stockage SQLite — puis interrogation : `embed` de la question, similarité cosinus (`cosineSimilarity` du AI SDK), top-K injecté dans le prompt, réponse sourcée (références KB-xx). Un mini moteur de recherche vectoriel (sans LLM) dans le panneau du module montre le retrieval à nu. Démo « échec puis fix » : l'index naïf avale l'article obsolète KB-20 (14 jours au lieu de 30), qui fuit dans les sources et peut fausser la réponse selon le modèle ; le filtre `publie` corrige.
- **Exercice starter** : le chunking et le squelette sont fournis ; les appels `embed`/`embedMany` et le top-K (avec le `cosineSimilarity` du SDK) sont à écrire.
- **Concepts** : embeddings, chunking, similarité cosinus, pipeline d'ingestion vs interrogation, qualité et périmètre du corpus, bases vectorielles en production (pgvector…).

## Bonus — .NET + Foundry SDK

- **Objectif** : montrer que les mêmes concepts s'appliquent hors TypeScript.
- **Contenu** : console app .NET minimaliste (dossier `dotnet-foundry/`) reprenant l'exemple du module 7 en C#. Volontairement light.
- **Statut** : optionnel, réalisé seulement si le temps de préparation le permet.
