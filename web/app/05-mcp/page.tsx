import { Chat } from "@/components/chat";
import { ExerciseShell } from "@/components/exercise-shell";

export default function Page() {
  return (
    <ExerciseShell
      number="05"
      title="Serveur MCP"
      description="Les capacités de la boutique via le Model Context Protocol"
    >
      <Chat
        api="/api/05-mcp"
        emptyStateTitle="Agent Brewly (via MCP)"
        emptyStateDescription="Les mêmes outils, servis par un serveur MCP externe"
        suggestions={["Fais un état des commandes bloquées"]}
      />
    </ExerciseShell>
  );
}
