# Prérequis — à préparer AVANT le workshop

Comptez ~20 minutes. Si tout est vert à la fin de cette page, vous êtes
prêt·e pour les 3 heures de workshop sans perdre de temps sur du setup.

## 1. À installer sur votre machine

### Node.js (obligatoire)

L'application est en Next.js et demande **Node.js 20.9 ou plus récent**
(prenez la LTS courante) : https://nodejs.org

Vérifiez dans un terminal :

```bash
node -v    # doit afficher v20.9+ (ou v22+)
npm -v
```

### Git (obligatoire)

Pour cloner le repo : https://git-scm.com (ou GitHub Desktop si vous
préférez une interface graphique).

### LM Studio (recommandé) — votre LLM local et gratuit

Le workshop fonctionne avec n'importe quel endpoint « OpenAI-compatible ».
Le plus simple et sans compte : **LM Studio** (https://lmstudio.ai).

1. Installez LM Studio, ouvrez-le.
2. Téléchargez un **modèle de chat** adapté à votre machine :
   - `mistralai/ministral-3-3b` (~3 Go) — léger, suffisant pour le workshop ;
   - `google/gemma-4-12b` (~7 Go) — meilleur si vous avez 16 Go de RAM ou plus.
3. Pour le **module 08 (RAG)**, téléchargez aussi le modèle d'embeddings
   `text-embedding-nomic-embed-text-v1.5` (~80 Mo).
4. Onglet **Developer** → démarrez le **serveur local** (port `1234`) et
   chargez vos modèles.

### Alternative sans LM Studio : un endpoint cloud

Si votre machine ne peut pas faire tourner un modèle local (ou si vous
préférez le cloud), il vous faut un **endpoint OpenAI-compatible** :

- **Azure AI Foundry** : déployez un modèle (ex. `gpt-4o-mini`) dans votre
  projet Foundry, puis notez l'**URL de l'endpoint** (`https://…/openai/v1`)
  et la **clé API** — l'app a un préréglage « Azure AI Foundry » qui attend
  exactement ces deux valeurs.
- **Ollama** (https://ollama.com) marche aussi en local : `ollama pull
  llama3.1` puis l'app a un préréglage « Ollama » (port `11434`).

> ⚠️ Sans LM Studio, le **module 08 (RAG)** ne sera pas jouable tel quel :
> il utilise un modèle d'embeddings local. Tout le reste (modules 01→07)
> fonctionne avec n'importe quel endpoint.

## 2. Installer le projet

```bash
git clone <URL_DU_REPO>
cd ai-agents-workshop        # vous êtes sur la branche main : la version starter
cd web
npm install                  # dépendances (2-3 min)
```

Créez le fichier d'environnement et la base de données locale :

```bash
# macOS / Linux
cp .env.example .env
# Windows (PowerShell)
copy .env.example .env

npx prisma migrate dev       # crée la base SQLite locale (répondez Entrée si un nom est demandé)
```

Puis lancez l'application :

```bash
npm run dev
```

Ouvrez http://localhost:3000 — la page d'accueil du workshop s'affiche.

## 3. Brancher votre modèle dans l'app

Tout se configure **dans l'application**, pas dans le code :

1. Ouvrez n'importe quel module (ex. « 01 — Premier chat ») et cliquez sur le
   sélecteur de **modèle** en bas du chat → « Gérer les modèles ».
2. Choisissez le préréglage **LM Studio (local)** (ou Ollama / Azure AI
   Foundry) : l'URL est préremplie, indiquez l'identifiant du modèle
   (ex. `mistralai/ministral-3-3b`, tel qu'affiché par LM Studio) — pas de
   clé pour LM Studio/Ollama, clé requise pour Azure.
3. Sur la **page d'accueil**, carte « Données de démonstration » : cliquez
   pour charger les données Brewly (catalogue, commandes, base de
   connaissances).

## 4. Vérifier que tout est prêt ✅

- [ ] `node -v` affiche v20.9 ou plus
- [ ] http://localhost:3000 s'affiche
- [ ] Les données de démonstration sont chargées (la carte de l'accueil les compte)
- [ ] Un modèle apparaît dans le sélecteur du chat
- [ ] LM Studio : le serveur local tourne (une requête sur
      http://localhost:1234/v1/models liste vos modèles)

> ℹ️ Sur la branche `main`, les routes des exercices répondent volontairement
> « Module 0X à implémenter » : c'est **normal**, c'est ce que vous allez
> coder pendant le workshop. Le chat affichera une erreur tant que le module
> n'est pas implémenté — l'important est que les pages s'affichent.

## En cas de souci le jour J

- Modèle qui ne répond pas → vérifiez que le serveur LM Studio est démarré
  (onglet Developer) et que le modèle est bien **chargé** (pas seulement
  téléchargé).
- `npm install` qui échoue → vérifiez la version de Node (`node -v`), puis
  supprimez `node_modules` et relancez.
- Toujours bloqué·e → la branche `complete` contient la version finale qui
  tourne : `git switch complete`.
