import { Chat } from "@/components/chat";
import { ExerciseShell } from "@/components/exercise-shell";

export default function Page() {
  return (
    <ExerciseShell
      number="01"
      title="Premier chat"
      description="Appel du modèle et streaming avec le AI SDK"
    >
      <Chat
        api="/api/01-chat"
        emptyStateTitle="Brewly Support"
        emptyStateDescription="Posez une question à l'assistant de la boutique"
        suggestions={[
          "Quels cafés conseillez-vous pour un espresso corsé ?",
          "Quels sont vos délais de livraison ?",
        ]}
      />
    </ExerciseShell>
  );
}
