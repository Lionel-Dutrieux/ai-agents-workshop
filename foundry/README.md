# Module 07 — Microsoft Foundry (démo)

Invoquer un agent **hébergé dans Microsoft Foundry** depuis un script
JavaScript minimal. L'agent (instructions, modèle, guardrails, métriques)
est géré côté cloud ; le code ne fait qu'un appel synchrone.

## Prérequis

- Node.js ≥ 20 et [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli)
- Un projet Microsoft Foundry avec un modèle déployé
- L'agent créé dans le portail : suivre [agent-instructions.md](./agent-instructions.md)

## Lancer la démo

```bash
az login                    # authentification Azure
cp .env.example .env        # puis renseigner PROJECT_ENDPOINT
npm install
npm start
```

Sortie attendue : l'analyse JSON de l'avis client (sentiment, résumé,
points clés, action suggérée, priorité).

## Authentification : et sans `az login` ?

Le Foundry **Agent Service n'accepte pas de clé API** — Microsoft impose
Entra ID pour les agents (la clé API ne couvre que l'inférence de modèle
basique, cf. [matrice de support](https://learn.microsoft.com/azure/foundry/concepts/authentication-authorization-foundry#feature-support-matrix)).

L'alternative sans `az login` : un **service principal**. Créez une app
registration, donnez-lui le rôle **Foundry User** sur le projet, puis
renseignez `AZURE_TENANT_ID`, `AZURE_CLIENT_ID` et `AZURE_CLIENT_SECRET`
dans `.env` (voir `.env.example`). `DefaultAzureCredential` les détecte
automatiquement — aucun changement de code.

Le tutoriel complet est dans l'app du workshop, module **07 — Microsoft
Foundry** (`web/app/07-foundry/`).
