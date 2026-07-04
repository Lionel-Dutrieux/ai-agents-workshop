import { SparklesIcon } from "lucide-react";
import type { ReactNode } from "react";

export type ChatWelcomeProps = {
  title: string;
  description: string;
  /** Icône affichée dans la pastille. Par défaut : des étincelles. */
  icon?: ReactNode;
};

/** Accueil centré affiché tant que la conversation est vide. */
export function ChatWelcome({ title, description, icon }: ChatWelcomeProps) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15 ring-inset">
        {icon ?? <SparklesIcon className="size-5" />}
      </div>
      <div className="space-y-1.5">
        <h2 className="text-balance font-heading font-semibold text-2xl tracking-tight">
          {title}
        </h2>
        <p className="text-pretty text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
