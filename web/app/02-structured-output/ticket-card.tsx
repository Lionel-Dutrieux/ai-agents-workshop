"use client";

import { ChevronRightIcon } from "lucide-react";
import type { ReactNode } from "react";
import { CodeBlock } from "@/components/ai-elements/code-block";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Ticket } from "./schema";

const INTENTION_LABELS: Record<string, string> = {
  question_produit: "Question produit",
  suivi_commande: "Suivi de commande",
  reclamation: "Réclamation",
  remboursement: "Remboursement",
  autre: "Autre",
};

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

const SENTIMENT_VARIANT: Record<string, BadgeVariant> = {
  positif: "secondary",
  neutre: "outline",
  negatif: "destructive",
};

const PRIORITE_VARIANT: Record<string, BadgeVariant> = {
  basse: "outline",
  moyenne: "secondary",
  haute: "destructive",
};

export type TicketCardProps = {
  /** Ticket (potentiellement partiel pendant le streaming). */
  ticket: Partial<Ticket>;
};

/** Affiche le ticket structuré : champs libellés + badges, puis JSON brut. */
export function TicketCard({ ticket }: TicketCardProps) {
  return (
    <div className="space-y-3">
      <div className="divide-y rounded-lg border">
        <Row label="Intention">
          {ticket.intention ? (
            <Badge variant="secondary">
              {INTENTION_LABELS[ticket.intention] ?? ticket.intention}
            </Badge>
          ) : (
            <Pending />
          )}
        </Row>
        <Row label="Commande">
          {ticket.orderId ? (
            <span className="font-mono text-sm">{ticket.orderId}</span>
          ) : ticket.orderId === null ? (
            <span className="text-muted-foreground text-sm">—</span>
          ) : (
            <Pending />
          )}
        </Row>
        <Row label="Sentiment">
          {ticket.sentiment ? (
            <Badge variant={SENTIMENT_VARIANT[ticket.sentiment] ?? "outline"}>
              {ticket.sentiment}
            </Badge>
          ) : (
            <Pending />
          )}
        </Row>
        <Row label="Priorité">
          {ticket.priorite ? (
            <Badge variant={PRIORITE_VARIANT[ticket.priorite] ?? "outline"}>
              {ticket.priorite}
            </Badge>
          ) : (
            <Pending />
          )}
        </Row>
        <Row label="Résumé">
          {ticket.resume ? (
            <span className="text-sm">{ticket.resume}</span>
          ) : (
            <Pending />
          )}
        </Row>
      </div>

      <details className="group rounded-lg border bg-muted/30">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 font-medium text-muted-foreground text-xs [&::-webkit-details-marker]:hidden">
          <ChevronRightIcon className="size-4 shrink-0 transition-transform group-open:rotate-90" />
          JSON brut
        </summary>
        <div className="border-t p-2">
          <CodeBlock
            code={JSON.stringify(ticket, null, 2)}
            language="json"
          />
        </div>
      </details>
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 px-3 py-2.5">
      <span className="shrink-0 text-muted-foreground text-sm">{label}</span>
      <div className="min-w-0 text-right">{children}</div>
    </div>
  );
}

/** Placeholder pulsé tant que le champ n'est pas encore rempli (streaming). */
function Pending({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block h-4 w-16 animate-pulse rounded bg-muted", className)}
    />
  );
}
