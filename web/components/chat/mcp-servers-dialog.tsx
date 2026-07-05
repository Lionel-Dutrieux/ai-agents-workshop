"use client";

import {
  CheckCircle2,
  Coffee,
  Loader2,
  PlugZap,
  PlusIcon,
  ServerIcon,
  Trash2Icon,
  XCircle,
} from "lucide-react";
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
  type McpPingResult,
  pingMcpServerAction,
  pingMcpServerByIdAction,
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
  // Test de connexion (handshake) : id du serveur en cours de test ("form"
  // pour le formulaire), et dernier résultat affiché.
  const [pinging, setPinging] = useState<string | null>(null);
  const [pingResult, setPingResult] = useState<McpPingResult | null>(null);

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
      setPingResult(null);
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

  /** Pré-remplit le formulaire avec NOTRE serveur MCP (celui du module 5). */
  const applyBrewlyPreset = () => {
    const origin =
      typeof window === "undefined" ? "" : window.location.origin;
    setForm({
      editingId: null,
      name: "Brewly (ce projet)",
      url: `${origin}/api/mcp`,
      headers: "",
    });
    setPingResult(null);
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

  /** Teste l'URL saisie dans le formulaire (handshake + liste des outils). */
  const testForm = async () => {
    if (!form.url.trim()) {
      return;
    }
    setPinging("form");
    setPingResult(null);
    const parsed = parseHeaders(form.headers);
    try {
      const result = await pingMcpServerAction({
        url: form.url.trim(),
        headers: Object.keys(parsed).length > 0 ? parsed : undefined,
      });
      setPingResult(result);
    } catch {
      setPingResult({ ok: false, error: "URL invalide." });
    } finally {
      setPinging(null);
    }
  };

  /** Teste un serveur enregistré (rejoue ses en-têtes stockés). */
  const testServer = async (id: string) => {
    setPinging(id);
    setPingResult(null);
    setPingResult(await pingMcpServerByIdAction(id));
    setPinging(null);
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

      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
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
                  "flex items-center gap-2 rounded-md border px-3 py-2",
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
                  aria-label={`Tester ${server.name}`}
                  disabled={pinging !== null}
                  onClick={() => testServer(server.id)}
                  size="icon-sm"
                  variant="ghost"
                >
                  {pinging === server.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <PlugZap className="size-4" />
                  )}
                </Button>
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

        {pingResult && <HandshakePanel result={pingResult} />}

        <div className="flex flex-wrap items-center gap-2 border-t pt-4">
          <span className="text-muted-foreground text-xs">Preset :</span>
          <Button
            onClick={applyBrewlyPreset}
            size="sm"
            type="button"
            variant="outline"
          >
            <Coffee className="size-4" />
            Serveur Brewly (ce projet)
          </Button>
        </div>

        <form
          className="flex flex-col gap-3"
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
            <Button
              disabled={pinging !== null || !form.url.trim()}
              onClick={testForm}
              type="button"
              variant="outline"
            >
              {pinging === "form" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <PlugZap className="size-4" />
              )}
              Tester
            </Button>
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

/** Résultat visuel d'un handshake MCP : infos serveur + outils exposés. */
function HandshakePanel({ result }: { result: McpPingResult }) {
  if (!result.ok) {
    return (
      <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
        <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
        <div className="min-w-0">
          <p className="font-medium text-destructive">Connexion échouée</p>
          <p className="break-words text-muted-foreground text-xs">
            {result.error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-emerald-500/40 bg-emerald-500/5 p-3">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
        <p className="font-medium text-sm">
          Connecté — <span className="font-mono">{result.serverName}</span>{" "}
          <span className="text-muted-foreground">v{result.serverVersion}</span>
        </p>
      </div>
      <p className="mt-1 text-muted-foreground text-xs">
        Handshake OK · {result.tools.length} outil(s) exposé(s) par le protocole :
      </p>
      <ul className="mt-2 max-h-48 space-y-1.5 overflow-y-auto">
        {result.tools.map((tool) => (
          <li
            className="rounded border bg-background/60 px-2 py-1.5"
            key={tool.name}
          >
            <p className="font-mono text-xs">{tool.name}</p>
            {tool.description && (
              <p className="text-muted-foreground text-xs">{tool.description}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
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
