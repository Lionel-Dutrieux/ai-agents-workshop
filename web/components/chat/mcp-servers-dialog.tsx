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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  createMcpServerAction,
  deleteMcpServerAction,
  listManagedMcpServersAction,
  type ManagedMcpServer,
  updateMcpServerAction,
} from "./mcp-actions";

type FormState = {
  editingId: string | null;
  name: string;
  url: string;
  headers: string;
};

const EMPTY_FORM: FormState = {
  editingId: null,
  name: "",
  url: "",
  headers: "",
};

/** Parse un textarea "Clé: valeur" (une par ligne) en objet d'en-têtes. */
function parseHeaders(text: string): Record<string, string> {
  const headers: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const separator = line.indexOf(":");
    if (separator === -1) {
      continue;
    }
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    if (key) {
      headers[key] = value;
    }
  }
  return headers;
}

export type McpServersDialogProps = {
  /** Nombre de serveurs activés (badge du déclencheur). */
  count: number;
  /** Appelé après tout changement, pour rafraîchir le compteur. */
  onServersChange: () => void;
};

/** Gestion des serveurs MCP (ajout/édition/suppression) via un dialog. */
export function McpServersDialog({
  count,
  onServersChange,
}: McpServersDialogProps) {
  const [open, setOpen] = useState(false);
  const [servers, setServers] = useState<ManagedMcpServer[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const isEditing = form.editingId !== null;

  const refresh = async () => {
    setServers(await listManagedMcpServersAction());
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      refresh();
    } else {
      setForm(EMPTY_FORM);
    }
  };

  const startEdit = (server: ManagedMcpServer) => {
    setForm({
      editingId: server.id,
      name: server.name,
      url: server.url,
      headers: "",
    });
  };

  const submit = async () => {
    if (!(form.name.trim() && form.url.trim())) {
      return;
    }
    const parsed = parseHeaders(form.headers);
    // Textarea vide en édition → on conserve les en-têtes existants.
    const headers =
      form.headers.trim().length > 0
        ? parsed
        : form.editingId
          ? undefined
          : {};
    const payload = { name: form.name, url: form.url, headers };

    if (form.editingId) {
      await updateMcpServerAction(form.editingId, payload);
    } else {
      await createMcpServerAction(payload);
    }
    setForm(EMPTY_FORM);
    await refresh();
    onServersChange();
  };

  const remove = async (id: string) => {
    await deleteMcpServerAction(id);
    if (form.editingId === id) {
      setForm(EMPTY_FORM);
    }
    await refresh();
    onServersChange();
  };

  const toggleEnabled = async (server: ManagedMcpServer) => {
    // En-têtes non fournis → conservés côté serveur.
    await updateMcpServerAction(server.id, {
      name: server.name,
      url: server.url,
      enabled: !server.enabled,
    });
    await refresh();
    onServersChange();
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogTrigger asChild>
        <PromptInputButton tooltip="Serveurs MCP">
          <ServerIcon className="size-4" />
          <span>MCP</span>
          {count > 0 && (
            <Badge className="px-1.5" variant="secondary">
              {count}
            </Badge>
          )}
        </PromptInputButton>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Serveurs MCP</DialogTitle>
          <DialogDescription>
            Les outils exposés par ces serveurs (transport HTTP) sont proposés au
            modèle. Les en-têtes restent côté serveur.
          </DialogDescription>
        </DialogHeader>

        <div className="flex max-h-52 flex-col gap-1.5 overflow-y-auto">
          {servers.length === 0 ? (
            <p className="rounded-md border border-dashed p-4 text-center text-muted-foreground text-sm">
              Aucun serveur. Ajoutez-en un ci-dessous.
            </p>
          ) : (
            servers.map((server) => (
              <div
                className={cn(
                  "flex items-center gap-3 rounded-md border px-3 py-2",
                  form.editingId === server.id && "border-primary/40 bg-muted/40"
                )}
                key={server.id}
              >
                <ServerIcon className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-sm">{server.name}</p>
                    {server.headerKeys.length > 0 && (
                      <Badge className="shrink-0 px-1.5" variant="secondary">
                        {server.headerKeys.join(", ")}
                      </Badge>
                    )}
                  </div>
                  <p className="truncate text-muted-foreground text-xs">
                    {server.url}
                  </p>
                </div>
                <Switch
                  aria-label={server.enabled ? "Désactiver" : "Activer"}
                  checked={server.enabled}
                  onCheckedChange={() => toggleEnabled(server)}
                />
                <Button
                  onClick={() => startEdit(server)}
                  size="sm"
                  variant="ghost"
                >
                  Modifier
                </Button>
                <Button
                  aria-label={`Supprimer ${server.name}`}
                  onClick={() => remove(server.id)}
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
          className="flex flex-col gap-3 border-t pt-4"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <div className="grid grid-cols-[1fr_2fr] gap-3">
            <Field label="Nom">
              <Input
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="brewly"
                value={form.name}
              />
            </Field>
            <Field label="URL">
              <Input
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, url: event.target.value }))
                }
                placeholder="http://localhost:8080/mcp"
                type="url"
                value={form.url}
              />
            </Field>
          </div>

          <Field label="En-têtes personnalisés (optionnel, une par ligne)">
            <Textarea
              className="min-h-16 font-mono text-xs"
              onChange={(event) =>
                setForm((prev) => ({ ...prev, headers: event.target.value }))
              }
              placeholder={
                isEditing
                  ? "•••• (laisser vide pour conserver)"
                  : "Authorization: Bearer xxx"
              }
              value={form.headers}
            />
          </Field>

          <div className="flex justify-end gap-2">
            {isEditing && (
              <Button
                onClick={() => setForm(EMPTY_FORM)}
                type="button"
                variant="ghost"
              >
                Annuler
              </Button>
            )}
            <Button type="submit">
              <PlusIcon className="size-4" />
              {isEditing ? "Enregistrer" : "Ajouter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-muted-foreground text-xs">{label}</label>
      {children}
    </div>
  );
}
