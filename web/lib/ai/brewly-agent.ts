import "server-only";

import { type LanguageModel, ToolLoopAgent } from "ai";
// Décommentez ces imports à l'Étape 1 (exercices/04-agent.md) :
// import { stepCountIs } from "ai";
// import { brewlyTools } from "@/app/api/03-tools/tools";

/**
 * L'agent Brewly, encapsulé (Module 4).
 *
 * C'est EXACTEMENT la boucle du module 3 (`streamText` + `tools` + `stopWhen`),
 * mais empaquetée dans un `ToolLoopAgent` : on définit le comportement à UN
 * seul endroit, réutilisable partout (une route, un job de fond, un autre
 * agent). On réutilise d'ailleurs les MÊMES outils que le module 3.
 */

export const BREWLY_AGENT_INSTRUCTIONS = `Tu es l'agent du support client de Brewly, une boutique de café en ligne.

Tu disposes d'outils pour consulter les commandes et le catalogue. Ton travail : mener l'enquête de bout en bout en enchaînant les outils autant que nécessaire, sans t'arrêter à la première information.

Méthode :
- Décompose la demande en étapes. Appelle un outil, lis le résultat, puis décide de l'étape suivante.
- Exemple : pour vérifier la disponibilité des articles d'une commande, récupère d'abord la commande (getOrderStatus), PUIS vérifie chaque article dans le catalogue (getProductInfo).
- N'invente jamais une donnée : si tu ne l'as pas, appelle l'outil qui te la donne.

Réponds en français, de façon chaleureuse et concise, une fois toutes les informations réunies.`;

/**
 * Construit l'agent à partir d'un modèle déjà résolu.
 *
 * On passe le modèle en argument (plutôt que d'instancier l'agent au chargement
 * du module) parce que le modèle est choisi dynamiquement par l'utilisateur et
 * résolu depuis la base à chaque requête.
 */
export function createBrewlyAgent(model: LanguageModel): ToolLoopAgent {
  // ⚠️ À VOUS — Étape 1 (exercices/04-agent.md)
  // Renvoyez un `new ToolLoopAgent({ ... })` configuré avec le modèle, les
  // instructions (`BREWLY_AGENT_INSTRUCTIONS`), les outils du module 3
  // (`brewlyTools`, réutilisés tels quels), et un `stopWhen: stepCountIs(N)`
  // pour borner le nombre d'étapes de la boucle.
  void model;
  throw new Error(
    "⚠️ Agent à construire — suivez exercices/04-agent.md (Étape 1)"
  );
}
