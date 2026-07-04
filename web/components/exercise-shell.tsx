import { ArrowLeft, PanelLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

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
 * infos complémentaires à gauche, chat/agent à droite.
 */
export function ExerciseShell({
  number,
  title,
  description,
  info,
  children,
}: ExerciseShellProps) {
  return (
    <div className="flex h-dvh flex-col">
      <header className="flex shrink-0 items-center gap-3 border-b px-4 py-3 md:px-6">
        <Button asChild variant="ghost" size="icon-sm">
          <Link href="/" aria-label="Retour aux exercices">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <span className="font-mono text-sm text-primary">{number}</span>
        <h1 className="font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="hidden truncate text-sm text-muted-foreground md:block">
            — {description}
          </p>
        )}
      </header>

      <div className="grid min-h-0 flex-1 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <aside className="hidden min-h-0 overflow-y-auto border-r bg-muted/30 p-6 md:block">
          {info ?? (
            <div className="flex h-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center text-muted-foreground">
              <PanelLeft className="size-8" />
              <p className="text-sm">
                Les informations complémentaires de l&apos;exercice
                s&apos;afficheront ici.
              </p>
            </div>
          )}
        </aside>

        <section className="flex min-h-0 flex-col p-4 md:p-6">
          {children}
        </section>
      </div>
    </div>
  );
}
