# Guide du présentateur

> Vue d'ensemble du workshop pour l'animateur : le message à porter, le déroulé
> des modules et ce qui est attendu à chaque étape. Le minutage détaillé se
> trouve dans [03-workshop-flow.md](03-workshop-flow.md).

## L'esprit du workshop — le message à faire passer

Ce workshop est un **atelier découverte**, pas une formation à un framework ou
à un langage. À poser clairement dès l'introduction :

- **On n'apprend pas « le AI SDK » ni « Next.js »** : ce sont les supports de
  l'atelier, choisis parce qu'ils permettent d'aller vite et de tout voir
  fonctionner en 3 heures. Les participants n'ont pas besoin de les maîtriser,
  ni de les retenir.
- **On apprend les concepts** : streaming, sortie structurée, tool calling,
  boucle agentique, MCP, garde-fous, agents managés, RAG. Ces concepts sont
  identiques quel que soit l'écosystème — Python, .NET, Java, Go… tous
  disposent d'équivalents directs de tout ce qui est montré ici.
- **Le choix d'outillage viendra après, chez vous** : c'est aux équipes de
  sélectionner ensuite le framework adapté à leur stack et à leurs cas
  d'usage. Tout ce qui est construit pendant l'atelier est reproductible dans
  n'importe quelle technologie ; **ce sont les concepts qui comptent, pas la
  syntaxe**.
- **Copier-coller est encouragé** : les fiches d'exercices fournissent les
  blocs de code. L'objectif est de comprendre ce que chaque bloc fait et
  pourquoi il existe — pas de savoir l'écrire de mémoire.

Un point d'appui utile : le protocole **MCP** (module 5) et l'agent **Foundry**
(module 7) illustrent d'eux-mêmes cette indépendance technologique — le
premier est un standard ouvert consommable par n'importe quel client, le
second déplace l'agent hors du code applicatif.

## Le fil rouge

Tous les modules construisent le même produit : **l'assistant de support de
Brewly**, une boutique en ligne fictive de café. Chaque module part d'une
limite constatée au module précédent et la lève — la progression raconte une
histoire, pas une succession d'exemples déconnectés. Le concept complet est
décrit dans [06-app-concept.md](06-app-concept.md).

## Les modules en un coup d'œil

### Partie 1 — Les fondations (avant la pause)

| Module | Concept | Ce que font les participants | Le déclic attendu |
|---|---|---|---|
| **01 — Premier chat** (~25 min) | Appel LLM + streaming | Implémenter la route API qui appelle le modèle et diffuse la réponse vers l'UI | Le cycle requête → LLM → streaming → UI, socle de tout le reste. Et une limite : le bot ne connaît pas les commandes. |
| **02 — Structured output** (~20 min) | JSON typé et validé | Écrire un schéma zod et transformer un email client en ticket de support structuré | Le LLM n'est pas qu'un chatbot : c'est un moteur de transformation texte → données exploitables par du code classique. |
| **03 — Tool calling** (~30 min) | Le modèle agit | Écrire deux outils (fiche produit, catalogue) qui lisent la vraie base Brewly | « Où en est ma commande #1042 ? » obtient enfin une vraie réponse — le modèle décide seul quel outil appeler. |

### Partie 2 — Vers l'agent (après la pause)

| Module | Concept | Ce que font les participants | Le déclic attendu |
|---|---|---|---|
| **04 — Agent multi-étapes** (~20 min) | Boucle agentique | Empaqueter modèle + outils + garde-fou dans un `ToolLoopAgent` et le brancher dans la route | Sur une question composée, l'agent enchaîne plusieurs outils tout seul — sa trajectoire est visible dans l'UI. |
| **05 — Serveur MCP** (~30 min) | Interopérabilité | Ré-exposer les outils Brewly via un serveur MCP, sur lequel l'agent se reconnecte | Les mêmes capacités deviennent consommables par n'importe quel client (notre agent, un IDE, Claude Desktop) — sans partager une ligne de code. |
| **07 — Microsoft Foundry** (~15 min, **démo**) | Agent managé | Rien à coder : démo commentée par l'animateur | L'agent devient une ressource cloud (instructions, guardrails, métriques dans le portail) ; le code se réduit à un appel. Le contraste avec tout ce qui précède. |

### Modules take-home (hors timing, pour les groupes rapides ou après la séance)

| Module | Concept | En une phrase |
|---|---|---|
| **06 — Garde-fous** (~20 min) | Sécurité | Un middleware neutralise les injections en entrée et rédige les secrets en sortie — y compris l'injection indirecte via une fiche produit piégée. |
| **08 — RAG custom** (~30 min) | Recherche sémantique | Chunking, embeddings, similarité cosinus construits à la main : « comment me faire rembourser ? » retrouve la politique de retours sans aucun mot commun. |

Deux mini-démos de 5 min sont scriptées pour les transitions (injection
indirecte, « cassez votre RAG ») — voir [03-workshop-flow.md](03-workshop-flow.md).

## Ce qui est attendu des participants

- **Avant le jour J** : les prérequis de
  [`exercices/00-prerequis.md`](../exercices/00-prerequis.md) (~20 min) —
  Node.js, LM Studio (ou un endpoint compatible), clone du repo, `npm install`.
  Le temps de séance ne sert qu'aux modules.
- **Pendant** : suivre la fiche de chaque module (dossier
  [`exercices/`](../exercices/)) — elle donne les blocs de code à coller aux
  emplacements marqués `⚠️ À VOUS`, puis la façon de tester. Le tutoriel
  in-app (panneau gauche de chaque module) porte les explications détaillées.
- **En cas de blocage** : la branche `complete` contient la solution intégrale
  de chaque module (`git diff main complete -- <fichier>`). Personne ne reste
  bloqué : un participant en retard saute à la solution et continue.

## Rappels d'animation

- **Vérifier les prérequis dès l'intro** (page d'accueil qui s'affiche, un
  modèle qui répond) : c'est le seul point qui peut faire perdre du temps à
  tout le groupe.
- **Point de décision à 2h05** : si le module 5 n'est pas entamé par une
  partie du groupe, le terminer en démo plutôt que de sacrifier le module 7
  ou le wrap-up (détail dans [03-workshop-flow.md](03-workshop-flow.md)).
- **Au wrap-up, boucler sur le message d'ouverture** : dérouler la liste des
  concepts vus et rappeler qu'ils se transposent tels quels dans l'écosystème
  de chacun. Les modules 06 et 08 sont le prolongement naturel à faire en
  autonomie, fiches à l'appui.
