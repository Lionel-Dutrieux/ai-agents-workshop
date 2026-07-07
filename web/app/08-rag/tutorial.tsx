import {
  Callout,
  DocLink,
  DocLinks,
  Tutorial,
  TutorialCode,
  TutorialHeader,
  TutorialSection,
  TutorialSolution,
  TutorialStep,
  TutorialSteps,
} from "@/components/tutorial";
import { RagIndexPanel } from "./index-panel";

const CHUNK = `// lib/ai/rag.ts — un paragraphe = un chunk (FOURNI)
export function chunkArticle(contenu: string): string[] {
  return contenu
    .split(/\\n\\s*\\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
}
// Nos articles font ~3 paragraphes chacun — assez fin pour cibler le bon
// passage, assez large pour rester compréhensible hors contexte.`;

const EMBED_MANY = `// lib/ai/rag.ts — indexKnowledge : vectoriser tous les chunks en un lot
const chunks = retained.flatMap((article) =>
  chunkArticle(article.contenu).map((contenu, chunkIndex) => ({
    article, contenu, chunkIndex,
  }))
);

// Le titre est préfixé au paragraphe : il porte du sens que le paragraphe
// seul n'a pas toujours (ex. « Le remboursement est émis… » → retours).
const { embeddings } = await embedMany({
  model: resolveEmbeddingModel(),
  values: chunks.map((c) => \`\${c.article.titre}\\n\\n\${c.contenu}\`),
});

return replaceEmbeddings(
  chunks.map((chunk, i) => ({
    reference: chunk.article.reference,
    contenu: chunk.contenu,
    vecteur: embeddings[i],
    // …
  }))
);`;

const COSINE = `// lib/ai/rag.ts — similarité cosinus + top-K
// cos(a, b) = (a · b) / (‖a‖ × ‖b‖) — 1 = même direction, 0 = sans rapport.
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dot / denominator;
}

export function topK(question: number[], index: EmbeddedChunk[], k: number) {
  return index
    .map((chunk) => ({ ...chunk, score: cosineSimilarity(question, chunk.vecteur) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}`;

const RETRIEVE = `// lib/ai/rag.ts — retrieve : vectoriser la question et récupérer le top-K
export async function retrieve(question: string, k = 4) {
  const index = await listEmbeddings();
  if (index.length === 0) return [];

  // MÊME modèle que pour l'indexation — sinon les vecteurs ne sont pas
  // comparables (dimensions différentes, espace sémantique différent).
  const { embedding } = await embed({
    model: resolveEmbeddingModel(),
    value: question,
  });

  return topK(embedding, index, k);
}`;

const INJECT = `// app/api/08-rag/route.ts — injecter le contexte et citer les sources
function buildInstructions(extraits) {
  const contexte = extraits
    .map((e) => \`[\${e.reference}] \${e.titre}\\n\${e.contenu}\`)
    .join("\\n\\n---\\n\\n");

  return \`Tu es l'assistant du support client de Brewly, une boutique \\
de café en ligne. Réponds en français, ton chaleureux et concis.

Réponds UNIQUEMENT à partir des extraits de la base de connaissances \\
ci-dessous. Cite les références entre crochets (ex. [KB-01]) à l'appui de \\
chaque affirmation. Si les extraits ne permettent pas de répondre, dis-le \\
honnêtement et propose de contacter le support — n'invente jamais une \\
politique.

Extraits :

\${contexte}\`;
}

// Les sources partent au client AVANT la réponse, en data part custom :
writer.write({
  type: "data-rag-sources",
  id: "rag-sources",
  data: sources.map(({ reference, titre, score }) => ({ reference, titre, score })),
});`;

const FULL_SOLUTION = `import "server-only";

import { embed, embedMany } from "ai";
import {
  type EmbeddedChunk,
  listEmbeddings,
  replaceEmbeddings,
} from "@/lib/dal/brewly-embeddings";
import { listKnowledge } from "@/lib/dal/brewly-knowledge";
import { resolveEmbeddingModel, toEmbeddingsError } from "./embeddings";

export type RetrievedChunk = {
  reference: string;
  titre: string;
  contenu: string;
  score: number;
};

/** Découpe un article en chunks : un paragraphe = un chunk. */
export function chunkArticle(contenu: string): string[] {
  return contenu
    .split(/\\n\\s*\\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
}

/** Similarité cosinus entre deux vecteurs. */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(
      "Dimensions incompatibles : l'index a probablement été construit avec " +
        "un autre modèle d'embeddings. Videz l'index puis réindexez."
    );
  }
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dot / denominator;
}

/** Score chaque chunk de l'index contre le vecteur de la question, trie et garde les k meilleurs. */
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

/** Indexe la base de connaissances : chunking + embeddings + stockage. */
export async function indexKnowledge(
  options: { includeUnpublished?: boolean } = {}
): Promise<number> {
  const articles = await listKnowledge();
  const retained = options.includeUnpublished
    ? articles
    : articles.filter((article) => article.publie);

  const chunks = retained.flatMap((article) =>
    chunkArticle(article.contenu).map((contenu, chunkIndex) => ({
      article,
      contenu,
      chunkIndex,
    }))
  );

  let embeddings: number[][];
  try {
    ({ embeddings } = await embedMany({
      model: resolveEmbeddingModel(),
      values: chunks.map((chunk) => \`\${chunk.article.titre}\\n\\n\${chunk.contenu}\`),
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
}

/** Recherche sémantique : vectorise la question et renvoie les k chunks les plus proches. */
export async function retrieve(
  question: string,
  k = 4
): Promise<RetrievedChunk[]> {
  const index = await listEmbeddings();
  if (index.length === 0) {
    return [];
  }

  let embedding: number[];
  try {
    ({ embedding } = await embed({
      model: resolveEmbeddingModel(),
      value: question,
    }));
  } catch (error) {
    throw toEmbeddingsError(error);
  }

  return topK(embedding, index, k);
}`;

/** Énoncé du Module 8 — RAG custom. */
export function RagTutorial() {
  return (
    <Tutorial>
      <TutorialHeader
        eyebrow="Module 08 · Brewly"
        objective="Construire une recherche sémantique de A à Z — chunking, embeddings locaux (LM Studio), similarité cosinus, injection du contexte — pour que l'assistant réponde depuis la base de connaissances Brewly en citant ses sources."
        title="RAG custom"
      />

      <Callout title="Objectif" variant="objective">
        La recherche naïve par mots-clés (<code>searchKnowledge</code>) ne
        trouve rien pour <em>« je veux renvoyer ma machine »</em> alors que la
        politique de retours existe bel et bien dans la base — parce
        qu&apos;aucun mot ne correspond littéralement. La recherche{" "}
        <strong>sémantique</strong> compare le <strong>sens</strong>, pas les
        mots : c&apos;est ce que vous allez construire.
      </Callout>

      <Callout title="LM Studio" variant="note">
        Avant de commencer, préparez LM Studio : téléchargez le modèle
        d&apos;embeddings <code>text-embedding-nomic-embed-text-v1.5</code>,
        puis dans l&apos;onglet <strong>Developer</strong>, démarrez le
        serveur local (port <code>1234</code>). Un modèle d&apos;embeddings ne
        génère <strong>pas</strong> de texte : il transforme un texte en{" "}
        <strong>vecteur</strong> (~768 nombres) qui représente son sens.
      </Callout>

      <TutorialSection title="Indexer la base">
        <p>
          Avant de pouvoir interroger la base, il faut l&apos;indexer :
          chunking, vectorisation, stockage. Lancez l&apos;indexation
          ci-dessous — vous y reviendrez plus tard pour la démo{" "}
          « Cassez votre RAG ».
        </p>
        <div className="rounded-lg border bg-card/40 p-3">
          <RagIndexPanel />
        </div>
      </TutorialSection>

      <TutorialSteps>
        <TutorialStep title="Chunker les articles">
          <p>
            Un article est découpé en <strong>chunks</strong> : un paragraphe
            = un chunk. Le paragraphe est la bonne granularité ici — assez fin
            pour cibler le passage pertinent, assez large pour rester
            compréhensible hors contexte. Cette fonction est{" "}
            <strong>fournie</strong>.
          </p>
          <TutorialCode code={CHUNK} filename="lib/ai/rag.ts" language="ts" />
        </TutorialStep>

        <TutorialStep title="Vectoriser en lot (embedMany)">
          <p>
            L&apos;indexation vectorise <strong>tous</strong> les chunks d&apos;un
            coup avec <code>embedMany</code>. Le titre de l&apos;article est
            préfixé à chaque chunk : il porte du sens que le paragraphe seul
            n&apos;a pas toujours. C&apos;est un pipeline{" "}
            <strong>séparé</strong> de l&apos;interrogation — déclenché par le
            bouton du panneau ci-dessus, pas à chaque question.
          </p>
          <TutorialCode code={EMBED_MANY} filename="lib/ai/rag.ts" language="ts" />
        </TutorialStep>

        <TutorialStep title="Écrire la similarité cosinus">
          <p>
            Le AI SDK exporte d&apos;ailleurs son propre{" "}
            <code>cosineSimilarity</code> — l&apos;écrire une fois soi-même est
            l&apos;exercice, pour comprendre ce que « proche sémantiquement »
            veut vraiment dire : l&apos;angle entre deux vecteurs. <code>topK</code>{" "}
            trie ensuite tous les chunks de l&apos;index par score décroissant
            et garde les meilleurs.
          </p>
          <TutorialCode code={COSINE} filename="lib/ai/rag.ts" language="ts" />
        </TutorialStep>

        <TutorialStep title="Vectoriser la question (embed) et récupérer le top-K">
          <p>
            À chaque question, on la vectorise avec <code>embed</code> puis on
            appelle <code>topK</code>. Règle d&apos;or :{" "}
            <strong>le même modèle</strong> doit servir à l&apos;index et à la
            question — sinon les vecteurs ne vivent pas dans le même espace et
            la comparaison n&apos;a plus de sens (et lève même une erreur si
            les dimensions diffèrent).
          </p>
          <TutorialCode code={RETRIEVE} filename="lib/ai/rag.ts" language="ts" />
        </TutorialStep>

        <TutorialStep title="Injecter le contexte et citer les sources">
          <p>
            Les extraits retrouvés sont injectés dans le system prompt, avec
            une consigne anti-hallucination stricte : répondre{" "}
            <strong>uniquement</strong> depuis les extraits, citer les
            références. Les sources partent aussi vers le client via le data
            part custom <code>data-rag-sources</code>, pour être affichées
            sous la réponse.
          </p>
          <TutorialCode code={INJECT} filename="app/api/08-rag/route.ts" language="ts" />
        </TutorialStep>
      </TutorialSteps>

      <Callout title="Cassez votre RAG" variant="warning">
        Activez « inclure les non-publiés » dans le panneau, réindexez, puis
        demandez <em>« Quel est le délai pour retourner un article ? »</em> :
        l&apos;assistant cite [KB-20] et répond <strong>14 jours</strong> — un
        article obsolète, non publié, mais désormais dans l&apos;index. Fix :
        désactivez le toggle, réindexez → réponse correcte,{" "}
        <strong>30 jours</strong> [KB-01]. Leçon : la qualité d&apos;un RAG,
        c&apos;est d&apos;abord la qualité de son <strong>corpus</strong>{" "}
        (filtrage, fraîcheur) — bien avant l&apos;algorithme de recherche.
      </Callout>

      <Callout title="Périmètre du corpus" variant="warning">
        KB-19 (une note interne sur les plafonds de gestes commerciaux) est{" "}
        <strong>publiée</strong> dans la base ET indexée. Demandez{" "}
        <em>« quel bon d&apos;achat pouvez-vous m&apos;offrir pour mon
        retard ? »</em> : l&apos;assistant peut divulguer ces plafonds
        internes. Un RAG expose <strong>tout</strong> ce qu&apos;on lui donne
        à indexer : le contrôle d&apos;accès se fait à{" "}
        <strong>l&apos;indexation</strong> (périmètre du corpus) ou à{" "}
        <strong>la récupération</strong> (filtres), jamais en espérant que le
        modèle « devine » ce qui est confidentiel.
      </Callout>

      <Callout title="Et en production ?" variant="note">
        Ici : SQLite + cosinus en TypeScript sur ~60 vecteurs — parfait pour{" "}
        <strong>comprendre</strong> chaque étape. À l&apos;échelle, on prend
        une <strong>base vectorielle</strong> (pgvector sur PostgreSQL, Azure
        AI Search, Pinecone…) qui gère la recherche approximative (ANN), les
        filtres et la scalabilité. Le pipeline reste{" "}
        <strong>conceptuellement identique</strong>.
      </Callout>

      <TutorialSolution>
        <TutorialCode code={FULL_SOLUTION} filename="lib/ai/rag.ts" language="ts" />
      </TutorialSolution>

      <DocLinks>
        <li>
          <DocLink href="https://ai-sdk.dev/docs/ai-sdk-core/embeddings">
            Embeddings — AI SDK
          </DocLink>
        </li>
        <li>
          <DocLink href="https://ai-sdk.dev/docs/ai-sdk-ui/streaming-data">
            Streaming custom data — AI SDK
          </DocLink>
        </li>
        <li>
          <DocLink href="https://lmstudio.ai/docs/app/api/endpoints/openai">
            LM Studio — endpoint OpenAI-compatible
          </DocLink>
        </li>
      </DocLinks>
    </Tutorial>
  );
}
