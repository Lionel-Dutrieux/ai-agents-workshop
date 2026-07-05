import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type TutorialStepsProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Liste d'étapes numérotées (la numérotation encode une séquence réelle à
 * suivre). Le compteur CSS gère les numéros automatiquement.
 */
export function TutorialSteps({ children, className }: TutorialStepsProps) {
  return (
    <ol className={cn("flex flex-col gap-6 [counter-reset:step]", className)}>
      {children}
    </ol>
  );
}

export type TutorialStepProps = {
  title: ReactNode;
  children: ReactNode;
};

/** Une étape : pastille numérotée + titre + contenu. */
export function TutorialStep({ title, children }: TutorialStepProps) {
  return (
    <li className="relative [counter-increment:step] pl-10">
      <span
        aria-hidden
        className="absolute top-0 left-0 flex size-7 items-center justify-center rounded-full bg-primary/10 font-medium text-primary text-sm before:content-[counter(step)]"
      />
      <div className="space-y-3">
        <h3 className="pt-0.5 font-medium text-foreground text-sm">{title}</h3>
        <div className="space-y-3 text-muted-foreground text-sm leading-relaxed">
          {children}
        </div>
      </div>
    </li>
  );
}
