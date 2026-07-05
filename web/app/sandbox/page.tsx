import { ArrowLeft, Database } from "lucide-react";
import Link from "next/link";
import { DemoDataCard } from "@/components/demo-data";
import {
  BrewlyCatalogManager,
  BrewlyOrdersManager,
  SandboxItemManager,
} from "@/components/sandbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { countOrders } from "@/lib/dal/brewly-orders";
import { countProducts } from "@/lib/dal/brewly-catalog";
import { countConversations } from "@/lib/dal/conversations";
import { listManagedMcpServers } from "@/lib/dal/mcp-servers";
import { listManagedModels } from "@/lib/dal/models";
import { countSandboxItems } from "@/lib/dal/sandbox-items";

/**
 * Page « Sandbox » — vue complète des données du workshop.
 *
 * Server Component : lit les données côté serveur (comptes + config en lecture
 * seule) et compose les managers CRUD (client). Un seul endroit pour voir et
 * modifier toutes les données de démo qui alimentent les agents.
 */
export default async function SandboxPage() {
  const [products, orders, sandboxItems, conversations, models, mcpServers] =
    await Promise.all([
      countProducts(),
      countOrders(),
      countSandboxItems(),
      countConversations(),
      listManagedModels(),
      listManagedMcpServers(),
    ]);

  const stats = [
    { label: "Produits", value: products },
    { label: "Commandes", value: orders },
    { label: "Sandbox items", value: sandboxItems },
    { label: "Conversations", value: conversations },
    { label: "Modèles LLM", value: models.length },
    { label: "Serveurs MCP", value: mcpServers.length },
  ];

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <header className="flex flex-col gap-4">
        <Link
          className="flex w-fit items-center gap-1.5 text-muted-foreground text-sm hover:text-foreground"
          href="/"
        >
          <ArrowLeft className="size-4" />
          Retour à l’accueil
        </Link>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Database className="size-5" />
          <span className="font-mono text-sm uppercase tracking-widest">
            Sandbox · données du workshop
          </span>
        </div>
        <h1 className="font-semibold text-4xl tracking-tight">
          Toutes les données, au même endroit
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          La vue complète des données qui alimentent les agents Brewly.
          Modifiez le catalogue ou les commandes ici : les outils des modules 03
          et 04 le verront <strong>immédiatement</strong>.
        </p>

        <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((stat) => (
            <div className="rounded-lg border p-3" key={stat.label}>
              <div className="font-semibold text-2xl tabular-nums">
                {stat.value}
              </div>
              <div className="text-muted-foreground text-xs">{stat.label}</div>
            </div>
          ))}
        </div>
      </header>

      <div className="mt-10 flex flex-col gap-10">
        <Section
          description="Remet toutes les données de démo dans leur état d’origine. La config (modèles LLM, serveurs MCP) est préservée."
          title="Réinitialiser"
        >
          <DemoDataCard />
        </Section>

        <Section
          description="Le catalogue lu par l’outil getProductInfo / listCatalog."
          title="Catalogue"
        >
          <BrewlyCatalogManager />
        </Section>

        <Section
          description="Les commandes lues par l’outil getOrderStatus."
          title="Commandes"
        >
          <BrewlyOrdersManager />
        </Section>

        <Section
          description="Exemple générique de CRUD sandbox, sans lien avec les agents."
          title="Sandbox items (référence)"
        >
          <SandboxItemManager />
        </Section>

        <Section
          description="Gérés depuis le chat (bouton « Modèles » / « MCP »). Affichés ici en lecture seule ; le reset ne les touche pas."
          title="Configuration (lecture seule)"
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <ReadOnlyTable
              columns={["Nom", "Provider", "Statut"]}
              empty="Aucun modèle configuré."
              rows={models.map((model) => [
                model.label,
                model.provider,
                <Badge key="s" variant={model.enabled ? "secondary" : "outline"}>
                  {model.enabled ? "Actif" : "Inactif"}
                </Badge>,
              ])}
              title="Modèles LLM"
            />
            <ReadOnlyTable
              columns={["Nom", "URL", "Statut"]}
              empty="Aucun serveur MCP configuré."
              rows={mcpServers.map((server) => [
                server.name,
                <span className="font-mono text-xs" key="u">
                  {server.url}
                </span>,
                <Badge
                  key="s"
                  variant={server.enabled ? "secondary" : "outline"}
                >
                  {server.enabled ? "Actif" : "Inactif"}
                </Badge>,
              ])}
              title="Serveurs MCP"
            />
          </div>
        </Section>
      </div>
    </main>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="font-heading font-medium text-xl tracking-tight">
          {title}
        </h2>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      {children}
    </section>
  );
}

function ReadOnlyTable({
  title,
  columns,
  rows,
  empty,
}: {
  title: string;
  columns: string[];
  rows: React.ReactNode[][];
  empty: string;
}) {
  return (
    <div className="rounded-lg border">
      <div className="border-b px-3 py-2 font-medium text-sm">{title}</div>
      {rows.length === 0 ? (
        <p className="px-3 py-4 text-muted-foreground text-sm">{empty}</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column}>{column}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((cells, rowIndex) => (
              <TableRow key={`row-${rowIndex}`}>
                {cells.map((cell, cellIndex) => (
                  <TableCell key={`cell-${rowIndex}-${cellIndex}`}>
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
