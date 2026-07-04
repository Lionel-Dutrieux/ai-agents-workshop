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
 *
 * ⚠️ react-resizable-panels v4 : un `number` est interprété en PIXELS,
 * les pourcentages doivent être des strings ("38%").
 */
export function ExercisePanels({ info, children }: ExercisePanelsProps) {
  return (
    <div className="min-h-0 flex-1">
      <ResizablePanelGroup orientation="horizontal" id="exercise-layout">
        <ResizablePanel
          id="info"
          defaultSize="38%"
          minSize="300px"
          maxSize="620px"
          collapsible
          collapsedSize="0px"
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

        <ResizablePanel id="chat" defaultSize="62%" minSize="440px">
          <section className="flex h-full min-h-0 flex-col p-4 md:p-6">
            {children}
          </section>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
