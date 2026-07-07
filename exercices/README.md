# Exercices du workshop

Les fiches de ce dossier sont le support papier du workshop : chacune décrit
un module — objectif, concepts, étapes avec **les blocs de code à
copier-coller**, comment tester. Elles se lisent sans lancer l'application,
et servent de guide pendant le hands-on.

## Comment ça marche

- **Règle du jeu** : la fiche est le guide d'action pendant le hands-on —
  c'est elle qui donne les blocs de code à coller. Le tutoriel in-app
  (panneau de gauche de chaque module) porte les concepts, la sandbox de
  données et la solution de secours — les deux sont complémentaires, pas
  redondants.
- Vous travaillez sur la branche **`main`** : tout est installé et
  fonctionne, mais certains passages sont à compléter. Chaque trou est
  marqué dans le code par un commentaire `⚠️ À VOUS` qui pointe vers
  l'étape correspondante de la fiche.
- Le but est de **comprendre les principes**, pas de savoir programmer :
  copier-coller les blocs des fiches est tout à fait encouragé. Lisez-les
  avant de les coller — c'est là que tout se joue.
- Bloqué ? La branche **`complete`** contient la solution intégrale de
  chaque module : `git diff main complete -- <fichier>` montre exactement
  ce qui manque.
- Chaque module a aussi son tutoriel dans l'application (panneau de
  gauche), plus détaillé que la fiche.

## Parcours (3 h)

| Module | Fiche | Durée | Niveau |
|---|---|---|---|
| 01 — Premier chat | [01-chat.md](01-chat.md) | ~25 min | découverte |
| 02 — Structured output | [02-structured-output.md](02-structured-output.md) | ~20 min | facile |
| 03 — Tool calling | [03-tools.md](03-tools.md) | ~30 min | intermédiaire |
| 04 — Agent multi-étapes | [04-agent.md](04-agent.md) | ~30 min | intermédiaire + |
| 05 — Serveur MCP | [05-mcp.md](05-mcp.md) | ~30 min | avancé |
| 06 — Garde-fous | [06-guardrails.md](06-guardrails.md) | ~20 min (si le temps le permet) | avancé + |
| 07 — Microsoft Foundry | [07-foundry.md](07-foundry.md) | ~15 min | démo (rien à coder) |
| 08 — RAG custom | [08-rag.md](08-rag.md) | ~30 min | avancé ++ |

Les modules 01→05 sont le cœur du parcours ; 06 et 08 sont les
approfondissements pour les groupes qui avancent bien, 07 est une démo
commentée.

## Avant de commencer

Suivez **[00-prerequis.md](00-prerequis.md)** (à faire idéalement AVANT le
jour J, ~20 min) : Node.js, LM Studio (ou un endpoint Azure AI
Foundry/Ollama), installation du projet (`npm install` puis `npm run dev` —
la base SQLite et le `.env` sont déjà versionnés, rien d'autre à créer ni à
migrer) et configuration du modèle dans l'app.
