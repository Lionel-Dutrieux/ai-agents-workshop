import { Terminal } from "lucide-react";
import { ExerciseShell } from "@/components/exercise-shell";
import { DevAvecIaTutorial } from "./tutorial";

const SESSION = [
  { prompt: true, text: "claude" },
  { text: "" },
  { text: "> Je veux une page /sommelier : « le Sommelier Brewly »…" },
  { text: "  Présente-moi d'abord ton plan. N'écris aucun code avant" },
  { text: "  ma validation." },
  { text: "" },
  { text: "⏸ plan mode — lecture seule, aucun fichier modifié" },
  { text: "" },
  { text: "  Plan proposé :" },
  { text: "  1. app/sommelier/page.tsx — monte le <Chat/> existant," },
  { text: "     avec 3 suggestions cliquables pour tester en un clic" },
  { text: "  2. app/api/sommelier/route.ts — calque le module 04," },
  { text: "     brewlyTools réutilisés tels quels, instructions" },
  { text: "     « sommelier » (la seule nouveauté)" },
  { text: "" },
  { text: "> Validé. Vas-y." },
  { text: "" },
  { text: "✓ 2 fichiers créés — relecture du diff avant d'accepter :" },
  { text: "  git diff  →  on lit TOUT. On n'accepte pas le code" },
  { text: "  que l'on ne comprend pas." },
] as const;

export default function Page() {
  return (
    <ExerciseShell
      description="Utiliser un agent de code pour développer — démo commentée + fiche take-home"
      info={<DevAvecIaTutorial />}
      number="00"
      title="Développer avec l'IA"
    >
      <div className="flex h-full flex-col items-center justify-center gap-4 overflow-y-auto p-4 md:p-6">
        <div className="w-full max-w-2xl overflow-hidden rounded-lg border bg-card shadow-sm">
          <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-2 text-muted-foreground">
            <Terminal className="size-4" />
            <span className="font-mono text-xs">
              le rituel de la démo — plan → validation → diff → revue
            </span>
          </div>
          <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed md:text-sm">
            {SESSION.map((line, i) => (
              <div key={i}>
                {"prompt" in line && line.prompt ? (
                  <span className="text-primary">❯ </span>
                ) : null}
                {line.text || " "}
              </div>
            ))}
          </pre>
        </div>
        <p className="max-w-2xl text-center text-muted-foreground text-sm">
          Ce module est une démo + une fiche : rien à coder pendant la séance.
          Les deux prompts complets et toutes les pratiques (skills, MCP, plan
          mode, revue) sont dans le tutoriel à gauche et dans{" "}
          <code className="font-mono">exercices/00-dev-avec-ia.md</code>.
        </p>
      </div>
    </ExerciseShell>
  );
}
