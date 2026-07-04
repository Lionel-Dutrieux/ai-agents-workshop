# Brewly — app Next.js du workshop

Application principale du workshop : frontend + backend de l'assistant Brewly.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **AI SDK v7** (`ai`, `@ai-sdk/react`) + **zod v4**
- **shadcn/ui** + **Tailwind CSS v4**
- **Prisma 7** + **SQLite** (via `@prisma/adapter-better-sqlite3`)

## Démarrage

```bash
npm install
cp .env.example .env        # puis renseigner la clé API du provider LLM
npx prisma migrate dev      # crée la base SQLite locale (quand des modèles existeront)
npm run dev
```

L'app tourne sur [http://localhost:3000](http://localhost:3000).

## Scripts utiles

| Script | Effet |
|---|---|
| `npm run dev` | Serveur de dev |
| `npm run build` | Build de production (inclut le type-check) |
| `npm run db:generate` | Régénère le client Prisma (`lib/generated/prisma`, non versionné) |
| `npm run db:migrate` | Applique/crée les migrations sur la base SQLite |
| `npm run db:studio` | UI d'exploration de la base |

## Points d'attention

- Le client Prisma est généré dans `lib/generated/prisma` (gitignoré) — lancer `npm run db:generate` après un clone.
- Accès DB via le singleton [`lib/prisma.ts`](lib/prisma.ts) (adapter better-sqlite3, requis par Prisma 7).
- La base SQLite (`prisma/dev.db`) n'est pas versionnée ; elle sera créée par les migrations + seed.
