# Questions ouvertes / à affiner

Liste des décisions à prendre avant ou pendant la construction du contenu.

## Provider & clés API

- [ ] Quel provider LLM pour les modules AI SDK ? (Anthropic, OpenAI, Azure OpenAI, plusieurs au choix ?)
- [ ] Comment les participants obtiennent-ils une clé le jour J ? (clés fournies, endpoint mutualisé, compte perso ?)
- [ ] Budget / rate limits pour ~N participants simultanés.

## Contenu

- [ ] Fil rouge / thème des exemples (un même domaine métier sur tous les modules rend le workshop plus cohérent — ex. assistant de gestion de tâches, agent e-commerce, etc.).
- [ ] Langue du contenu du workshop : français ou anglais ? (les docs de planification sont en FR, le code/README des modules pourrait être en EN).
- [ ] Périmètre exact du module MCP : stdio uniquement, ou aussi transport HTTP ?
- [ ] Module Foundry : quel niveau de compte/accès Azure faut-il ? Peut-on faire une démo sans que les participants aient un compte ?
- [ ] Le bonus .NET : go / no-go selon le temps de préparation.

## Logistique repo

- [ ] Créer le repo distant (GitHub) et pousser les deux branches.
- [ ] Tags/branches "checkpoint" par module pour les participants perdus — utile ou surcharge ?
- [ ] Versions à figer : Next.js, AI SDK (v5 ?), @modelcontextprotocol/sdk, Node minimum.
- [ ] Prérequis machine à annoncer aux participants (Node, pnpm/npm, .NET SDK pour le bonus, éditeur).

## Jour J

- [ ] Dry-run complet pour valider le timing de [03-workshop-flow.md](03-workshop-flow.md).
- [ ] Plan B sans réseau fiable (modèle local ? réponses mockées ?).
- [ ] Slides d'intro (concepts LLM/agents/MCP) — support séparé ou dans le repo ?
