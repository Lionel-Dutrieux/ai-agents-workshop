# Module 00 — Développer avec l'IA (Claude Code, GitHub Copilot…)

> **Durée** : ~10 min de démo (au wrap-up) · **Fiche** : take-home · **Niveau** : transverse

> 🎬 **Ceci est une démo + une fiche de pratiques, pas un exercice.** Rien à
> coder pendant la séance. Ce module ne parle pas de *créer* des agents (ça,
> c'est les modules 01-08) : il parle d'**utiliser** un agent de code —
> Claude Code, GitHub Copilot… — pour développer au quotidien. La fiche donne
> tout ce qu'il faut pour essayer chez vous.

## 🎯 Objectif

Les modules 01-08 construisent des agents *dans* votre application. Ce
module retourne la caméra : l'agent, c'est aussi **votre binôme de
développement**. Mêmes concepts — instructions, outils, MCP, boucle
agentique, garde-fous — mais appliqués à *votre façon de travailler*.

L'exemple est méta : **ce workshop a été construit exactement comme ça**,
avec Claude Code outillé de skills et d'instructions de repo. Les traces
sont versionnées dans ce dépôt, vous allez les voir une par une.

> ⚠️ **Avertissement honnête** : ce projet est une application *d'atelier* —
> découpage volontairement simple, tout-en-un, pensé pour être lu en 3 h.
> Son architecture **n'est pas production-grade** et ne doit pas servir de
> base à une vraie application : IA ou pas, l'architecture reste votre
> travail (et c'est justement le message de cette fiche).

## 💡 Les concepts en bref

- **Agent de code** : un LLM dans une boucle agentique (module 04 !) avec des outils — lire/écrire des fichiers, lancer des commandes, chercher — piloté depuis le terminal (Claude Code) ou l'IDE (Copilot).
- **Instructions de repo** : un fichier versionné (`CLAUDE.md`, `AGENTS.md`, `.github/copilot-instructions.md`) que l'agent lit à chaque session — le « system prompt » de votre projet.
- **Skills** : des paquets de connaissances spécialisées (doc, conventions, exemples) chargés à la demande — le contexte des technologies que vous utilisez.
- **MCP côté dev** : les mêmes serveurs MCP que le module 05, mais branchés sur *votre outil de dev* — ex. context7 pour la documentation à jour.
- **La règle d'or** : c'est **vous** qui pilotez. On n'accepte jamais du code qu'on ne comprend pas.

---

## 🧭 Règle n° 1 — on drive l'agent, on ne se fait pas driver

Tout le reste de cette fiche est secondaire par rapport à ceci :

- **Vous restez le développeur.** L'agent propose, vous disposez. Si vous
  vous surprenez à accepter des diffs sans les lire « parce que ça a l'air
  de marcher », arrêtez-vous : vous êtes en train de vous faire driver.
- **On n'accepte pas le code que l'on ne comprend pas.** Jamais. Du code
  généré non compris, c'est de la **dette technique** instantanée (personne
  ne sait le maintenir) et un **risque de sécurité** réel (une validation
  manquante, un secret loggé, une injection possible — vu au module 06 —
  passent inaperçus si personne ne lit).
- **Petites boucles.** Une demande ciblée → un petit diff → relecture →
  commit. Pas « refais-moi le module entier » suivi de 40 fichiers modifiés
  que personne ne relira.
- **L'IA accélère un développeur, elle ne le remplace pas.** Elle tape plus
  vite que vous ; elle ne porte pas la responsabilité du code à votre place.

Le reste de la fiche, ce sont les pratiques qui rendent ce pilotage
efficace : donner du contexte, planifier, choisir le bon modèle, relire.

---

## 📚 Pratique 1 — Les instructions de repo

L'agent démarre chaque session sans rien savoir de vos conventions. Un
fichier d'instructions versionné à la racine (ou par dossier) comble ce
trou : stack, conventions, pièges connus, commandes utiles.

**Dans ce repo** : ouvrez [`web/AGENTS.md`](../web/AGENTS.md). Trois lignes,
mais décisives : elles préviennent l'agent que la version de Next.js utilisée
ici a des breaking changes par rapport à ses données d'entraînement, et lui
disent où lire la doc embarquée avant d'écrire du code. Sans ça, l'agent
génère du Next.js « d'avant » — plausible, mais faux. `web/CLAUDE.md` se
contente d'inclure ce fichier : une seule source de vérité pour tous les
outils.

> 💜 **Côté Copilot** : `.github/copilot-instructions.md` joue le même rôle
> (et Copilot sait aussi lire `AGENTS.md`). Même principe : court, factuel,
> versionné — c'est de la revue de code comme le reste.

---

## 🧩 Pratique 2 — Les skills : le contexte des technologies que vous utilisez

Un **skill** est un paquet de connaissances qu'un agent charge à la demande :
la doc condensée d'une techno, ses conventions, des exemples canoniques.
C'est la réponse au problème n° 1 des LLM en développement : leurs
connaissances datent de leur entraînement.

**Dans ce repo** : regardez [`skills-lock.json`](../skills-lock.json) et
`.claude/skills/`. Pour construire ce workshop, les skills officiels de
**Vercel** ont été installés :

| Skill | Source | Ce qu'il apporte |
|---|---|---|
| `ai-sdk` | `vercel/ai` | L'API réelle du AI SDK 7 (celle des modules 01-08) |
| `ai-elements` | `vercel/ai-elements` | Les composants de chat de l'UI |
| `next-*` | `vercel/next.js` | Les patterns de la version de Next.js utilisée |

Concrètement : quand l'agent a écrit les routes des modules, il a chargé le
skill `ai-sdk` et utilisé `streamText`, `ToolLoopAgent`, `instructions` —
l'API **actuelle** — au lieu d'halluciner celle d'il y a deux ans. C'est ce
qui a permis de construire quelque chose d'interactif et de correct en un
temps raisonnable.

Installation (l'outil [`skills`](https://github.com/vercel-labs/skills)
fonctionne pour Claude Code, Copilot, Cursor…) :

```bash
npx skills add vercel/ai          # le skill ai-sdk
npx skills add vercel/ai-elements # les composants de chat
```

> 💜 **Côté Copilot** : les skills installés par `npx skills` sont aussi
> exposés à Copilot ; l'équivalent natif le plus proche reste les
> *custom instructions* et les *prompt files* (`.github/prompts/`).

---

## 🔌 Pratique 3 — Des MCP au service du dev

Le protocole MCP du module 05 marche dans les deux sens : votre agent de
code est un **client MCP**. Trois serveurs qui changent la vie :

| Serveur | Ce qu'il fait | Pourquoi |
|---|---|---|
| **context7** | Va chercher la documentation **à jour** des librairies (versionnée, en ligne) et l'injecte dans le contexte | L'anti-hallucination d'API : au lieu de deviner, l'agent *consulte*. C'est un RAG de documentation — exactement le pattern du module 08, en produit fini |
| **GitHub MCP** | Issues, PR, reviews depuis l'agent | « Résume les commentaires de la PR #42 et applique-les » |
| **Playwright MCP** | Pilote un vrai navigateur | L'agent vérifie *lui-même* que sa feature marche à l'écran, au lieu de déclarer victoire après compilation |

Configuration de context7, par exemple :

```bash
# Claude Code
claude mcp add context7 -- npx -y @upstash/context7-mcp
```

```jsonc
// VS Code (Copilot) — .vscode/mcp.json
{
  "servers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
```

> ⚠️ Un serveur MCP tiers est du **code que vous exécutez** et du **contenu
> qui entre dans votre contexte** — voir la section sécurité plus bas.

---

## 🧠 Pratique 4 — Le bon modèle pour la bonne tâche

Vous l'avez fait toute la séance dans l'app Brewly (le sélecteur de modèle
du module 01) : le même réflexe s'applique à votre outil de dev.

- **Tâches mécaniques** (renommage, boilerplate, tests répétitifs,
  complétion) → un modèle **rapide et économique**. La qualité marginale
  d'un gros modèle n'apporte rien, la latence si.
- **Tâches de conception** (architecture d'une feature, debugging retors,
  revue de sécurité) → le modèle **le plus capable** disponible. C'est là
  que l'écart de raisonnement se paie ou se gagne.
- **Règle simple** : plus la tâche demande de *jugement*, plus le modèle
  doit être capable. Plus elle demande du *volume*, plus il doit être rapide.

> 💜 **Côté Copilot** : le *model picker* propose exactement cet arbitrage
> (modèles rapides pour la complétion, modèles de raisonnement pour le mode
> agent). Dans Claude Code : `/model`.

---

## 🗺️ Pratique 5 — Le plan mode : planifier avant de coder

Pour toute feature non triviale, ne demandez pas « implémente X ». Demandez
d'abord **un plan** :

1. **Plan mode** (Claude Code : `Shift+Tab` ; l'agent explore le code en
   lecture seule et ne modifie rien).
2. L'agent lit la codebase, pose ses questions, propose un plan : fichiers
   touchés, approche, ordre des étapes.
3. **Vous relisez le plan** — c'est 10 fois plus rapide de corriger un plan
   qu'un diff de 15 fichiers. Mauvaise approche ? On la corrige *ici*.
4. Vous validez, l'agent exécute, étape par étape.

C'est la matérialisation de la règle n° 1 : le plan est le contrat, vous le
signez avant que la première ligne soit écrite. La démo ci-dessous le montre
en direct.

> 💜 **Côté Copilot** : le mode *Plan* de l'agent VS Code (ou, à défaut,
> demander explicitement un plan en mode *Ask* avant de passer en mode
> *Agent*).

---

## 👀 Pratique 6 — La revue : non négociable

- **On relit 100 % du diff.** Pas « on survole » : on relit, comme la PR
  d'un collègue junior brillant mais pressé — c'est exactement ce que c'est.
- **Petits commits.** Un commit par étape validée : si l'étape 3 déraille,
  on jette l'étape 3, pas la journée. `git diff` est votre filet principal.
- **Les tests restent le garde-fou.** Faites écrire les tests par l'agent si
  vous voulez — mais relisez-les avec *plus* d'attention que le code : un
  test généré qui ne teste rien donne une fausse confiance.
- **La revue par IA est une seconde paire d'yeux, pas un remplacement.**
  Demander à l'agent de relever bugs et failles sur son propre diff attrape
  de vraies erreurs — mais la responsabilité de la revue reste humaine.

---

## ⚠️ Pratique 7 — Les pièges à connaître

- **Les secrets.** Tout ce que l'agent lit peut finir dans une requête vers
  un LLM. Les `.env` de production, dumps clients, clés privées n'ont rien à
  faire dans son périmètre de lecture.
- **Les MCP tiers = surface d'attaque.** Un serveur MCP malveillant (ou
  compromis) peut mentir dans ses résultats — et une **injection indirecte**
  (module 06 !) peut se cacher dans une doc, une issue GitHub, une page web
  que l'agent lit. N'installez que des serveurs de sources fiables, et
  gardez un œil sur ce que l'agent fait *après* avoir lu du contenu externe.
- **Les permissions.** Les agents demandent confirmation avant les commandes
  sensibles : ne passez pas en « tout autoriser » par confort. Comprendre
  *ce que l'agent s'apprête à exécuter* fait partie du pilotage.
- **La dette silencieuse.** L'agent produit du code *plausible* avec une
  assurance constante — y compris quand il a tort. Les endroits où ça se
  voit le moins : gestion d'erreurs, cas limites, sécurité. Les endroits où
  il faut relire le plus.
- **Savoir ne pas l'utiliser.** Domaine critique que vous ne sauriez pas
  relire, code réglementé, décision d'architecture structurante : si vous ne
  pouvez pas juger la sortie, ne déléguez pas l'entrée.

---

## 🎬 La démo (ce que montre l'animateur)

Deux prompts scriptés, joués en live avec Claude Code sur ce repo. Ils sont
donnés verbatim pour que vous puissiez les rejouer chez vous.

### Démo 1 — Comprendre une codebase (lecture seule, ~3 min)

L'usage n° 1 au quotidien, avant même de générer du code : **se faire
expliquer du code existant**.

```text
Explique-moi comment fonctionne l'agent du module 04, de la requête HTTP
jusqu'à l'affichage des étapes d'outils dans l'UI. Cite les fichiers
impliqués et le rôle de chacun dans le flux.
```

L'agent explore le repo et restitue le flux complet (route → agent → boucle
d'outils → stream → UI). Zéro risque, gain immédiat : c'est l'outil
d'onboarding le plus efficace qui existe.

### Démo 2 — Le Sommelier Brewly (plan mode → diff → revue, ~8 min)

Une mini-feature en **réassemblage pur** : rien de conceptuellement nouveau,
que des briques existantes — le but est de montrer la *méthode*, pas la
feature.

```text
Je veux une page /sommelier : « le Sommelier Brewly », un agent qui
recommande des cafés du catalogue selon les goûts du client (corsé,
fruité, doux, décaféiné…).

Comportement attendu :
- Persona : sommelier du café, chaleureux et expert. Si les goûts ne
  sont pas clairs, il pose UNE question avant de recommander.
- Il recommande UNIQUEMENT des produits du catalogue (via les outils),
  en stock, avec prix, origine et intensité — 2 options max, et un mot
  sur pourquoi chacune correspond aux goûts exprimés.
- Réponses en français, courtes et engageantes.

Interface :
- Réutilise le composant <Chat/> existant (components/chat), en
  t'inspirant de app/04-agent/page.tsx : titre d'accueil
  « Sommelier Brewly », description d'accueil, et 3 suggestions
  cliquables (prop `suggestions`) pour tester sans rien taper :
  « Un café corsé pour le matin », « Plutôt doux et fruité, une
  idée ? », « Un décaféiné pour le soir ».
- Une page simple : pas besoin du panneau tutoriel (ExerciseShell).

Contraintes strictes :
- La route calque le pattern du module 04 (route + ToolLoopAgent).
- Réutilise les brewlyTools existants tels quels — aucun nouvel outil,
  aucune modification de la base de données.
- Ne modifie aucun fichier des modules existants (01 à 08).
- La seule vraie nouveauté : les instructions de l'agent.

Présente-moi d'abord ton plan complet. N'écris aucun code avant ma
validation.
```

Le déroulé montré, dans l'ordre — chaque étape incarne une pratique de la
fiche :

1. **Plan mode** : l'agent explore, propose un plan (2 fichiers : la page,
   la route). On le relit, on le valide — pratique 5.
2. **Exécution** : l'agent écrit les deux fichiers en calquant le module 04
   — les instructions de repo et le skill `ai-sdk` garantissent la bonne
   API — pratiques 1 et 2.
3. **Revue du diff en live, à l'écran** : on lit tout, on vérifie les
   contraintes (aucun module touché, aucun outil ajouté) — pratique 6. Puis
   on accepte. (Ou pas : refuser aussi fait partie de la démo.)
4. **Preuve par la sandbox** : dans la sandbox de l'app (page `/sandbox`),
   on ajoute en direct un produit inventé (ex. « Décaféiné Framboise du
   Chili »), puis on
   demande au sommelier *« un café fruité sans caféine ? »* → l'agent
   appelle `listCatalog`, le **tool call s'affiche dans l'UI** avec le
   produit ajouté 30 secondes plus tôt. La boucle est bouclée : l'agent
   qu'on vient de créer *avec* un agent fait du tool calling sur des données
   vivantes (modules 03-04).

## ✅ Tester (rejouer chez vous)

- Installez un agent de code : [Claude Code](https://code.claude.com/docs)
  (`npm install -g @anthropic-ai/claude-code`) ou
  [GitHub Copilot](https://docs.github.com/copilot) dans VS Code.
- Dans ce repo : les skills et instructions sont déjà versionnés — ouvrez
  `.claude/skills/`, `skills-lock.json` et `web/AGENTS.md` pour voir la
  mécanique.
- Ajoutez context7 (commandes dans la Pratique 3) et posez une question
  pointue sur l'API du AI SDK 7 : comparez la réponse avec et sans.
- Rejouez les deux prompts de la démo, en respectant le rituel : plan →
  validation → diff → revue → commit.

## 🆘 Bloqué ?

- La démo 2 crée `/sommelier` sur une branche jetable — elle n'est pas
  committée dans ce repo : c'est volontaire, le résultat n'a aucune valeur,
  c'est la *méthode* qui en a.
- Claude Code sans licence ? Les pratiques 1, 6 et 7 (instructions de repo,
  revue, pièges) s'appliquent à l'identique avec Copilot, Cursor ou tout
  autre agent de code.
- context7 ne répond pas : vérifiez que `npx -y @upstash/context7-mcp` se
  lance seul dans un terminal (il télécharge le paquet au premier appel).

## 🚀 Pour aller plus loin (optionnel)

1. **Écrivez un skill maison** pour une techno interne de votre équipe (un
   `SKILL.md` : quand l'utiliser, les conventions, 2-3 exemples canoniques)
   — c'est le meilleur rapport effort/impact qui existe.
2. **Branchez le serveur MCP Brewly du module 05 sur votre agent de code**
   (`claude mcp add --transport http brewly http://localhost:3000/api/mcp`) :
   votre outil de dev interroge le catalogue de l'app que vous venez de
   construire — MCP dans les deux sens.
3. **Comparez la même feature avec et sans plan mode** sur un side-project :
   mesurez le nombre d'allers-retours et la taille des diffs à relire. C'est
   l'argument le plus convaincant pour vos collègues.
