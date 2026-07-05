import { Chat } from "@/components/chat";
import { ExerciseShell } from "@/components/exercise-shell";
import { McpTutorial } from "./tutorial";

export default function Page() {
  return (
    <ExerciseShell
      description="Les outils de Brewly, servis par un serveur MCP officiel"
      info={<McpTutorial />}
      number="05"
      title="Serveur MCP"
    >
      <Chat
        api="/api/05-mcp"
        emptyStateDescription="Les mêmes outils qu'au module 3, mais récupérés par le protocole MCP depuis /api/mcp"
        emptyStateTitle="Agent Brewly (via MCP)"
        suggestions={[
          "Où en est ma commande #1042 ?",
          "Quels cafés avez-vous en stock ?",
          "Tous les articles de ma commande #1042 sont-ils en stock ?",
        ]}
      />
    </ExerciseShell>
  );
}
