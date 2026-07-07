# Module 04 — Agent multi-étapes

> **Durée** : ~30 min · **Fichier à modifier** : `web/lib/ai/brewly-agent.ts`, `web/app/api/04-agent/route.ts` · **Niveau** : intermédiaire+

## 🎯 Objectif

Au module 3, le modèle appelait des outils dans une boucle écrite à la main. Ici, on empaquette cette boucle dans un `ToolLoopAgent` : un objet réutilisable qui sait, tout seul, enchaîner plusieurs outils jusqu'à avoir assez d'informations pour répondre. On lui confie ensuite une tâche composée pour observer sa trajectoire.

## 💡 Les concepts en bref

- **`ToolLoopAgent`** : un `streamText` + `tools` + `stopWhen` rangés dans un objet unique, réutilisable partout (route, job de fond, autre agent).
- **`stopWhen`** : le garde-fou de la boucle — sans lui, l'agent pourrait enchaîner les appels d'outils indéfiniment.
- **`agent.stream()`** : s'utilise exactement comme `streamText()` — même flux, même façon de le renvoyer au client.
- **Observabilité de la boucle** : `onStepEnd` trace chaque étape côté serveur ; côté UI, chaque appel d'outil s'affiche déjà dans le chat, c'est la trajectoire de l'agent rendue visible.

## 📝 Étapes

### Étape 1 — Construire l'agent

Dans `lib/ai/brewly-agent.ts`, la fabrique `createBrewlyAgent` doit renvoyer un `ToolLoopAgent` configuré avec le modèle, les instructions, les outils du module 3 (réutilisés tels quels), et un `stopWhen` qui borne le nombre d'étapes.

```ts
// web/lib/ai/brewly-agent.ts
import { type LanguageModel, stepCountIs, ToolLoopAgent } from "ai";
import { brewlyTools } from "@/app/api/03-tools/tools";

export function createBrewlyAgent(model: LanguageModel) {
  return new ToolLoopAgent({
    model,
    instructions: BREWLY_AGENT_INSTRUCTIONS,
    tools: brewlyTools,
    // Garde-fou : jusqu'à 8 étapes pour laisser l'agent enchaîner plusieurs
    // outils sur une tâche composée, sans risque de boucle infinie.
    stopWhen: stepCountIs(8),
  });
}
```

### Étape 2 — Appeler l'agent dans la route

Dans `app/api/04-agent/route.ts`, la route construit l'agent avec le modèle résolu, puis appelle `agent.stream()`. Le retour se manipule exactement comme au module 3 (`toUIMessageStream` + `createUIMessageStreamResponse`).

```ts
// web/app/api/04-agent/route.ts
const languageModel = await resolveLanguageModel(model);

const agent = createBrewlyAgent(languageModel);

const result = await agent.stream({
  messages: await convertToModelMessages(messages),
  // Observabilité de la boucle : on trace chaque étape côté serveur.
  // (Côté UI, chaque appel d'outil s'affiche déjà dans le chat : c'est la
  // trajectoire de l'agent, rendue visible.)
  onStepEnd: ({ toolCalls }) => {
    const called = toolCalls?.map((call) => call.toolName).join(", ");
    if (called) {
      console.log(`[agent] outils appelés : ${called}`);
    }
  },
});

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

- Ouvrez [http://localhost:3000/04-agent](http://localhost:3000/04-agent).
- Demandez : « Tous les articles de ma commande #1042 sont-ils en stock ? »
- Vous devriez voir **plusieurs** encarts d'outils s'enchaîner (`getOrderStatus` puis `getProductInfo` pour chaque article) avant la réponse finale — dépliez-les pour suivre le raisonnement.
- Dans le panneau sandbox de la page, passez le *Moulin* ou le *Colombie Supremo* de la commande #1042 en « Épuisé », puis reposez la question : l'agent refait son enquête et la réponse change, en direct.
- Regardez les logs du serveur (`console.log`) : chaque étape de la boucle y est tracée.

## 🆘 Bloqué ?

- La solution complète est sur la branche `complete` : `git diff main complete -- web/lib/ai/brewly-agent.ts web/app/api/04-agent/route.ts` ou ouvrez les fichiers sur GitHub.
- Erreurs fréquentes :
  - L'agent s'arrête après un seul outil (ne vérifie qu'un article) → vérifiez que `stopWhen` autorise bien plusieurs étapes (`stepCountIs(8)`, pas `stepCountIs(1)`).
  - Rien ne se passe / erreur 501 → `createBrewlyAgent` n'est pas encore implémenté, ou la route n'appelle pas `agent.stream()`.
  - Avec un petit modèle local, l'agent peut s'arrêter trop tôt ou boucler sans conclure : privilégiez un modèle « instruct » récent à l'aise avec le function calling.

## 🚀 Pour aller plus loin (optionnel)

1. Réduisez `stepCountIs(8)` à `stepCountIs(1)` et observez l'agent s'arrêter après un seul outil, même sur une question composée.
2. Remplacez `stepCountIs(8)` par `hasToolCall("getOrderStatus")` pour stopper la boucle dès que cet outil précis est appelé.
3. Modifiez `BREWLY_AGENT_INSTRUCTIONS` pour changer la méthode d'enquête de l'agent et observez l'effet sur sa trajectoire.
