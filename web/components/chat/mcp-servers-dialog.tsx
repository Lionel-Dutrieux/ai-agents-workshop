"use client";

import { PlusIcon, ServerIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { PromptInputButton } from "@/components/ai-elements/prompt-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export type McpServer = {
  id: string;
  name: string;
  url: string;
};

export type McpServersDialogProps = {
  servers: McpServer[];
  onServersChange: (servers: McpServer[]) => void;
};

export function McpServersDialog({
  servers,
  onServersChange,
}: McpServersDialogProps) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  const addServer = () => {
    if (!url.trim()) {
      return;
    }
    onServersChange([
      ...servers,
      {
        id: crypto.randomUUID(),
        name: name.trim() || new URL(url, "http://localhost").hostname,
        url: url.trim(),
      },
    ]);
    setName("");
    setUrl("");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <PromptInputButton tooltip="Serveurs MCP">
          <ServerIcon className="size-4" />
          <span>MCP</span>
          {servers.length > 0 && (
            <Badge variant="secondary" className="px-1.5">
              {servers.length}
            </Badge>
          )}
        </PromptInputButton>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Serveurs MCP</DialogTitle>
          <DialogDescription>
            Les outils exposés par ces serveurs seront proposés au modèle
            (transport HTTP).
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          {servers.length === 0 ? (
            <p className="rounded-md border border-dashed p-4 text-center text-muted-foreground text-sm">
              Aucun serveur configuré.
            </p>
          ) : (
            servers.map((server) => (
              <div
                className="flex items-center gap-3 rounded-md border px-3 py-2"
                key={server.id}
              >
                <ServerIcon className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-sm">{server.name}</p>
                  <p className="truncate text-muted-foreground text-xs">
                    {server.url}
                  </p>
                </div>
                <Button
                  aria-label={`Supprimer ${server.name}`}
                  onClick={() =>
                    onServersChange(servers.filter((s) => s.id !== server.id))
                  }
                  size="icon-sm"
                  variant="ghost"
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            addServer();
          }}
        >
          <div className="flex-1 space-y-1">
            <label className="text-muted-foreground text-xs" htmlFor="mcp-name">
              Nom
            </label>
            <Input
              id="mcp-name"
              onChange={(e) => setName(e.target.value)}
              placeholder="brewly"
              value={name}
            />
          </div>
          <div className="flex-[2] space-y-1">
            <label className="text-muted-foreground text-xs" htmlFor="mcp-url">
              URL
            </label>
            <Input
              id="mcp-url"
              onChange={(e) => setUrl(e.target.value)}
              placeholder="http://localhost:8080/mcp"
              type="url"
              value={url}
            />
          </div>
          <Button disabled={!url.trim()} size="icon" type="submit">
            <PlusIcon className="size-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
