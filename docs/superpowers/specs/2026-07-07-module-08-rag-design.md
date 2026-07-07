# Module 08 — RAG custom (AI SDK + LM Studio) — Design

**Date** : 2026-07-07 · **Statut** : validé

## Objectif pédagogique

Construire un RAG **entièrement visible** : chaque étape (chunking, embeddings,
similarité, injection du contexte) est du code lisible que les participants
écrivent ou parcourent. Contraste avec la recherche naïve par mots-clés
(`searchKnowledge`, module sandbox) : « je veux renvoyer ma machine » ne matche
pas « retours » — la recherche sémantique, si.

## Décisions

- **Forme** : pipeline RAG classique dans une route API (retrieve → contexte →
  `streamText`), pas un tool d'agent. Le passage en tool est mentionné en
  ouverture (déjà couvert par les modules 03/04).
- **Embeddings** : LM Studio en local, modèle d'embeddings **fixé par `.env`**
  (`EMBEDDINGS_BASE_URL`, `EMBEDDINGS_MODEL_ID` — ex.
  `text-embedding-nomic-embed-text-v1.5`), instancié via
  `createOpenAICompatible(...).textEmbeddingModel(...)`. Pas de sélecteur :
  question et documents doivent être vectorisés par le **même** modèle
  (encart tutoriel dédié).
- **Stockage** : table Prisma `BrewlyEmbedding` (SQLite), vecteur sérialisé en
  JSON, similarité cosinus calculée en TypeScript sur ~60 vecteurs. Encart
  tutoriel : en production on prend une base vectorielle (pgvector/PostgreSQL,
  etc.) ; ici on ne complexifie pas — l'échelle le permet et le mécanisme
  reste visible.
- **Chunking** : par paragraphe (split sur `\n\n`), ~3 chunks par article,
  ~60 chunks au total.
- **Parties à écrire par les participants** (starter) : les appels
  `embed`/`embedMany` du AI SDK et la sélection top-K, en utilisant le
  helper `cosineSimilarity` exporté par le SDK (décision révisée : on ne
  réécrit pas la formule, on explique ce qu'elle mesure). Le chunking et
  l'injection du contexte sont fournis.
- **Recherche à nu** (ajout) : un mini moteur de recherche vectoriel dans le
  panneau du module (`/api/08-rag/search`, sans LLM) montre le retrieval
  seul — requête → embed → cosinus → 1 à 3 articles avec score et extrait.
- **Démo « échec puis fix »** : l'indexation propose une option « inclure les
  non-publiés ». Index naïf → « quel est le délai de retour ? » → KB-20
  (14 jours) fuit dans les sources aux côtés de KB-01 ; selon le modèle, la
  réponse devient fausse ou hésite. (Constaté en vérif : un modèle attentif
  peut trancher pour KB-01, car KB-20 s'auto-déclare archivé — le signal
  garanti de la démo est la fuite dans les sources.) Fix : réindexer en
  filtrant `publie: true` → 30 jours (KB-01), KB-20 disparaît. KB-19 (note
  interne) traité en encart tutoriel (périmètre/confidentialité du corpus),
  sans exercice dédié.
- **Indexation** : déclenchée depuis l'UI du module (panneau Index), pas de
  script CLI. Réindexer = vider puis réinsérer (idempotent, même pattern que
  le seed).

## Composants

1. **`web/lib/ai/embeddings.ts`** : provider embeddings LM Studio (env),
   erreur guidée si variables manquantes.
2. **`web/lib/ai/rag.ts`** : `chunkArticle()` (fourni), `cosineSimilarity()`
   + top-K (⚠️ Atelier), `indexKnowledge({ includeUnpublished })` avec
   `embedMany` (⚠️ Atelier), `retrieve(question, k)` avec `embed`
   (⚠️ Atelier).
3. **`web/lib/dal/brewly-embeddings.ts`** + migration Prisma : table
   `BrewlyEmbedding` (référence article, titre, index de chunk, contenu,
   vecteur JSON) ; reset/insertion/liste/stats.
4. **`web/app/api/08-rag/index/route.ts`** : POST (indexe, option
   `includeUnpublished`), DELETE (vide), GET (stats : nombre de chunks,
   présence de non-publiés).
5. **`web/app/api/08-rag/route.ts`** : retrieve → system prompt avec extraits
   + consigne de citer les références (KB-xx) → `streamText`. Les extraits
   récupérés (référence, titre, score) partent au client en **data part**
   pour l'encart « Sources » (extension du composant Chat si nécessaire).
6. **`web/app/08-rag/page.tsx` + `tutorial.tsx`** : `ExerciseShell` + Chat +
   **panneau Index** (bouton « Indexer la base », toggle « inclure les
   non-publiés », compteur de chunks, bouton « Vider l'index »).
7. **`web/app/page.tsx`** : carte du module 08.
8. **`docs/04-modules.md`** : section Module 8.

## Erreurs et cas limites

- LM Studio éteint / modèle d'embed non chargé → message clair dans l'UI
  (« Vérifiez que LM Studio tourne et que le modèle d'embeddings est
  chargé »).
- Question avec index vide → réponse guidée « Indexez d'abord la base ».
- Dimension de vecteur incohérente (index construit avec un autre modèle) →
  erreur explicite au retrieve, invitation à réindexer.

## Test

Vérification manuelle de bout en bout avec LM Studio (modèle d'embeddings
chargé) : indexation, question sémantique sans mot-clé exact, démo
échec/fix KB-20, affichage des sources. Lint/build du site Next.js.
