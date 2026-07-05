import "server-only";

import { prisma } from "@/lib/prisma";

/**
 * Data Access Layer des serveurs MCP.
 *
 * ⚠️ Les valeurs d'en-têtes (souvent un token d'auth) sont des secrets : elles
 * ne quittent jamais le serveur. Les lectures client renvoient seulement les
 * *clés* (`headerKeys`) ; seul `getEnabledMcpServers` renvoie les valeurs, pour
 * que les routes d'exercice se connectent aux serveurs.
 */

/** Vue de gestion : sans les valeurs d'en-têtes (clés seulement). */
export type ManagedMcpServer = {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  headerKeys: string[];
};

/** Config complète pour se connecter — server-only. */
export type McpServerConfig = {
  name: string;
  url: string;
  headers: Record<string, string>;
};

export type McpServerInput = {
  name: string;
  url: string;
  /** `undefined` → inchangé en édition ; objet (même vide) → remplacé. */
  headers?: Record<string, string> | null;
  enabled?: boolean;
};

function parseHeaders(raw: string | null): Record<string, string> {
  if (!raw) {
    return {};
  }
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/** Tous les serveurs, pour l'écran de gestion (sans valeurs d'en-têtes). */
export async function listManagedMcpServers(): Promise<ManagedMcpServer[]> {
  const rows = await prisma.mcpServer.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, url: true, enabled: true, headers: true },
  });
  return rows.map(({ headers, ...server }) => ({
    ...server,
    headerKeys: Object.keys(parseHeaders(headers)),
  }));
}

/** Nombre de serveurs activés — pour le badge du déclencheur. */
export async function countEnabledMcpServers(): Promise<number> {
  return prisma.mcpServer.count({ where: { enabled: true } });
}

/** Nombre TOTAL de serveurs configurés (activés ou non). */
export async function countMcpServers(): Promise<number> {
  return prisma.mcpServer.count();
}

/**
 * Config complète d'UN serveur (en-têtes inclus), par id. Réservé au serveur —
 * sert au test de connexion, qui doit rejouer les en-têtes secrets stockés.
 */
export async function getMcpServerConfig(
  id: string
): Promise<McpServerConfig | null> {
  const row = await prisma.mcpServer.findUnique({
    where: { id },
    select: { name: true, url: true, headers: true },
  });
  if (!row) {
    return null;
  }
  return { name: row.name, url: row.url, headers: parseHeaders(row.headers) };
}

/** Config des serveurs activés (en-têtes inclus). Réservé au serveur. */
export async function getEnabledMcpServers(): Promise<McpServerConfig[]> {
  const rows = await prisma.mcpServer.findMany({
    where: { enabled: true },
    orderBy: { createdAt: "asc" },
    select: { name: true, url: true, headers: true },
  });
  return rows.map((server) => ({
    name: server.name,
    url: server.url,
    headers: parseHeaders(server.headers),
  }));
}

function serializeHeaders(
  headers: Record<string, string> | null | undefined
): string | null {
  if (!headers || Object.keys(headers).length === 0) {
    return null;
  }
  return JSON.stringify(headers);
}

export async function createMcpServer(input: McpServerInput): Promise<void> {
  const now = new Date();
  await prisma.mcpServer.create({
    data: {
      name: input.name,
      url: input.url,
      headers: serializeHeaders(input.headers),
      enabled: input.enabled ?? true,
      createdAt: now,
      updatedAt: now,
    },
  });
}

export async function updateMcpServer(
  id: string,
  input: McpServerInput
): Promise<void> {
  await prisma.mcpServer.update({
    where: { id },
    data: {
      name: input.name,
      url: input.url,
      // `undefined` → on conserve les en-têtes existants (non fournis).
      ...(input.headers === undefined
        ? {}
        : { headers: serializeHeaders(input.headers) }),
      enabled: input.enabled ?? true,
      updatedAt: new Date(),
    },
  });
}

export async function deleteMcpServer(id: string): Promise<void> {
  await prisma.mcpServer.delete({ where: { id } }).catch(() => {
    // Déjà supprimé : rien à faire.
  });
}
