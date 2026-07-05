import { Chat } from "@/components/chat";
import { ExerciseShell } from "@/components/exercise-shell";
import { Chat01Tutorial } from "./tutorial";

export default function Page() {
  return (
    <ExerciseShell
      description="Appel du modèle et streaming avec le AI SDK"
      info={<Chat01Tutorial />}
      number="01"
      title="Premier chat"
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
