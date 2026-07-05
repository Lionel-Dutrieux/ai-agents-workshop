import { Chat } from "@/components/chat";
import { ExerciseShell } from "@/components/exercise-shell";
import { AgentTutorial } from "./tutorial";

export default function Page() {
  return (
    <ExerciseShell
      description="Un agent autonome qui enchaîne plusieurs outils"
      info={<AgentTutorial />}
      number="04"
      title="Agent multi-étapes"
    >
      <Chat
        api="/api/04-agent"
        emptyStateDescription="Confiez-lui une tâche qui demande plusieurs recherches : il enchaîne les outils tout seul"
        emptyStateTitle="Agent Brewly"
        suggestions={[
          "Tous les articles de ma commande #1042 sont-ils en stock ?",
          "Recommande-moi un café en stock moins cher que celui de ma commande #1091",
        ]}
      />
    </ExerciseShell>
  );
}
