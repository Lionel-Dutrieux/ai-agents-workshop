import { Chat } from "@/components/chat";
import { ExerciseShell } from "@/components/exercise-shell";
import { RagTutorial } from "./tutorial";

export default function Page() {
  return (
    <ExerciseShell
      description="Recherche sémantique maison : embeddings locaux, similarité cosinus, sources citées"
      info={<RagTutorial />}
      number="08"
      title="RAG custom"
    >
      <Chat
        api="/api/08-rag"
        emptyStateDescription="L'assistant répond depuis la base de connaissances Brewly (20 articles) et cite ses sources. Indexez la base depuis le panneau de gauche, puis posez une question."
        emptyStateTitle="Assistant Brewly (RAG)"
        suggestions={[
          "Comment me faire rembourser ?",
          "Mon café est trop amer en V60, un conseil ?",
          "Quel est le délai pour retourner un article ?",
        ]}
      />
    </ExerciseShell>
  );
}
