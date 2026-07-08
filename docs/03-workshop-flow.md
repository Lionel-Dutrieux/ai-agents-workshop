# Déroulé du workshop — 3h

> Guide de l'animateur. Principe : difficulté progressive, chaque module s'appuie sur le précédent.
>
> Les prérequis (Node.js, LM Studio, `npm install`, `.env` et base SQLite déjà versionnés) sont faits **avant le jour J** — voir [`exercices/00-prerequis.md`](../exercices/00-prerequis.md). Le temps de workshop ne sert qu'aux modules.

| Heure | Durée | Module | Format |
|---|---|---|---|
| 0:00 | 15 min | **Intro** — concepts clés (LLM, agent, tool calling, MCP), vérification rapide que tout tourne (prérequis déjà faits) | Présentation |
| 0:15 | 30 min | **Module 1 — Premier chat** : appel LLM avec le AI SDK, streaming vers l'UI (config du modèle dans l'app incluse) | Hands-on guidé |
| 0:45 | 15 min | **Module 2 — Structured output** : schéma zod, `streamObject`/`generateObject` (démo formateur du mode one-shot) | Hands-on |
| 1:00 | 30 min | **Module 3 — Tool calling** : donner des outils au modèle, boucle d'exécution | Hands-on |
| 1:30 | 10 min | ☕ **Pause** | |
| 1:40 | 20 min | **Module 4 — Agent multi-étapes** : `ToolLoopAgent`, contrôle de la boucle, affichage des étapes dans l'UI | Hands-on |
| 2:00 | 30 min | **Module 5 — Serveur MCP** : créer un serveur MCP avec le SDK officiel et le connecter à l'agent du module 4 (MCP Inspector en démo formateur) | Hands-on |
| 2:30 | 15 min | **Module 7 — Microsoft Foundry** : démo d'agent managé (SDK Foundry, auth Entra ID) | Démo |
| 2:45 | 10 min | **Wrap-up** — récap, ressources, Q&A | Présentation |

Total : 175 min sur 180 → **~5 min de marge**.

## Point de décision — 2:05

À 2h05 (juste avant d'attaquer le module 5), faites le point : si le module 5
n'est pas entamé par une partie du groupe, le formateur **termine le module 5
en démo** (branchement du client MCP sur le serveur, test dans le dialog
« MCP » + Inspector) plutôt que de sacrifier le module 7 ou le wrap-up. Les
participants en retard gardent la fiche et le `git diff main complete` pour
finir en autonomie après la séance.

## Modules optionnels (06 et 08)

- **Module 6 — Garde-fous** et **Module 8 — RAG custom** ne sont pas dans le
  timing ci-dessus : ce sont des **take-home**, avec leur fiche dédiée
  ([`06-guardrails.md`](../exercices/06-guardrails.md),
  [`08-rag.md`](../exercices/08-rag.md)).
- **Exception** : si le groupe est visiblement très rapide et arrive à 2:30
  avec de l'avance, le module 8 (~30 min) peut être joué **à la place** du
  module 7 + de la marge (au lieu du 07 en démo). Ne pas caser 06 *et* 08
  dans la séance — un seul remplace 07+marge, jamais les deux.
- Prévoyez deux **démos formateur de 5 min** à glisser dans les transitions
  (ou en fin de séance si le temps le permet), scriptées à l'avance :
  - **« Cassez votre RAG »** (module 8, KB-20) : montrer en direct la
    dérive d'un corpus mal maîtrisé (voir la section « Pour aller plus
    loin » de la fiche 08) — vendeur même sans faire l'exercice complet.
  - **L'injection indirecte** (module 6) : glisser une consigne piégée dans
    une fiche produit via la sandbox et montrer l'agent l'ignorer grâce au
    durcissement du system prompt (voir « ✅ Tester » de la fiche 06).

## Principes de conception

- **Les modules 1–5 sont le cœur hands-on** ; le module 7 (Foundry) est en
  mode démo pour tenir dans le temps — les participants ont le code complet
  dans le repo pour creuser ensuite.
- **Chaque module est autonome** : un participant en retard peut sauter à la
  solution (`complete`) et continuer.
- **06 et 08 sont des approfondissements volontairement hors timing** : ils
  ne sont pas nécessaires pour suivre la suite du parcours.

## Niveau de difficulté

```
Module 1  ▓░░░░  découverte
Module 2  ▓▓░░░  facile
Module 3  ▓▓▓░░  intermédiaire
Module 4  ▓▓▓▓░  intermédiaire+
Module 5  ▓▓▓▓▓  avancé
Module 6  ▓▓▓▓▓  avancé+ (optionnel, take-home)
Module 7  ▓▓░░░  démo (pas d'exercice)
Module 8  ▓▓▓▓▓  avancé++ (optionnel, take-home)
```
