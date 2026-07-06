/**
 * Démo Module 07 — invoquer un agent Microsoft Foundry existant.
 *
 * L'agent `brewly-review-analyst` vit dans le cloud : ses instructions,
 * son modèle, ses guardrails et ses métriques sont gérés dans le portail
 * Foundry (voir agent-instructions.md). Ici, on ne fait que l'appeler
 * avec une tâche synchrone : analyser un avis client.
 *
 * Prérequis : `az login`, puis `npm start` (lit .env).
 */
import { AIProjectClient } from "@azure/ai-projects";
import { DefaultAzureCredential } from "@azure/identity";

const endpoint = process.env.PROJECT_ENDPOINT;
const agentName = process.env.AGENT_NAME ?? "brewly-review-analyst";

if (!endpoint) {
  console.error(
    [
      "❌ PROJECT_ENDPOINT manquant.",
      "   Copiez .env.example vers .env et renseignez l'endpoint du projet,",
      '   format : "https://<ressource>.services.ai.azure.com/api/projects/<projet>"',
      "   (visible sur l'écran d'accueil de votre projet Foundry).",
    ].join("\n"),
  );
  process.exit(1);
}

// L'avis client à analyser — la « tâche » confiée à l'agent.
const review = `
Commande #1042 reçue avec 3 jours de retard, et le paquet de Colombie
Suprema était ouvert à l'arrivée. Franchement déçu pour un café à ce
prix. Par contre le service client a répondu en 10 minutes et m'a
proposé un geste, c'est apprécié. Je re-commanderai peut-être, mais
soignez l'emballage.
`.trim();

// 1. Client du projet Foundry (auth Azure : az login / identité managée).
const project = new AIProjectClient(endpoint, new DefaultAzureCredential());
const openai = project.getOpenAIClient();

// 2. Un seul appel, synchrone : pas de thread, pas de boucle, pas de stream.
//    `agent_reference` pointe vers l'agent défini dans le portail — le
//    modèle et les instructions viennent de là-bas, pas d'ici.
try {
  const response = await openai.responses.create(
    { input: review },
    { body: { agent_reference: { name: agentName, type: "agent_reference" } } },
  );

  console.log(`📋 Avis analysé par l'agent « ${agentName} » :\n`);
  console.log(response.output_text);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(
    [
      `❌ L'appel à l'agent « ${agentName} » a échoué : ${message}`,
      "   Vérifiez que :",
      "   - vous êtes connecté : az login",
      "   - l'agent existe dans le portail Foundry (voir agent-instructions.md)",
      "   - PROJECT_ENDPOINT pointe bien vers le bon projet.",
    ].join("\n"),
  );
  process.exit(1);
}
