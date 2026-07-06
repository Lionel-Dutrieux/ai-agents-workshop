import { Terminal } from "lucide-react";
import { ExerciseShell } from "@/components/exercise-shell";
import { FoundryTutorial } from "./tutorial";

const RUN = [
  { prompt: true, text: "az login" },
  { text: "✓ Connecté à Azure (tenant workshop)" },
  { prompt: true, text: "npm start" },
  { text: "" },
  { text: "📋 Avis analysé par l'agent « brewly-review-analyst » :" },
  { text: "" },
  { text: "{" },
  { text: '  "sentiment": "mitige",' },
  {
    text: '  "resume": "Livraison en retard et paquet ouvert, mais service client réactif et geste commercial apprécié.",',
  },
  { text: '  "points_cles": [' },
  { text: '    "Commande #1042 livrée avec 3 jours de retard",' },
  { text: '    "Paquet de Colombie Suprema ouvert à l\'arrivée",' },
  { text: '    "Service client réactif (réponse en 10 min)",' },
  { text: '    "Client prêt à re-commander sous conditions"' },
  { text: "  ]," },
  {
    text: '  "action_suggeree": "Signaler l\'incident d\'emballage à la logistique et confirmer le geste commercial au client.",',
  },
  { text: '  "priorite": "haute"' },
  { text: "}" },
] as const;

export default function Page() {
  return (
    <ExerciseShell
      description="L'agent vit dans le cloud, le code ne fait qu'appeler — démo commentée"
      info={<FoundryTutorial />}
      number="07"
      title="Microsoft Foundry"
    >
      <div className="flex h-full flex-col items-center justify-center gap-4 overflow-y-auto p-4 md:p-6">
        <div className="w-full max-w-2xl overflow-hidden rounded-lg border bg-card shadow-sm">
          <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-2 text-muted-foreground">
            <Terminal className="size-4" />
            <span className="font-mono text-xs">
              foundry — sortie attendue de la démo
            </span>
          </div>
          <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed md:text-sm">
            {RUN.map((line, i) => (
              <div key={i}>
                {"prompt" in line && line.prompt ? (
                  <span className="text-primary">❯ </span>
                ) : null}
                {line.text || " "}
              </div>
            ))}
          </pre>
        </div>
        <p className="max-w-2xl text-center text-muted-foreground text-sm">
          Ce module est une démo : le code complet est dans le dossier{" "}
          <code className="font-mono">foundry/</code> du repo et se lance avec{" "}
          <code className="font-mono">npm start</code>. Suivez le tutoriel à
          gauche pour créer l&apos;agent dans le portail Foundry.
        </p>
      </div>
    </ExerciseShell>
  );
}
