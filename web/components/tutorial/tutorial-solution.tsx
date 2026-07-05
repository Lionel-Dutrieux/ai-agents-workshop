import { ChevronRightIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type TutorialSolutionProps = {
  /** Libellé du dépliant. */
  title?: ReactNode;
  children: ReactNode;
  className?: string;
};

/**
 * Solution repliable (anti-spoil) : le participant l'ouvre quand il le
 * souhaite. Bâti sur `<details>` natif (accessible, sans JS).
 */
export function TutorialSolution({
  title = "Afficher la solution",
  children,
  className,
}: TutorialSolutionProps) {
  return (
    <details
      className={cn(
        "group rounded-lg border bg-muted/30 [&[open]]:bg-muted/40",
        className
      )}
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 font-medium text-sm marker:content-none [&::-webkit-details-marker]:hidden">
        <ChevronRightIcon
          aria-hidden
          className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90"
        />
        {title}
      </summary>
      <div className="space-y-3 border-t px-3 py-3">{children}</div>
    </details>
  );
}
