# Module 08 — RAG custom

> **Durée** : ~30 min · **Fichier à modifier** : `web/lib/ai/rag.ts` · **Niveau** : Avancé ++

## 🎯 Objectif

La recherche par mots-clés ne trouve rien pour « comment me faire rembourser ? » alors que la politique de retours existe dans la base — aucun mot ne correspond littéralement. Vous allez construire une recherche **sémantique** de A à Z (chunking, embeddings, similarité cosinus) pour que l'assistant retrouve et cite la bonne source, quelle que soit la formulation de la question.

## 💡 Les concepts en bref

- **Embedding** : un modèle transforme un texte en **vecteur** (une liste de nombres) qui représente son sens — pas de génération de texte, juste une conversion texte → vecteur.
- **Chunking** : on découpe chaque article en petits morceaux (ici : un paragraphe = un chunk) pour cibler précisément le passage pertinent.
- **Similarité cosinus** : mesure l'angle entre deux vecteurs — 1 = même direction (très proche), 0 = sans rapport. Le AI SDK l'exporte déjà (`cosineSimilarity`), inutile de la réécrire.
- **Indexation vs interrogation** : deux pipelines séparés — `embedMany` vectorise toute la base en une fois (à la demande), `embed` vectorise chaque question à la volée.
- **Même modèle des deux côtés** : l'index et la question doivent être vectorisés avec le même modèle d'embeddings, sinon les vecteurs ne sont pas comparables.

## 📝 Étapes

### Étape 1 — Scorer avec `cosineSimilarity` et garder le top-K

`topK` compare le vecteur de la question à chaque chunk de l'index avec `cosineSimilarity` (fournie par le AI SDK, importée de `"ai"` — pas de formule maison), trie par score décroissant et garde les `k` meilleurs.

```ts
// lib/ai/rag.ts
import { cosineSimilarity, embed, embedMany } from "ai";

export function topK(
  question: number[],
  index: EmbeddedChunk[],
  k: number
): RetrievedChunk[] {
  return index
    .map((chunk) => ({
      reference: chunk.reference,
      titre: chunk.titre,
      contenu: chunk.contenu,
      score: cosineSimilarity(question, chunk.vecteur),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
```

### Étape 2 — Vectoriser tous les chunks en lot (`embedMany`) dans `indexKnowledge`

L'indexation vectorise **tous** les chunks d'un coup. Le titre de l'article est préfixé à chaque paragraphe : il porte du sens que le paragraphe seul n'a pas toujours (ex. « Le remboursement est émis… » → retours).

```ts
// lib/ai/rag.ts — dans indexKnowledge
let embeddings: number[][];
try {
  ({ embeddings } = await embedMany({
    model: resolveEmbeddingModel(),
    values: chunks.map((chunk) => `${chunk.article.titre}\n\n${chunk.contenu}`),
  }));
} catch (error) {
  throw toEmbeddingsError(error);
}

return replaceEmbeddings(
  chunks.map((chunk, i) => ({
    reference: chunk.article.reference,
    titre: chunk.article.titre,
    chunkIndex: chunk.chunkIndex,
    contenu: chunk.contenu,
    vecteur: embeddings[i],
    publie: chunk.article.publie,
  }))
);
```

### Étape 3 — Vectoriser la question (`embed`) dans `retrieve`

À chaque question posée, on la vectorise avec `embed` (le **même** modèle que pour l'index), puis on appelle `topK`.

```ts
// lib/ai/rag.ts — dans retrieve
let embedding: number[];
try {
  ({ embedding } = await embed({
    model: resolveEmbeddingModel(),
    value: question,
  }));
} catch (error) {
  throw toEmbeddingsError(error);
}

try {
  return topK(embedding, index, k);
} catch {
  // `cosineSimilarity` du SDK refuse deux vecteurs de tailles différentes :
  // l'index a été construit avec un autre modèle d'embeddings.
  throw new Error(
    "Dimensions incompatibles : l'index a probablement été construit avec " +
      "un autre modèle d'embeddings. Videz l'index puis réindexez."
  );
}
```

## ✅ Tester

- **Avant de coder** : dans LM Studio, téléchargez le modèle d'embeddings `text-embedding-nomic-embed-text-v1.5`, puis démarrez le serveur local depuis l'onglet **Developer** (port `1234`).
- Ouvrez [http://localhost:3000/08-rag](http://localhost:3000/08-rag).
- Dans le panneau **Indexer la base**, lancez l'indexation.
- Dans le panneau de recherche sans LLM (« Tester la recherche »), essayez *« comment me faire rembourser ? »* : aucun mot ne matche la base mais les bons articles remontent avec leur score, grâce au sens.
- Posez la même question dans le chat de la page : la réponse cite ses sources (ex. `[KB-01]`).

## 🆘 Bloqué ?

- La solution complète est sur la branche `complete` : `git diff main complete -- web/lib/ai/rag.ts` ou ouvrez le fichier sur GitHub.
- Erreurs fréquentes :
  - Erreur de connexion aux embeddings → LM Studio n'est pas lancé, ou le modèle `text-embedding-nomic-embed-text-v1.5` n'est pas chargé sur le port `1234`.
  - « Dimensions incompatibles » → l'index a été construit avec un autre modèle d'embeddings ; videz l'index puis réindexez avec le bon modèle actif.
  - La recherche renvoie `[]` → la base n'a pas encore été indexée : relancez le panneau **Indexer la base**.

## 🚀 Pour aller plus loin (optionnel)

1. Démo « Cassez votre RAG » : activez « inclure les non-publiés » dans le panneau d'indexation, réindexez, puis demandez *« Quel est le délai pour retourner un article ? »* — l'ancienne politique non publiée (KB-20, 14 jours) apparaît dans les Sources aux côtés de la politique actuelle (KB-01, 30 jours). Désactivez le toggle et réindexez pour observer KB-20 disparaître : la qualité d'un RAG dépend d'abord de la qualité de son corpus, avant l'algorithme de recherche.
2. Changez `k` dans `retrieve` (par ex. 2 au lieu de 4) et observez l'effet sur la pertinence et la longueur du contexte injecté.
3. Modifiez le découpage dans `chunkArticle` (par ex. par phrase plutôt que par paragraphe) et regardez comment les scores et les extraits retrouvés changent.
