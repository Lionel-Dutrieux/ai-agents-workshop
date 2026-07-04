"use server";

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
