import { Chat } from "@/components/chat";
import { ExerciseShell } from "@/components/exercise-shell";

export default function Page() {
  return (
    <ExerciseShell
      number="02"
      title="Structured output"
      description="Extraire des tickets structurés avec zod"
    >
      <Chat
        api="/api/02-structured-output"
        emptyStateTitle="Boîte mail du support"
        emptyStateDescription="Collez un email client pour en extraire un ticket structuré"
        placeholder="Collez un email client…"
      />
    </ExerciseShell>
  );
}
