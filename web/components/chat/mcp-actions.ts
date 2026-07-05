"use server";

import { createMCPClient } from "@ai-sdk/mcp";
import { z } from "zod";
import * as mcp from "@/lib/dal/mcp-servers";

export type { ManagedMcpServer } from "@/lib/dal/mcp-servers";

/**
 * Frontière serveur des serveurs MCP : validation puis délégation au DAL.
 * Les valeurs d'en-têtes ne sont jamais renvoyées au client.
 */

const idSchema = z.string().min(1);

const mcpInputSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  headers: z.record(z.string(), z.string()).optional(),
  enabled: z.boolean().optional(),
});

export type McpServerFormInput = z.input<typeof mcpInputSchema>;

function toDalInput(input: z.infer<typeof mcpInputSchema>): mcp.McpServerInput {
  return {
    name: input.name.trim(),
    url: input.url.trim(),
    headers: input.headers,
    enabled: input.enabled ?? true,
  };
}

export async function listManagedMcpServersAction() {
  return mcp.listManagedMcpServers();
}

export async function countEnabledMcpServersAction() {
  return mcp.countEnabledMcpServers();
}

export async function createMcpServerAction(input: McpServerFormInput) {
  return mcp.createMcpServer(toDalInput(mcpInputSchema.parse(input)));
}

export async function updateMcpServerAction(id: string, input: McpServerFormInput) {
  return mcp.updateMcpServer(idSchema.parse(id), toDalInput(mcpInputSchema.parse(input)));
}

export async function deleteMcpServerAction(id: string) {
  return mcp.deleteMcpServer(idSchema.parse(id));
}

/** Résultat d'un test de connexion (handshake) à un serveur MCP. */
export type McpPingResult =
  | {
      ok: true;
      serverName: string;
      serverVersion: string;
      tools: { name: string; description?: string }[];
    }
  | { ok: false; error: string };

/**
 * Se connecte réellement à un serveur MCP, joue le handshake (`initialize` +
 * `tools/list`) et renvoie ses infos + ses outils. C'est le MÊME client
 * (`@ai-sdk/mcp`) que la route du module 5 : un test vert prouve que le client
 * MCP fonctionne de bout en bout.
 */
async function pingMcpServer(
  url: string,
  headers?: Record<string, string>
): Promise<McpPingResult> {
  let client: Awaited<ReturnType<typeof createMCPClient>> | undefined;
  try {
    client = await createMCPClient({ transport: { type: "http", url, headers } });
    const info = client.serverInfo;
    const { tools } = await client.listTools();
    return {
      ok: true,
      serverName: info?.name ?? "inconnu",
      serverVersion: info?.version ?? "?",
      tools: tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
      })),
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    await client?.close().catch(() => {
      // Fermeture best-effort : rien à faire si elle échoue.
    });
  }
}

const pingInputSchema = z.object({
  url: z.string().url(),
  headers: z.record(z.string(), z.string()).optional(),
});

/** Teste une URL brute (+ en-têtes) — pour un preset ou un serveur non enregistré. */
export async function pingMcpServerAction(
  input: z.input<typeof pingInputSchema>
): Promise<McpPingResult> {
  const parsed = pingInputSchema.parse(input);
  return pingMcpServer(parsed.url, parsed.headers);
}

/** Teste un serveur déjà enregistré (rejoue ses en-têtes secrets stockés). */
export async function pingMcpServerByIdAction(id: string): Promise<McpPingResult> {
  const config = await mcp.getMcpServerConfig(idSchema.parse(id));
  if (!config) {
    return { ok: false, error: "Serveur introuvable." };
  }
  return pingMcpServer(config.url, config.headers);
}
