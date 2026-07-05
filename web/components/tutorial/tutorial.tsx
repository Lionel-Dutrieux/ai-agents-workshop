import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type TutorialProps = {
  children: ReactNode;
  className?: string;
};

/** Conteneur d'un énoncé de tutoriel (panneau de gauche). */
export function Tutorial({ children, className }: TutorialProps) {
  return (
    <article className={cn("flex flex-col gap-6", className)}>{children}</article>
  );
}

export type TutorialHeaderProps = {
  /** Petit label au-dessus du titre (ex. "Exercice 01"). */
  eyebrow?: ReactNode;
  title: ReactNode;
  /** Objectif / résumé de l'exercice. */
  objective?: ReactNode;
};

/** En-tête d'un tutoriel : eyebrow, titre, objectif. */
export function TutorialHeader({
  eyebrow,
  title,
  objective,
}: TutorialHeaderProps) {
  return (
    <header className="space-y-2">
      {eyebrow && (
        <p className="font-medium text-primary text-xs uppercase tracking-wide">
          {eyebrow}
        </p>
      )}
      <h2 className="text-balance font-heading font-semibold text-xl tracking-tight">
        {title}
      </h2>
      {objective && (
        <p className="text-pretty text-muted-foreground text-sm leading-relaxed">
          {objective}
        </p>
      )}
    </header>
  );
}

export type TutorialSectionProps = {
  title?: ReactNode;
  children: ReactNode;
  className?: string;
};

/** Section thématique au sein d'un tutoriel. */
export function TutorialSection({
  title,
  children,
  className,
}: TutorialSectionProps) {
  return (
    <section className={cn("space-y-3", className)}>
      {title && (
        <h3 className="font-heading font-medium text-base tracking-tight">
          {title}
        </h3>
      )}
      <div className="space-y-3 text-muted-foreground text-sm leading-relaxed">
        {children}
      </div>
    </section>
  );
}
