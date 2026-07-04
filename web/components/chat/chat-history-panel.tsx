"use client";

import { PanelRightCloseIcon, SquarePenIcon, Trash2Icon } from "lucide-react";
import { useMemo } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ConversationSummary } from "./actions";

export type ChatHistoryPanelProps = {
  conversations: ConversationSummary[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  className?: string;
};

const DAY_MS = 86_400_000;

type ConversationGroup = { label: string; items: ConversationSummary[] };

/** Regroupe les conversations par ancienneté, façon ChatGPT / Claude. */
function groupByRecency(
  conversations: ConversationSummary[]
): ConversationGroup[] {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();

  const buckets: Record<string, ConversationSummary[]> = {
    today: [],
    yesterday: [],
    week: [],
    month: [],
    older: [],
  };

  for (const conversation of conversations) {
    const time = new Date(conversation.updatedAt).getTime();
    if (time >= startOfToday) {
      buckets.today.push(conversation);
    } else if (time >= startOfToday - DAY_MS) {
      buckets.yesterday.push(conversation);
    } else if (time >= startOfToday - 7 * DAY_MS) {
      buckets.week.push(conversation);
    } else if (time >= startOfToday - 30 * DAY_MS) {
      buckets.month.push(conversation);
    } else {
      buckets.older.push(conversation);
    }
  }

  const order: [keyof typeof buckets, string][] = [
    ["today", "Aujourd'hui"],
    ["yesterday", "Hier"],
    ["week", "7 derniers jours"],
    ["month", "30 derniers jours"],
    ["older", "Plus ancien"],
  ];

  return order
    .filter(([key]) => buckets[key].length > 0)
    .map(([key, label]) => ({ label, items: buckets[key] }));
}

/**
 * Volet latéral (colonne inline) listant les conversations de l'exercice,
 * groupées par date. S'insère à droite du chat, façon ChatGPT / Claude.
 */
export function ChatHistoryPanel({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onClose,
  className,
}: ChatHistoryPanelProps) {
  const groups = useMemo(() => groupByRecency(conversations), [conversations]);

  return (
    <aside
      aria-label="Historique des conversations"
      className={cn(
        "flex w-72 max-w-[85vw] shrink-0 animate-in flex-col border-l bg-sidebar duration-200 slide-in-from-right-4",
        className
      )}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          onClose();
        }
      }}
    >
      <div className="flex h-12 shrink-0 items-center justify-between px-3">
        <span className="font-medium text-sm">Conversations</span>
        <Button
          aria-label="Fermer l'historique"
          onClick={onClose}
          size="icon-sm"
          variant="ghost"
        >
          <PanelRightCloseIcon className="size-4" />
        </Button>
      </div>

      <div className="px-2 pb-1">
        <Button
          className="w-full justify-start gap-2 font-normal"
          onClick={onNew}
          variant="ghost"
        >
          <SquarePenIcon className="size-4" />
          Nouveau chat
        </Button>
      </div>

      <nav
        aria-label="Conversations enregistrées"
        className="min-h-0 flex-1 overflow-y-auto px-2 pb-3"
      >
          {groups.length === 0 ? (
            <p className="px-2 py-8 text-center text-muted-foreground text-sm">
              {"Aucune conversation pour l'instant."}
            </p>
          ) : (
            groups.map((group) => (
              <div className="mb-1" key={group.label}>
                <p className="px-2 pt-3 pb-1 font-medium text-muted-foreground text-xs">
                  {group.label}
                </p>
                <ul className="flex flex-col">
                  {group.items.map((conversation) => (
                    <ConversationRow
                      conversation={conversation}
                      isActive={conversation.id === activeId}
                      key={conversation.id}
                      onDelete={onDelete}
                      onSelect={onSelect}
                    />
                  ))}
                </ul>
              </div>
            ))
          )}
      </nav>
    </aside>
  );
}

type ConversationRowProps = {
  conversation: ConversationSummary;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
};

function ConversationRow({
  conversation,
  isActive,
  onSelect,
  onDelete,
}: ConversationRowProps) {
  return (
    <li
      className={cn(
        "group relative rounded-lg transition-colors",
        isActive ? "bg-muted" : "hover:bg-muted/60"
      )}
    >
      {/* Gouttière `pr-9` : le titre se tronque avant la zone d'action, qui
          ne le chevauche donc jamais, quelle que soit la largeur du volet. */}
      <button
        aria-current={isActive ? "true" : undefined}
        className="block w-full truncate rounded-lg py-2 pr-9 pl-2.5 text-left text-sm"
        onClick={() => onSelect(conversation.id)}
        title={conversation.title}
        type="button"
      >
        {conversation.title}
      </button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            aria-label={`Supprimer « ${conversation.title} »`}
            // Révélé au survol (pointeur fin) ; toujours présent au clavier et
            // sur écran tactile, faute de survol possible.
            className="-translate-y-1/2 absolute top-1/2 right-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100"
            size="icon-sm"
            variant="ghost"
          >
            <Trash2Icon className="size-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la conversation ?</AlertDialogTitle>
            <AlertDialogDescription>
              « {conversation.title} » et ses messages seront définitivement
              supprimés. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(conversation.id)}
              variant="destructive"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
}
