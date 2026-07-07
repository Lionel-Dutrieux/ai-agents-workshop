# Module 01 — Premier chat

> **Durée** : ~25 min · **Fichier à modifier** : `web/app/api/01-chat/route.ts` · **Niveau** : découverte

## 🎯 Objectif

Implémenter la route `/api/01-chat` qui appelle un modèle de langage et diffuse
sa réponse en streaming vers l'interface de chat (déjà fournie). C'est le
cycle de base que tous les modules suivants vont enrichir : requête → LLM →
streaming → UI.

## 💡 Les concepts en bref

- **`streamText`** : la fonction du AI SDK qui envoie les messages au modèle et
  récupère la réponse au fur et à mesure qu'elle est générée (token par
  token), plutôt que d'attendre la réponse complète.
- **System prompt (`instructions`)** : les consignes données au modèle avant
  la conversation — son rôle, son ton, ses limites. C'est ce qui transforme un
  LLM générique en « assistant Brewly ».
- **`resolveLanguageModel(model)`** : fonction déjà fournie qui instancie le
  bon modèle (LM Studio, Ollama, Azure…) à partir de l'id choisi dans l'UI.
- **Streaming vers l'UI** : le flux de tokens doit être converti au format
  attendu par le composant `<Chat/>` (`UIMessage`) avant d'être renvoyé au
  navigateur.
- **Pas encore d'agent** : ici le modèle répond seulement — il ne peut ni
  agir, ni appeler d'outils. Ça viendra aux modules 3 et 4.

## 📝 Étapes

Chaque étape correspond à un `⚠️ À VOUS` dans `web/app/api/01-chat/route.ts`
sur la branche `main`.

### Étape 1 — Résoudre le modèle

Le frontend envoie l'id du modèle sélectionné dans l'UI (« Modèles »). Il faut
le transformer en instance de modèle utilisable par le AI SDK.

```ts
// Résout le modèle (LM Studio, Ollama, Azure…) depuis la base.
const languageModel = await resolveLanguageModel(model);
```

### Étape 2 — Appeler le modèle avec `streamText`

On passe au modèle le system prompt (`instructions`) et l'historique de la
conversation, converti au format attendu par le AI SDK.

```ts
const result = streamText({
  model: languageModel,
  // AI SDK 7 : `instructions` remplace `system` (déprécié).
  instructions: BREWLY_SYSTEM_PROMPT,
  messages: await convertToModelMessages(messages),
});
```

### Étape 3 — Renvoyer la réponse en streaming à l'UI

Le flux brut du modèle doit être converti au format `UIMessage` attendu par le
composant `<Chat/>`. On en profite pour joindre l'usage de tokens (jauge de
contexte) et l'id du modèle utilisé.

```ts
// Diffuse la réponse au format UIMessage, en joignant l'usage de tokens
// (pour la jauge de contexte) et l'id du modèle à la fin.
return createUIMessageStreamResponse({
  stream: toUIMessageStream({
    stream: result.stream,
    messageMetadata: ({ part }) => {
      if (part.type === "finish") {
        return { usage: part.totalUsage, modelId: model };
      }
    },
  }),
});
```

## ✅ Tester

- Ouvrez [http://localhost:3000/01-chat](http://localhost:3000/01-chat).
- Ajoutez un modèle local via le bouton **« Modèles »** (LM Studio par défaut :
  `http://localhost:1234/v1`).
- Posez une question dans le chat, par exemple : « Quels cafés conseillez-vous
  pour un espresso corsé ? » — la réponse doit apparaître progressivement
  (streaming), dans le ton chaleureux défini par le system prompt.
- Essayez « où en est ma commande #1042 ? » : le modèle doit honnêtement dire
  qu'il ne peut pas consulter les commandes (c'est la limite voulue de ce
  module — les outils arrivent au module 3).

## 🆘 Bloqué ?

- La solution complète est sur la branche `complete` : `git diff main complete -- web/app/api/01-chat/route.ts` ou ouvrez le fichier sur GitHub.
- Erreurs fréquentes :
  - Pas de réponse / erreur réseau → vérifiez que LM Studio (ou votre provider)
    est bien lancé et qu'un modèle y est chargé.
  - « Modèle non configuré » → sélectionnez un modèle dans le panneau
    « Modèles » avant d'envoyer un message.

## 🚀 Pour aller plus loin (optionnel)

1. Modifiez `BREWLY_SYSTEM_PROMPT` pour changer le ton de l'assistant (plus
   formel, plus court, dans une autre langue…) et observez l'effet.
2. Essayez avec un autre modèle (si vous en avez plusieurs chargés dans LM
   Studio) et comparez le style des réponses.
