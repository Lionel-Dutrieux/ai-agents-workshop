"use client";

import { TriangleAlertIcon } from "lucide-react";

type ChatErrorInfo = {
  title: string;
  hint?: string;
  /** Détail technique brut, affiché dans un repli. */
  detail?: string;
};

/**
 * Transforme une erreur de `useChat` en message lisible. Cas principal du
 * workshop : la route n'est pas encore implémentée → Next renvoie sa page
 * HTML 404, que le AI SDK place telle quelle dans `error.message`.
 */
function describeChatError(error: Error): ChatErrorInfo {
  const raw = error.message?.trim() ?? "";

  const looksLikeHtml =
    /^<!doctype html/i.test(raw) ||
    /<html[\s>]/i.test(raw) ||
    raw.includes("This page could not be found");

  if (looksLikeHtml) {
    return {
      title: "Le backend de cet exercice n'est pas encore prêt.",
      hint: "La route API a répondu par une page HTML au lieu d'un flux du AI SDK — implémente l'endpoint pour obtenir une réponse du modèle.",
    };
  }

  if (!raw) {
    return { title: "Une erreur est survenue." };
  }

  return {
    title: "Une erreur est survenue.",
    // On borne le détail pour ne jamais déverser un pavé illisible.
    detail: raw.length > 600 ? `${raw.slice(0, 600)}…` : raw,
  };
}

export type ChatErrorProps = {
  error: Error;
};

/** Encart d'erreur propre, qui ne casse jamais la mise en page. */
export function ChatError({ error }: ChatErrorProps) {
  const { title, hint, detail } = describeChatError(error);

  return (
    <div
      className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm"
      role="alert"
    >
      <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-destructive" />
      <div className="min-w-0 space-y-1">
        <p className="font-medium text-destructive">{title}</p>
        {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
        {detail && (
          <details className="min-w-0">
            <summary className="cursor-pointer text-muted-foreground text-xs">
              Détails techniques
            </summary>
            <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap break-all rounded bg-background/60 p-2 text-muted-foreground text-xs">
              {detail}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
