import { ExternalLinkIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type DocLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

/** Lien vers de la documentation officielle (ouvre un nouvel onglet). */
export function DocLink({ href, children, className }: DocLinkProps) {
  return (
    <a
      className={cn(
        "inline-flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline",
        className
      )}
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      {children}
      <ExternalLinkIcon aria-hidden className="size-3" />
    </a>
  );
}

export type DocLinksProps = {
  title?: ReactNode;
  children: ReactNode;
};

/** Groupe de liens « Ressources » en fin de tutoriel. */
export function DocLinks({ title = "Ressources", children }: DocLinksProps) {
  return (
    <section className="space-y-2">
      <h3 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
        {title}
      </h3>
      <ul className="space-y-1 text-sm">{children}</ul>
    </section>
  );
}
