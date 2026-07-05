import { ExerciseShell } from "@/components/exercise-shell";
import { TicketExtractor } from "./ticket-extractor";
import { StructuredOutputTutorial } from "./tutorial";

export default function Page() {
  return (
    <ExerciseShell
      description="Extraire des tickets structurés avec zod"
      info={<StructuredOutputTutorial />}
      number="02"
      title="Structured output"
    >
      <TicketExtractor />
    </ExerciseShell>
  );
}
