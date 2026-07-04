# Fil rouge : « Brewly » — l'assistant d'un e-shop de café

> L'application qui sert de fil conducteur à tous les modules du workshop.

## L'idée en une phrase

**Brewly** est une boutique en ligne fictive de café (machines, grains, accessoires). Pendant le workshop, on construit progressivement **l'assistant IA de support client** de cette boutique : d'un simple chatbot qui répond aux questions jusqu'à un agent autonome capable de traiter une réclamation de bout en bout — puis on expose les capacités de la boutique via MCP pour que *n'importe quel* client IA (Claude Desktop, un IDE…) puisse opérer la boutique.

## Pourquoi ce choix

- **Tout le monde comprend le domaine** : commandes, livraisons, stock, remboursements. Zéro temps perdu à expliquer le métier.
- **L'utilité de chaque concept devient évidente** : un chatbot qui ne connaît pas vos commandes est inutile → il faut des *tools*. Une réclamation demande plusieurs vérifications → il faut un *agent*. D'autres apps veulent accéder à la boutique → il faut *MCP*.
- **La progression est naturelle** : chaque module ajoute une capacité visible à la même app, plutôt que 6 exemples déconnectés.
- **Données 100% mockées** : quelques fichiers JSON (produits, commandes, clients). Pas de vraie DB, pas de réseau requis pour les données.

## Les données de la boutique

Un petit jeu de données mock, partagé par tous les modules (dossier `web/data/` ou un package partagé) :

| Fichier | Contenu | Exemples de champs |
|---|---|---|
| `products.json` | ~15 produits (machines, grains, accessoires) | id, nom, prix, stock, description |
| `orders.json` | ~20 commandes à des états variés | id, clientId, articles, statut (`pending`, `shipped`, `delivered`, `lost`…), dates, transporteur |
| `customers.json` | ~10 clients | id, nom, email, historique |
| `policies.md` | Politique de retour/remboursement en langage naturel | délais, conditions, cas particuliers |

Les statuts variés (colis perdu, retard, livré) permettent des scénarios riches pour l'agent. `policies.md` sert de "connaissance" que le modèle doit appliquer — un bon aperçu du raisonnement sur règles métier.

## Le fil rouge module par module

### Module 1 — Le chatbot de base
Un chat "Brewly Support" avec un system prompt qui donne la personnalité de la marque et les infos générales (horaires, délais standards).
**La limite qu'on constate à la fin** : demandez-lui « où est ma commande #1042 ? » → il ne sait pas. *D'où le module 3.*

### Module 2 — Structured output : la boîte mail du support
Le support reçoit des emails clients en texte libre. On construit l'extracteur qui transforme un email en **ticket structuré** : `{ intention, orderId?, sentiment, priorité, résumé }` (schéma zod).
**Utilité démontrée** : le LLM comme moteur de transformation texte → données exploitables par du code classique.

### Module 3 — Tool calling : le chatbot accède à la boutique
On donne au chat des outils : `getOrderStatus`, `searchProducts`, `checkStock`.
**Moment "aha"** : la même question « où est ma commande #1042 ? » obtient maintenant une vraie réponse. Le modèle décide *seul* quel outil appeler.

### Module 4 — L'agent de support autonome
Scénario : *« Bonjour, ma commande #1087 devait arriver il y a 10 jours, toujours rien, c'est inadmissible ! »*
L'agent doit **enchaîner** : retrouver la commande → constater le statut `lost` → consulter `policies.md` → déterminer que le client a droit à un remboursement → proposer une réponse + une action (`createRefund`, outil sensible qui peut exiger une confirmation humaine).
**Concepts** : boucle multi-étapes, composition d'outils, garde-fous (human-in-the-loop sur le remboursement).

### Module 5 — MCP : la boutique devient un service pour tous les agents
Constat : nos outils sont enfermés dans l'app Next.js. On extrait les capacités de Brewly dans un **serveur MCP** (`brewly-mcp`) : tools (`get_order`, `search_products`, `create_refund`…) + resource (le catalogue, les policies).
**Démo qui marque** : brancher le serveur dans Claude Desktop ou l'inspector MCP et opérer la boutique *sans notre app* — puis reconnecter notre agent Next.js dessus.

### Module 6 — Foundry : le même agent, version plateforme managée
On recrée l'agent de support Brewly avec le SDK Microsoft Foundry pour comparer : ce que la plateforme gère (threads, orchestration, hébergement des outils) vs ce qu'on a codé à la main.
Le bonus .NET reprend ce même exemple en C#.

## Scénarios de démo (à réutiliser dans les énoncés)

1. « Quels cafés conseillez-vous pour un espresso corsé ? » → catalogue (module 3)
2. « Où en est ma commande #1042 ? » → suivi (module 3)
3. Email furieux sur un colis en retard → ticket structuré (module 2)
4. « Ma commande #1087 est perdue, remboursez-moi » → enquête + remboursement avec confirmation (module 4)
5. Depuis Claude Desktop : « fais un état des commandes bloquées chez Brewly » → via MCP (module 5)

## Ce que ce fil rouge ne couvre pas (assumé)

- RAG / embeddings : `policies.md` est assez court pour tenir dans le contexte. On le mentionne comme extension possible, sans l'implémenter.
- Auth, paiements réels, persistance : hors scope, données mock en lecture (+ écriture simulée pour `createRefund`).
