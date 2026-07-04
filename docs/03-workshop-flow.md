# Déroulé du workshop — 3h

> Timing indicatif, à ajuster après un dry-run. Principe : difficulté progressive, chaque module s'appuie sur le précédent.

| Heure | Durée | Module | Format |
|---|---|---|---|
| 0:00 | 15 min | **Intro + setup** — concepts clés (LLM, agent, tool calling, MCP), clone du repo, vérification que tout tourne | Présentation + hands-on |
| 0:15 | 25 min | **Module 1 — Premier chat** : appel LLM avec le AI SDK, streaming vers l'UI | Hands-on guidé |
| 0:40 | 20 min | **Module 2 — Structured output** : sorties typées (zod), génération d'objets | Hands-on |
| 1:00 | 30 min | **Module 3 — Tool calling** : donner des outils au modèle, boucle d'exécution | Hands-on |
| 1:30 | 10 min | ☕ **Pause** | |
| 1:40 | 30 min | **Module 4 — Agent multi-étapes** : agent autonome (multi-step, contrôle de la boucle, affichage des étapes dans l'UI) | Hands-on |
| 2:10 | 30 min | **Module 5 — Serveur MCP** : créer un serveur MCP avec le SDK officiel et le connecter à l'agent du module 4 | Hands-on |
| 2:40 | 15 min | **Module 6 — Microsoft Foundry** : démo/exemple d'agent avec le SDK Foundry (+ mention du bonus .NET) | Démo + code fourni |
| 2:55 | 5 min | **Wrap-up** — récap, ressources, Q&A | Présentation |

## Principes de conception

- **Les modules 1–5 sont le cœur hands-on** ; le module 6 (Foundry) est en mode démo pour tenir dans le temps — les participants ont le code complet dans le repo pour creuser ensuite.
- **Chaque module est autonome** : un participant en retard peut sauter à la solution (`complete`) et continuer.
- **Le bonus .NET n'est pas dans le timing** : c'est du contenu "à emporter" dans le repo, montré rapidement si de l'avance est prise.
- Prévoir un **fallback provider/clés API** : soit des clés fournies le jour J, soit un endpoint mutualisé, pour ne pas perdre 20 min sur du setup de comptes.

## Niveau de difficulté

```
Module 1  ▓░░░░  découverte
Module 2  ▓▓░░░  facile
Module 3  ▓▓▓░░  intermédiaire
Module 4  ▓▓▓▓░  intermédiaire+
Module 5  ▓▓▓▓▓  avancé
Module 6  ▓▓░░░  démo (pas d'exercice)
```
