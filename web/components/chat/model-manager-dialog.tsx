"use client";

import { PlusIcon, SlidersHorizontalIcon, Trash2Icon } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  createModelAction,
  deleteModelAction,
  listManagedModelsAction,
  type ManagedModel,
  updateModelAction,
} from "./model-actions";
import type { ModelProvider } from "@/lib/dal/models";

type Preset = {
  label: string;
  baseUrl: string;
  modelPlaceholder: string;
  needsKey: boolean;
};

// Préréglages vérifiés en doc : LM Studio expose /v1 sur le port 1234 sans clé,
// Ollama /v1 sur 11434 sans clé, Azure AI Foundry /openai/v1 avec la clé.
const PRESETS: Record<ModelProvider, Preset> = {
  lmstudio: {
    label: "LM Studio (local)",
    baseUrl: "http://localhost:1234/v1",
    modelPlaceholder: "qwen2.5-7b-instruct",
    needsKey: false,
  },
  ollama: {
    label: "Ollama (local)",
    baseUrl: "http://localhost:11434/v1",
    modelPlaceholder: "llama3.1",
    needsKey: false,
  },
  azure: {
    label: "Azure AI Foundry",
    baseUrl: "https://<ressource>.openai.azure.com/openai/v1/",
    modelPlaceholder: "gpt-4o",
    needsKey: true,
  },
  custom: {
    label: "OpenAI-compatible",
    baseUrl: "",
    modelPlaceholder: "model-id",
    needsKey: true,
  },
};

type FormState = {
  editingId: string | null;
  label: string;
  provider: ModelProvider;
  baseUrl: string;
  modelId: string;
  apiKey: string;
  contextWindow: string;
};

const EMPTY_FORM: FormState = {
  editingId: null,
  label: "",
  provider: "lmstudio",
  baseUrl: PRESETS.lmstudio.baseUrl,
  modelId: "",
  apiKey: "",
  contextWindow: "",
};

/** Ramène une valeur libre de la base vers un type de fournisseur connu. */
function coerceProvider(value: string): ModelProvider {
  return value in PRESETS ? (value as ModelProvider) : "custom";
}

export type ModelManagerDialogProps = {
  /** Nombre de modèles activés (badge du déclencheur). */
  count: number;
  /** Appelé après tout changement, pour rafraîchir le sélecteur. */
  onModelsChange: () => void;
};

/** Gestion des modèles (ajout/édition/suppression) via un dialog. */
export function ModelManagerDialog({
  count,
  onModelsChange,
}: ModelManagerDialogProps) {
  const [open, setOpen] = useState(false);
  const [models, setModels] = useState<ManagedModel[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const preset = PRESETS[form.provider];
  const isEditing = form.editingId !== null;

  const refresh = async () => {
    setModels(await listManagedModelsAction());
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      refresh();
    } else {
      setForm(EMPTY_FORM);
    }
  };

  const selectProvider = (provider: ModelProvider) => {
    setForm((prev) => ({
      ...prev,
      provider,
      // Ne pré-remplit l'URL qu'en création, pour ne pas écraser une saisie.
      baseUrl: prev.editingId ? prev.baseUrl : PRESETS[provider].baseUrl,
    }));
  };

  const startEdit = (model: ManagedModel) => {
    setForm({
      editingId: model.id,
      label: model.label,
      provider: coerceProvider(model.provider),
      baseUrl: model.baseUrl,
      modelId: model.modelId,
      apiKey: "",
      contextWindow: model.contextWindow?.toString() ?? "",
    });
  };

  const submit = async () => {
    if (!(form.label.trim() && form.baseUrl.trim() && form.modelId.trim())) {
      return;
    }
    const parsedWindow = Number.parseInt(form.contextWindow, 10);
    const payload = {
      label: form.label,
      provider: form.provider,
      baseUrl: form.baseUrl,
      modelId: form.modelId,
      apiKey: form.apiKey,
      contextWindow: Number.isFinite(parsedWindow) ? parsedWindow : null,
    };
    if (form.editingId) {
      await updateModelAction(form.editingId, payload);
    } else {
      await createModelAction(payload);
    }
    setForm(EMPTY_FORM);
    await refresh();
    onModelsChange();
  };

  const remove = async (id: string) => {
    await deleteModelAction(id);
    if (form.editingId === id) {
      setForm(EMPTY_FORM);
    }
    await refresh();
    onModelsChange();
  };

  const toggleEnabled = async (model: ManagedModel) => {
    await updateModelAction(model.id, {
      label: model.label,
      provider: coerceProvider(model.provider),
      baseUrl: model.baseUrl,
      modelId: model.modelId,
      contextWindow: model.contextWindow,
      enabled: !model.enabled,
    });
    await refresh();
    onModelsChange();
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogTrigger asChild>
        <PromptInputButton tooltip="Gérer les modèles">
          <SlidersHorizontalIcon className="size-4" />
          <span>Modèles</span>
          {count > 0 && (
            <Badge className="px-1.5" variant="secondary">
              {count}
            </Badge>
          )}
        </PromptInputButton>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Modèles</DialogTitle>
          <DialogDescription>
            Ajoutez des modèles via un endpoint OpenAI-compatible (Ollama, Azure
            AI Foundry…). Les clés restent côté serveur.
          </DialogDescription>
        </DialogHeader>

        {/* Liste des modèles existants */}
        <div className="flex max-h-52 flex-col gap-1.5 overflow-y-auto">
          {models.length === 0 ? (
            <p className="rounded-md border border-dashed p-4 text-center text-muted-foreground text-sm">
              Aucun modèle. Ajoutez-en un ci-dessous.
            </p>
          ) : (
            models.map((model) => (
              <div
                className={cn(
                  "flex items-center gap-3 rounded-md border px-3 py-2",
                  form.editingId === model.id && "border-primary/40 bg-muted/40"
                )}
                key={model.id}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-sm">{model.label}</p>
                    <Badge className="shrink-0 px-1.5" variant="secondary">
                      {model.provider}
                    </Badge>
                  </div>
                  <p className="truncate text-muted-foreground text-xs">
                    {model.modelId} · {model.baseUrl}
                  </p>
                </div>
                <Switch
                  aria-label={model.enabled ? "Désactiver" : "Activer"}
                  checked={model.enabled}
                  onCheckedChange={() => toggleEnabled(model)}
                />
                <Button
                  onClick={() => startEdit(model)}
                  size="sm"
                  variant="ghost"
                >
                  Modifier
                </Button>
                <Button
                  aria-label={`Supprimer ${model.label}`}
                  onClick={() => remove(model.id)}
                  size="icon-sm"
                  variant="ghost"
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Formulaire d'ajout / édition */}
        <form
          className="flex flex-col gap-3 border-t pt-4"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <Select
                onValueChange={(value) => selectProvider(value as ModelProvider)}
                value={form.provider}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(PRESETS) as ModelProvider[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {PRESETS[key].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Nom affiché">
              <Input
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, label: event.target.value }))
                }
                placeholder="Llama 3.1 (local)"
                value={form.label}
              />
            </Field>
          </div>

          <Field label="URL de base">
            <Input
              onChange={(event) =>
                setForm((prev) => ({ ...prev, baseUrl: event.target.value }))
              }
              placeholder={preset.baseUrl || "https://.../v1"}
              type="url"
              value={form.baseUrl}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Identifiant du modèle">
              <Input
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, modelId: event.target.value }))
                }
                placeholder={preset.modelPlaceholder}
                value={form.modelId}
              />
            </Field>
            <Field label="Contexte (tokens, optionnel)">
              <Input
                inputMode="numeric"
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    contextWindow: event.target.value,
                  }))
                }
                placeholder="128000"
                value={form.contextWindow}
              />
            </Field>
          </div>

          <Field
            label={
              preset.needsKey
                ? "Clé API"
                : "Clé API (inutile pour Ollama)"
            }
          >
            <Input
              onChange={(event) =>
                setForm((prev) => ({ ...prev, apiKey: event.target.value }))
              }
              placeholder={
                isEditing ? "•••• (laisser vide pour conserver)" : "sk-…"
              }
              type="password"
              value={form.apiKey}
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
