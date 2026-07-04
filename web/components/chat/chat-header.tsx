"use client";

import {
  PanelRightCloseIcon,
  PanelRightIcon,
  SquarePenIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type ChatHeaderProps = {
  /** Titre de la conversation active, ou `null` pour un nouveau chat. */
  title: string | null;
  historyOpen: boolean;
  onToggleHistory: () => void;
  onNew: () => void;
};

/** Bandeau supérieur discret : titre courant et accès à l'historique. */
export function ChatHeader({
  title,
  historyOpen,
  onToggleHistory,
  onNew,
}: ChatHeaderProps) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between gap-2 px-3">
      <p className="min-w-0 truncate font-medium text-sm">{title}</p>
      <div className="flex shrink-0 items-center gap-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              aria-label="Nouveau chat"
              onClick={onNew}
              size="icon-sm"
              variant="ghost"
            >
              <SquarePenIcon className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Nouveau chat</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              aria-label={
                historyOpen ? "Masquer l'historique" : "Afficher l'historique"
              }
              aria-pressed={historyOpen}
              onClick={onToggleHistory}
              size="icon-sm"
              variant="ghost"
            >
              {historyOpen ? (
                <PanelRightCloseIcon className="size-4" />
              ) : (
                <PanelRightIcon className="size-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {historyOpen ? "Masquer l'historique" : "Afficher l'historique"}
          </TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
