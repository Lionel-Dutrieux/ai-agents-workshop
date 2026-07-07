# Module 05 — Serveur MCP

> **Durée** : ~30 min · **Fichier à modifier** : `web/lib/mcp/brewly-mcp-server.ts` · **Niveau** : avancé

## 🎯 Objectif

Aux modules 3 et 4, les outils de Brewly étaient **privés** : importés dans le code de l'agent, invisibles pour le reste du monde. Ici, on les ré-expose via **MCP** (Model Context Protocol), un standard ouvert : n'importe quel client (notre agent, mais aussi Claude Desktop, un IDE, un autre service) peut s'y brancher sans partager une ligne de notre code. On construit un vrai serveur MCP, puis on rebranche l'agent du module 4 dessus.

## 💡 Les concepts en bref

- **Serveur MCP** : un programme qui publie des outils via un protocole standard (JSON-RPC), plutôt que via un `import`.
- **`registerTool`** : la même idée qu'un outil du module 3 (nom, description, schéma, code) — juste une autre syntaxe, celle du SDK officiel `@modelcontextprotocol/sdk`.
- **`inputSchema`** : ici, un « raw shape » zod (`{ champ: z.string() }`), **pas** un `z.object(...)` comme au module 3.
- **Transport HTTP stateless** : le serveur reçoit une `Request` web et renvoie une `Response` ; un serveur neuf est créé à chaque appel, sans session à conserver — idéal en serverless.
- **Client MCP** : côté agent, les outils ne sont plus importés mais **assemblés au runtime** en interrogeant le(s) serveur(s) MCP activé(s).

## 📝 Étapes

Chaque étape correspond EXACTEMENT à un trou `⚠️ À VOUS` de la branche main,
dans `web/lib/mcp/brewly-mcp-server.ts`. Le serveur et son premier outil
(`getOrderStatus`) sont déjà fournis — inspirez-vous-en.

### Étape 1 — Écrire l'outil `getProductInfo`

Cet outil donne les infos d'un produit du catalogue (prix, origine,
intensité, stock) à partir de son nom. Il délègue à `findProductByName`,
déjà fourni dans le DAL — **exactement le même DAL** qu'au module 3, seule
la façade change.

La ligne `import { findProductByName, listProducts } from "@/lib/dal/brewly-catalog";`
va tout en haut du fichier, avec les autres imports (elle y est peut-être
déjà) ; le reste du bloc va à l'emplacement du trou `⚠️ À VOUS`.

```ts
// lib/mcp/brewly-mcp-server.ts
import { findProductByName, listProducts } from "@/lib/dal/brewly-catalog";

server.registerTool(
  "getProductInfo",
  {
    title: "Fiche produit",
    description:
      "Donne les informations d'un produit du catalogue Brewly (prix, origine, intensité, stock) à partir de son nom.",
    inputSchema: {
      nom: z
        .string()
        .describe("Le nom (ou une partie du nom) du produit recherché."),
    },
  },
  async ({ nom }) => {
    const product = await findProductByName(nom);
    const result = product
      ? { trouve: true as const, ...product }
      : { trouve: false as const, nom };
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);
```

### Étape 2 — Écrire l'outil `listCatalog`

Cet outil liste les produits du catalogue, avec un filtre optionnel par
catégorie (`cafe`, `machine`, `accessoire`). Il délègue à `listProducts`,
lui aussi déjà fourni dans le DAL.

```ts
// lib/mcp/brewly-mcp-server.ts
server.registerTool(
  "listCatalog",
  {
    title: "Catalogue produits",
    description:
      "Liste les produits du catalogue Brewly, éventuellement filtrés par catégorie (café, machine, accessoire). Utile pour conseiller ou comparer.",
    inputSchema: {
      categorie: z
        .enum(["cafe", "machine", "accessoire"])
        .nullable()
        .describe("Catégorie à filtrer, ou null pour tout le catalogue."),
    },
  },
  async ({ categorie }) => {
    const produits = await listProducts(categorie ?? undefined);
    const result = { nombre: produits.length, produits };
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

return server;
```

Le serveur (`app/api/mcp/route.ts`) et la route agent (`app/api/05-mcp/route.ts`,
le client MCP qui assemble les outils au runtime et lance la même boucle
qu'aux modules 3 et 4) sont déjà complets — vous n'avez rien à y changer.

## ✅ Tester

- Lancez l'app (`npm run dev` dans `web/`) et ouvrez [http://localhost:3000/05-mcp](http://localhost:3000/05-mcp).
- Demandez « Où en est ma commande #1042 ? » → l'agent appelle `getOrderStatus`, exactement comme au module 3, mais via un aller-retour réseau vers `/api/mcp`.
- Demandez « Parlez-moi du café Éthiopie » → l'agent appelle `getProductInfo`.
- Demandez « Quels cafés avez-vous ? » → l'agent appelle `listCatalog` avec `categorie: "cafe"`.
- Ouvrez le dialog « MCP » du chat, désactivez le serveur Brewly puis reposez une question : l'outil n'est plus disponible pour l'agent. Le bouton **« Tester »** du même dialog rejoue le handshake et liste les outils réellement exposés.
- Optionnel : pointez le MCP Inspector (`npx @modelcontextprotocol/inspector`) sur `http://localhost:3000/api/mcp` pour voir vos trois outils depuis un client externe.

## 🆘 Bloqué ?

- La solution complète est sur la branche `complete` : `git diff main complete -- web/lib/mcp/brewly-mcp-server.ts` ou ouvrez le fichier sur GitHub.
- Erreurs fréquentes :
  - Erreur 501 ou message « à implémenter » dans le chat → un des `registerTool` n'est pas encore écrit dans `brewly-mcp-server.ts`.
  - `inputSchema` en erreur au démarrage → c'est un **raw shape** zod (`{ nom: z.string() }`), pas un `z.object({ ... })` comme au module 3.
  - Le modèle appelle l'outil mais ne répond jamais ensuite → ce n'est pas un trou de ce module (la boucle `stopWhen` est déjà correcte dans `app/api/05-mcp/route.ts`) ; vérifiez plutôt le modèle utilisé.
  - Avec un petit modèle local, l'agent peut s'arrêter trop tôt ou boucler sans conclure : privilégiez un modèle « instruct » récent, à l'aise avec le function calling.

## 🚀 Pour aller plus loin (optionnel)

1. Ajoutez un quatrième outil au serveur (par exemple, une recherche par catégorie **et** intensité) et observez-le apparaître automatiquement côté agent, sans toucher à `app/api/05-mcp/route.ts`.
2. Désactivez le serveur MCP intégré dans le dialog « MCP » sans en activer d'autre : la route se replie sur `/api/mcp` (regardez le code de repli dans `app/api/05-mcp/route.ts`) — vérifiez ce comportement en pratique.
3. Modifiez la `description` de `listCatalog` pour la rendre volontairement vague et observez si le modèle hésite à l'appeler — le protocole change, mais l'importance de la description reste la même qu'au module 3.
