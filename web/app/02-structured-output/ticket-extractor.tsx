"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import { useState } from "react";
import {
  ChatError,
  ModelManagerDialog,
  useModels,
} from "@/components/chat";
import { ChatModelSelector } from "@/components/chat/chat-model-selector";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Textarea } from "@/components/ui/textarea";
import { EXAMPLE_EMAILS, type Ticket, ticketSchema } from "./schema";
import { TicketCard } from "./ticket-card";

type Mode = "stream" | "generate";

const MODE_HINT: Record<Mode, string> = {
  stream:
    "streamObject : les champs se remplissent un par un, dès les premiers tokens.",
  generate:
    "generateObject : rien ne s’affiche, puis le ticket complet apparaît d’un coup.",
};

/**
 * Vue de l'exercice 2 : un email client en entrée → un ticket structuré en
 * sortie. Deux modes pour comparer `streamObject` (remplissage progressif) et
 * `generateObject` (objet complet d'un bloc). Ce n'est pas un chat.
 */
export function TicketExtractor() {
  const [email, setEmail] = useState("");
  const [mode, setMode] = useState<Mode>("stream");
  const [chosenModel, setChosenModel] = useState<string | null>(null);
  const { options: models, refresh: refreshModels } = useModels();

  // Modèle effectif : le choix de l'utilisateur s'il est valide, sinon le
  // premier disponible. Dérivé au render → pas d'effet ni de désync.
  const model =
    chosenModel && models.some((option) => option.id === chosenModel)
      ? chosenModel
      : (models[0]?.id ?? "");

  // Mode streaming : `useObject` remplit `object` progressivement.
  const {
    object,
    submit,
    isLoading: streaming,
    error: streamError,
    stop,
    clear,
  } = useObject({
    api: "/api/02-structured-output",
    schema: ticketSchema,
  });

  // Mode one-shot : un simple fetch, l'objet arrive complet (ou une erreur).
  const [oneShot, setOneShot] = useState<Ticket | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<Error | null>(null);

  // On projette les deux modes sur le même affichage.
  const ticket: Partial<Ticket> | undefined =
    mode === "stream" ? (object as Partial<Ticket> | undefined) : (oneShot ?? undefined);
  const isLoading = mode === "stream" ? streaming : generating;
  const error = mode === "stream" ? streamError : genError;

  const reset = () => {
    clear();
    setOneShot(null);
    setGenError(null);
  };

  const switchMode = (next: Mode) => {
    if (next === mode) {
      return;
    }
    reset();
    setMode(next);
  };

  const runGenerate = async () => {
    setGenerating(true);
    setGenError(null);
    setOneShot(null);
    try {
      const response = await fetch("/api/02-structured-output", {
        body: JSON.stringify({ email, model, mode: "generate" }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? `Erreur ${response.status}`);
      }
      setOneShot(data.object as Ticket);
    } catch (caught) {
      setGenError(caught instanceof Error ? caught : new Error(String(caught)));
    } finally {
      setGenerating(false);
    }
  };

  const analyze = () => {
    if (!(email.trim() && model) || isLoading) {
      return;
    }
    if (mode === "stream") {
      setOneShot(null);
      submit({ email, model, mode: "stream" });
    } else {
      clear();
      runGenerate();
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-2xl space-y-4 p-4 md:p-6">
        <header className="space-y-1">
          <h2 className="font-heading font-semibold text-lg tracking-tight">
            Boîte mail du support
          </h2>
          <p className="text-muted-foreground text-sm">
            Colle un email client : l’IA en extrait un ticket structuré et typé.
          </p>
        </header>

        <div className="flex flex-wrap items-center gap-2">
          {models.length > 0 && (
            <ChatModelSelector
              models={models}
              onValueChange={setChosenModel}
              value={model}
            />
          )}
          <ModelManagerDialog
            count={models.length}
            onModelsChange={refreshModels}
          />
        </div>

        <div className="space-y-1.5">
          <ButtonGroup>
            <Button
              onClick={() => switchMode("stream")}
              size="sm"
              variant={mode === "stream" ? "default" : "outline"}
            >
              Streaming
            </Button>
            <Button
              onClick={() => switchMode("generate")}
              size="sm"
              variant={mode === "generate" ? "default" : "outline"}
            >
              One-shot
            </Button>
          </ButtonGroup>
          <p className="text-muted-foreground text-xs">{MODE_HINT[mode]}</p>
        </div>

        <Textarea
          className="min-h-32"
          onChange={(newEvent) => setEmail(newEvent.target.value)}
          placeholder="Coller l’email d’un client…"
          value={email}
        />

        <div className="flex flex-wrap gap-2">
          {EXAMPLE_EMAILS.map((example) => (
            <Button
              key={example.label}
              onClick={() => setEmail(example.body)}
              size="sm"
              variant="outline"
            >
              {example.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            disabled={!(email.trim() && model) || isLoading}
            onClick={analyze}
          >
            {isLoading ? "Analyse…" : "Analyser l’email"}
          </Button>
          {mode === "stream" && isLoading && (
            <Button onClick={() => stop()} size="sm" variant="ghost">
              Arrêter
            </Button>
          )}
          {models.length === 0 && (
            <span className="text-muted-foreground text-xs">
              Ajoute un modèle via « Modèles » pour lancer l’analyse.
            </span>
          )}
        </div>

        {error && <ChatError error={error} />}

        {ticket && (
          <section className="space-y-2">
            <h3 className="font-medium text-sm">Ticket extrait</h3>
            <TicketCard ticket={ticket} />
          </section>
        )}
      </div>
    </div>
  );
}
