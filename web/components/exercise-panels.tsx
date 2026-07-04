"use client";

import { PanelLeft } from "lucide-react";
import type { ReactNode } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export type ExercisePanelsProps = {
  info?: ReactNode;
  children: ReactNode;
};

/**
 * Corps redimensionnable du layout d'exercice : panneau d'infos à gauche
 * (redimensionnable et collapsible), chat/agent à droite.
 */
export function ExercisePanels({ info, children }: ExercisePanelsProps) {
  return (
    <ResizablePanelGroup
      orientation="horizontal"
      id="exercise-layout"
      className="min-h-0 flex-1"
    >
      <ResizablePanel
        id="info"
        defaultSize={38}
        minSize={20}
        collapsible
        collapsedSize={0}
        className="hidden md:block"
      >
        <aside className="h-full overflow-y-auto bg-muted/30 p-6">
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
      </ResizablePanel>

      <ResizableHandle withHandle className="hidden md:flex" />

      <ResizablePanel id="chat" defaultSize={62} minSize={30}>
        <section className="flex h-full min-h-0 flex-col p-4 md:p-6">
          {children}
        </section>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
