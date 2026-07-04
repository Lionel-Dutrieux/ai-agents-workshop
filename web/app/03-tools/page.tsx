import { Chat } from "@/components/chat";
import { ExerciseShell } from "@/components/exercise-shell";

export default function Page() {
  return (
    <ExerciseShell
      number="03"
      title="Tool calling"
      description="Le modèle interroge les données de la boutique"
    >
      <Chat
        api="/api/03-tools"
        emptyStateTitle="Brewly Support"
        emptyStateDescription="L'assistant a maintenant accès aux commandes et au catalogue"
        suggestions={[
          "Où en est ma commande #1042 ?",
          "Avez-vous la machine Lelit Bianca en stock ?",
        ]}
      />
    </ExerciseShell>
  );
}
