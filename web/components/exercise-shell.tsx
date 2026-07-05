"use client";

import { ArrowLeft, Database, PanelLeftIcon } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ExercisePanels } from "./exercise-panels";

export type ExerciseShellProps = {
  /** Numéro de l'exercice, ex. "01". */
  number: string;
  title: string;
  description?: string;
  /**
   * Panneau de gauche : consignes, données, résultats intermédiaires…
   * propres à chaque exercice. Un placeholder s'affiche s'il est vide.
   */
  info?: ReactNode;
  /** Panneau de droite : le chat / l'agent. */
  children: ReactNode;
};

/**
 * Layout partagé par toutes les vues d'exercice : header commun,
 * infos complémentaires à gauche (masquables), chat/agent à droite.
 */
export function ExerciseShell({
  number,
  title,
  description,
  info,
  children,
}: ExerciseShellProps) {
  const [infoOpen, setInfoOpen] = useState(true);

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex shrink-0 items-center gap-2 border-b px-3 py-3 md:px-4">
        <Button asChild size="icon-sm" variant="ghost">
          <Link aria-label="Retour aux exercices" href="/">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              aria-label={infoOpen ? "Masquer les infos" : "Afficher les infos"}
              aria-pressed={infoOpen}
              className="hidden text-muted-foreground data-[state=on]:text-foreground md:inline-flex"
              data-state={infoOpen ? "on" : "off"}
              onClick={() => setInfoOpen((open) => !open)}
              size="icon-sm"
              variant="ghost"
            >
              <PanelLeftIcon className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {infoOpen ? "Masquer les infos" : "Afficher les infos"}
          </TooltipContent>
        </Tooltip>

        <span className="ml-1 font-mono text-primary text-sm">{number}</span>
        <h1 className="font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="hidden truncate text-muted-foreground text-sm md:block">
            — {description}
          </p>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              asChild
              className="ml-auto shrink-0"
              size="sm"
              variant="outline"
            >
              <Link aria-label="Ouvrir la sandbox de données" href="/sandbox">
                <Database className="size-4" />
                <span className="hidden sm:inline">Sandbox</span>
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Voir et modifier les données de démo</TooltipContent>
        </Tooltip>
      </header>

      <ExercisePanels
        info={info}
        infoOpen={infoOpen}
        onInfoOpenChange={setInfoOpen}
      >
        {children}
      </ExercisePanels>
    </div>
  );
}
