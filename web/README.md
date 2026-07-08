# Brewly — app Next.js du workshop

Application principale du workshop : frontend + backend de l'assistant Brewly.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **AI SDK v7** (`ai`, `@ai-sdk/react`) + **zod v4**
- **shadcn/ui** + **Tailwind CSS v4**
- **AI Elements** (`components/ai-elements/`) — composants shadcn officiels pour le AI SDK (conversation, message, prompt-input, tool, reasoning…)
- **Prisma 7** + **SQLite** (via `@prisma/adapter-better-sqlite3`)
- **nuqs** — état dans l'URL (adapter branché dans `app/layout.tsx`)

## Démarrage

```bash
npm install
npm run dev
```

La base SQLite (`prisma/dev.db`) est versionnée, déjà migrée et remplie des
données de démo — rien d'autre à faire. Le `.env` est optionnel (voir
`.env.example`) ; les modèles LLM se configurent dans l'app, pas en
variables d'environnement.

L'app tourne sur [http://localhost:3000](http://localhost:3000).

## Scripts utiles

| Script | Effet |
|---|---|
| `npm run dev` | Serveur de dev |
| `npm run build` | Build de production (inclut le type-check) |
| `npm run db:generate` | Régénère le client Prisma (`lib/generated/prisma`, non versionné) |
| `npm run db:migrate` | Applique/crée les migrations sur la base SQLite |
| `npm run db:studio` | UI d'exploration de la base |

## Le composant `<Chat />` partagé

Chaque exercice réutilise le même composant de chat ([components/chat/](components/chat/)) :
il gère la conversation, le streaming, les tool calls et le reasoning — seule l'API change.

```tsx
// app/01-chat/page.tsx — Server Component (SSR), le chat est un îlot client
import { Chat } from "@/components/chat";

export default function Page() {
  return (
    <main className="mx-auto h-dvh max-w-3xl p-6">
      <Chat
        api="/api/01-chat"
        suggestions={["Quels cafés conseillez-vous pour un espresso corsé ?"]}
      />
    </main>
  );
}
```

Props utiles : `api` (endpoint de l'exercice), `body` (champs additionnels envoyés au backend),
`suggestions`, `placeholder`, `emptyStateTitle`, `emptyStateDescription`, `models` /
`defaultModelId` (sélecteur de modèle), `showMcpServers`, `contextWindow`.

Fonctionnalités intégrées :

- **Sélecteur de modèle** (command palette) — le choix est synchronisé dans l'URL (`?model=`)
  via nuqs et envoyé au backend dans `body.model`.
- **Serveurs MCP** — dialog d'ajout/suppression, persistés en localStorage et envoyés
  dans `body.mcpServers` (`{ id, name, url }[]`).
- **Jauge de tokens** — s'affiche dès qu'une route API renvoie l'usage via
  `toUIMessageStreamResponse({ messageMetadata })` (convention typée dans
  [components/chat/types.ts](components/chat/types.ts)) : fenêtre de contexte,
  détail input/output/reasoning/cache et coût estimé.

## Points d'attention

- Le client Prisma est généré dans `lib/generated/prisma` (gitignoré) — le script `postinstall` le régénère automatiquement ; en cas de besoin, `npm run db:generate`.
- Accès DB via le singleton [`lib/prisma.ts`](lib/prisma.ts) (adapter better-sqlite3, requis par Prisma 7).
- La base SQLite (`prisma/dev.db`) est versionnée avec le projet ; la carte « Données de démonstration » de la page d'accueil permet de remettre les données à zéro.
