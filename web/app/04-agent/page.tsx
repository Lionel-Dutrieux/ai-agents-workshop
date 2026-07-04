import { Chat } from "@/components/chat";
import { ExerciseShell } from "@/components/exercise-shell";

export default function Page() {
  return (
    <ExerciseShell
      number="04"
      title="Agent multi-étapes"
      description="Un agent autonome qui enchaîne les outils"
    >
      <Chat
        api="/api/04-agent"
        emptyStateTitle="Agent Brewly"
        emptyStateDescription="Confiez-lui une réclamation, il mène l'enquête"
        suggestions={[
          "Ma commande #1087 devait arriver il y a 10 jours, toujours rien !",
        ]}
      />
    </ExerciseShell>
  );
}
