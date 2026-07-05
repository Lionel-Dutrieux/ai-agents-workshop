import {
  InfoIcon,
  LightbulbIcon,
  type LucideIcon,
  TargetIcon,
  TriangleAlertIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type CalloutVariant = "note" | "tip" | "objective" | "warning";

const VARIANTS: Record<
  CalloutVariant,
  { icon: LucideIcon; container: string; icon_: string }
> = {
  note: {
    icon: InfoIcon,
    container: "border-border bg-muted/40",
    icon_: "text-muted-foreground",
  },
  tip: {
    icon: LightbulbIcon,
    container: "border-primary/20 bg-primary/5",
    icon_: "text-primary",
  },
  objective: {
    icon: TargetIcon,
    container: "border-primary/25 bg-primary/5",
    icon_: "text-primary",
  },
  warning: {
    icon: TriangleAlertIcon,
    container: "border-amber-500/30 bg-amber-500/5",
    icon_: "text-amber-600 dark:text-amber-500",
  },
};

export type CalloutProps = {
  variant?: CalloutVariant;
  title?: ReactNode;
  children: ReactNode;
  className?: string;
};

/** Encart contextuel : note, astuce, objectif ou avertissement. */
export function Callout({
  variant = "note",
  title,
  children,
  className,
}: CalloutProps) {
  const { icon: Icon, container, icon_ } = VARIANTS[variant];

  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border p-3 text-sm",
        container,
        className
      )}
    >
      <Icon className={cn("mt-0.5 size-4 shrink-0", icon_)} />
      <div className="min-w-0 space-y-1 leading-relaxed">
        {title && <p className="font-medium text-foreground">{title}</p>}
        <div className="text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}
