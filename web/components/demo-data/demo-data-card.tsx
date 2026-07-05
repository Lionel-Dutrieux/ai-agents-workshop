"use client";

import { CheckIcon, DatabaseIcon, Loader2Icon, RefreshCwIcon } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SeedResult, SeedStatus } from "@/lib/dal/seed";
import { getSeedStatusAction, seedDatabaseAction } from "./demo-data-actions";

/**
 * Carte « Données de démonstration » de l'accueil : point de contrôle unique
 * pour (ré)initialiser les données du workshop via le seeder centralisé. Le
 * seeding n'est jamais automatique — c'est un clic explicite et rejouable.
 */
export function DemoDataCard() {
  const [status, setStatus] = useState<SeedStatus | null>(null);
  const [result, setResult] = useState<SeedResult | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    getSeedStatusAction().then((next) => {
      if (active) {
        setStatus(next);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const runSeed = () => {
    setResult(null);
    startTransition(async () => {
      const seeded = await seedDatabaseAction();
      setResult(seeded);
      setStatus(await getSeedStatusAction());
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-4">
          <DatabaseIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          <div className="flex-1">
            <CardTitle>Données de démonstration</CardTitle>
            <CardDescription className="mt-1">
              Peuple la base SQLite avec le jeu de données du workshop (catalogue
              Brewly, exemples sandbox) et repart d&apos;un historique de chat
              vierge. Les modèles LLM et serveurs MCP que vous avez ajoutés sont{" "}
              <strong>préservés</strong>.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-muted-foreground text-sm">
          <span>
            Catalogue&nbsp;:{" "}
            <span className="font-medium text-foreground">
              {status ? status.products : "…"}
            </span>{" "}
            produits
          </span>
          <span>
            Sandbox&nbsp;:{" "}
            <span className="font-medium text-foreground">
              {status ? status.sandboxItems : "…"}
            </span>{" "}
            items
          </span>
          <span>
            Conversations&nbsp;:{" "}
            <span className="font-medium text-foreground">
              {status ? status.conversations : "…"}
            </span>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button disabled={pending} variant="outline">
                {pending ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  <RefreshCwIcon className="size-4" />
                )}
                {pending ? "Initialisation…" : "Réinitialiser les données de démo"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Réinitialiser les données de démo ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Le catalogue Brewly et les exemples de la sandbox seront remis à
                  leur état d&apos;origine, et l&apos;historique de chat sera
                  effacé. Vos modèles LLM et serveurs MCP ne sont pas touchés.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={runSeed}>
                  Réinitialiser
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {result && !pending && (
            <span className="flex items-center gap-1.5 text-emerald-600 text-sm dark:text-emerald-500">
              <CheckIcon className="size-4" />
              {result.products} produits · {result.sandboxItems} items ·{" "}
              {result.conversationsCleared} conversation
              {result.conversationsCleared > 1 ? "s" : ""} effacée
              {result.conversationsCleared > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
