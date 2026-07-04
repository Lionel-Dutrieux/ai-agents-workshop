"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { McpServer } from "./mcp-servers-dialog";

const MCP_SERVERS_STORAGE_KEY = "workshop:mcp-servers";

// Les serveurs MCP sont persistés dans localStorage, lu comme un store
// externe (rendu serveur : liste vide, pas de mismatch d'hydratation).
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot() {
  return localStorage.getItem(MCP_SERVERS_STORAGE_KEY) ?? "[]";
}

/** Liste des serveurs MCP configurés, persistée dans localStorage. */
export function useMcpServers() {
  const json = useSyncExternalStore(subscribe, getSnapshot, () => "[]");

  const servers = useMemo<McpServer[]>(() => {
    try {
      return JSON.parse(json);
    } catch {
      return [];
    }
  }, [json]);

  const setServers = (next: McpServer[]) => {
    localStorage.setItem(MCP_SERVERS_STORAGE_KEY, JSON.stringify(next));
    // L'événement "storage" ne se déclenche pas dans l'onglet courant.
    window.dispatchEvent(
      new StorageEvent("storage", { key: MCP_SERVERS_STORAGE_KEY })
    );
  };

  return [servers, setServers] as const;
}
