# Module 03 — Tool calling

> **Durée** : ~30 min · **Fichier à modifier** : `web/app/api/03-tools/tools.ts` · **Niveau** : intermédiaire

## 🎯 Objectif

Jusqu'ici, le modèle ne fait que parler. On va lui donner des **outils** :
des fonctions qu'il peut décider d'appeler pour consulter une commande ou le
catalogue Brewly avant de répondre, au lieu d'inventer une réponse.

## 💡 Les concepts en bref

- **Un outil** = une fonction que vous écrivez, que le modèle peut choisir d'appeler (il ne l'exécute pas lui-même).
- **`description`** : le texte qui aide le modèle à décider QUAND appeler l'outil — soignez-le.
- **`inputSchema`** (zod) : les arguments attendus, transmis au modèle ET validés à l'exécution.
- **`execute`** : votre code serveur, qui tourne une fois que le modèle a demandé l'appel. Ici il délègue simplement au DAL (`lib/dal/brewly-*.ts`, déjà fourni).
- **`stopWhen: stepCountIs(5)`** : sans lui, le modèle appelle l'outil puis s'arrête sans jamais répondre — ce réglage autorise l'enchaînement *appel → résultat → réponse*.

## 📝 Étapes

> **Comment combler un trou :** repérez le commentaire `⚠️ À VOUS` dans le
> fichier, décommentez les imports indiqués en tête de fichier, collez le
> bloc de l'étape à l'emplacement du trou, puis **supprimez le code
> provisoire** (`return … 501`, `throw new Error("⚠️ …")` ou lignes
> `void …;`). Le commentaire `⚠️ À VOUS` peut rester, il documente ce que
> vous avez fait.

Chaque étape correspond EXACTEMENT à un trou `⚠️ À VOUS` de la branche main,
dans `web/app/api/03-tools/tools.ts`. Le premier outil (`getOrderStatus`) est
déjà fourni comme exemple — inspirez-vous-en.

### Étape 1 — Écrire l'outil `getProductInfo`

Cet outil donne les infos d'un produit du catalogue (prix, origine,
intensité, stock) à partir de son nom. Il délègue à `findProductByName`,
déjà fourni dans le DAL — vous n'avez pas à écrire l'accès aux données.

La ligne `import { findProductByName, listProducts } from "@/lib/dal/brewly-catalog";`
va tout en haut du fichier, avec les autres imports (elle y est peut-être
déjà) ; le reste du bloc va à l'emplacement du trou `⚠️ À VOUS`.

```ts
import { findProductByName, listProducts } from "@/lib/dal/brewly-catalog";

// ── Outil À ÉCRIRE n°1 ─────────────────────────────────────────────────
getProductInfo: tool({
  description:
    "Donne les informations d'un produit du catalogue Brewly (prix, origine, intensité, stock) à partir de son nom.",
  inputSchema: z.object({
    nom: z
      .string()
      .describe("Le nom (ou une partie du nom) du produit recherché."),
  }),
  execute: async ({ nom }) => {
    const product = await findProductByName(nom);
    if (!product) {
      return { trouve: false as const, nom };
    }
    return { trouve: true as const, ...product };
  },
}),
```

### Étape 2 — Écrire l'outil `listCatalog`

Cet outil liste les produits du catalogue, avec un filtre optionnel par
catégorie (`cafe`, `machine`, `accessoire`). Il délègue à `listProducts`,
lui aussi déjà fourni dans le DAL.

```ts
// ── Outil À ÉCRIRE n°2 ─────────────────────────────────────────────────
listCatalog: tool({
  description:
    "Liste les produits du catalogue Brewly, éventuellement filtrés par catégorie (café, machine, accessoire). Utile pour conseiller ou comparer.",
  inputSchema: z.object({
    categorie: z
      .enum(["cafe", "machine", "accessoire"])
      .nullable()
      .describe("Catégorie à filtrer, ou null pour tout le catalogue."),
  }),
  execute: async ({ categorie }) => {
    const produits = await listProducts(categorie ?? undefined);
    return { nombre: produits.length, produits };
  },
}),
```

## ✅ Tester

- Lancez l'app (`npm run dev` dans `web/`) et ouvrez [http://localhost:3000/03-tools](http://localhost:3000/03-tools).
- Demandez « Où en est ma commande #1042 ? » → l'agent doit appeler `getOrderStatus` puis répondre avec le statut.
- Demandez « Parlez-moi du café Éthiopie » → l'agent doit appeler `getProductInfo`.
- Demandez « Quels cafés avez-vous ? » → l'agent doit appeler `listCatalog` avec `categorie: "cafe"`.
- Dépliez l'encart **outil** affiché dans la réponse du chat pour voir les arguments envoyés et le résultat renvoyé par votre `execute`.
- Dans la sandbox en bas de page, passez un café en « Épuisé » ou changez son prix, puis reposez la question : la réponse de l'agent doit refléter votre modification (preuve que l'outil lit la vraie base).

## 🆘 Bloqué ?

- La solution complète est sur la branche `complete` : `git diff main complete -- web/app/api/03-tools/tools.ts` ou ouvrez le fichier sur GitHub.
- Le modèle appelle l'outil mais ne répond jamais ensuite ? Vérifiez que `stopWhen: stepCountIs(5)` est bien présent dans `web/app/api/03-tools/route.ts` (ce fichier n'a pas de trou, il est déjà correct).
- Le modèle répond sans jamais appeler d'outil ? Certains modèles locaux ne supportent pas bien le tool calling — essayez un modèle « instruct » récent connu pour le function calling.

## 🚀 Pour aller plus loin (optionnel)

1. Modifiez la `description` de `listCatalog` pour la rendre volontairement vague, et observez si le modèle hésite à l'appeler.
2. Ajoutez un exemple dans la `.describe()` du champ `nom` de `getProductInfo` et voyez si ça change la façon dont le modèle formule ses appels.
