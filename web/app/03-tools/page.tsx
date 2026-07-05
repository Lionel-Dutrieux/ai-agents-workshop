import { Chat } from "@/components/chat";
import { ExerciseShell } from "@/components/exercise-shell";
import { ToolsTutorial } from "./tutorial";

export default function Page() {
  return (
    <ExerciseShell
      description="Donner des outils au modèle avec le AI SDK"
      info={<ToolsTutorial />}
      number="03"
      title="Tool calling"
    >
      <Chat
        api="/api/03-tools"
        emptyStateDescription="Posez une question qui nécessite de consulter une commande ou le catalogue"
        emptyStateTitle="Brewly Support outillé"
        suggestions={[
          "Où en est ma commande #1042 ?",
          "Parlez-moi du café Éthiopie Sidamo",
          "Quelles machines proposez-vous ?",
        ]}
      />
    </ExerciseShell>
  );
}
