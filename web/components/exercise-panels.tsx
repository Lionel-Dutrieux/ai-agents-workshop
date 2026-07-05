"use client";

import { PanelLeftIcon } from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";
import type { PanelImperativeHandle, PanelSize } from "react-resizable-panels";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export type ExercisePanelsProps = {
  info?: ReactNode;
  children: ReactNode;
  /** Panneau d'infos affiché ? Piloté par le header de l'exercice. */
  infoOpen: boolean;
  onInfoOpenChange: (open: boolean) => void;
};

/**
 * Corps redimensionnable du layout d'exercice : panneau d'infos à gauche
 * (redimensionnable, masquable via bouton), chat/agent à droite.
 *
 * ⚠️ react-resizable-panels v4 : un `number` est interprété en PIXELS,
 * les pourcentages doivent être des strings ("38%").
 */
export function ExercisePanels({
  info,
  children,
  infoOpen,
  onInfoOpenChange,
}: ExercisePanelsProps) {
  const infoPanelRef = useRef<PanelImperativeHandle>(null);
  const collapsedRef = useRef(!infoOpen);

  // Reflète l'état `infoOpen` (bouton) sur le panneau.
  useEffect(() => {
    const panel = infoPanelRef.current;
    if (!panel) {
      return;
    }
    if (infoOpen && panel.isCollapsed()) {
      panel.expand();
    } else if (!infoOpen && !panel.isCollapsed()) {
      panel.collapse();
    }
  }, [infoOpen]);

  // Sync inverse : un collapse/expand au drag met à jour le bouton.
  const handleResize = (panelSize: PanelSize) => {
    const collapsed = panelSize.asPercentage === 0;
    if (collapsed !== collapsedRef.current) {
      collapsedRef.current = collapsed;
      onInfoOpenChange(!collapsed);
    }
  };

  return (
    <div className="min-h-0 flex-1">
      <ResizablePanelGroup orientation="horizontal" id="exercise-layout">
        <ResizablePanel
          className="hidden md:block"
          collapsedSize="0px"
          collapsible
          defaultSize="46%"
          id="info"
          maxSize="62%"
          minSize="320px"
          onResize={handleResize}
          panelRef={infoPanelRef}
        >
          <aside className="h-full overflow-y-auto bg-muted/20 p-6">
            {info ?? <InfoPlaceholder />}
          </aside>
        </ResizablePanel>

        <ResizableHandle className="hidden md:flex" withHandle />

        <ResizablePanel defaultSize="54%" id="chat" minSize="420px">
          <section className="flex h-full min-h-0 flex-col">{children}</section>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

/** Placeholder discret tant qu'un exercice ne fournit pas de contenu. */
function InfoPlaceholder() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-muted-foreground">
      <PanelLeftIcon className="size-7 opacity-40" />
      <p className="max-w-xs text-sm">
        {"Consignes, données et résultats de l'exercice s'afficheront ici."}
      </p>
    </div>
  );
}
