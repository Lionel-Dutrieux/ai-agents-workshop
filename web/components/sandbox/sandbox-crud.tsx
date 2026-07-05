"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable } from "./data-table";
import { SandboxForm } from "./sandbox-form";
import type { SandboxCrudConfig, SandboxValues } from "./types";

export type SandboxCrudProps<T, TInput extends SandboxValues> = {
  /** Config du CRUD. À définir au niveau module (référence stable). */
  config: SandboxCrudConfig<T, TInput>;
};

/**
 * CRUD sandbox config-driven : tableau + création / édition / suppression,
 * branché sur des Server Actions Prisma. Permet de peupler des données pour
 * tester un agent. TanStack Table + Form sont encapsulés.
 */
export function SandboxCrud<T, TInput extends SandboxValues>({
  config,
}: SandboxCrudProps<T, TInput>) {
  const [rows, setRows] = useState<T[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<T | null>(null);
  const [deletingRow, setDeletingRow] = useState<T | null>(null);

  useEffect(() => {
    let active = true;
    config.actions.list().then((next) => {
      if (active) {
        setRows(next);
      }
    });
    return () => {
      active = false;
    };
  }, [config]);

  const refresh = async () => {
    setRows(await config.actions.list());
  };

  const openCreate = () => {
    setEditingRow(null);
    setFormOpen(true);
  };

  const columns = useMemo<ColumnDef<T, unknown>[]>(() => {
    const dataColumns: ColumnDef<T, unknown>[] = config.columns.map((column) => ({
      id: column.key,
      accessorKey: column.key,
      header: column.header,
      cell: column.cell
        ? ({ row }) => column.cell?.(row.original)
        : ({ getValue }) => String(getValue() ?? ""),
    }));

    return [
      ...dataColumns,
      {
        id: "__actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end gap-0.5">
            <Button
              aria-label="Modifier"
              onClick={() => {
                setEditingRow(row.original);
                setFormOpen(true);
              }}
              size="icon-sm"
              variant="ghost"
            >
              <PencilIcon className="size-4" />
            </Button>
            <Button
              aria-label="Supprimer"
              className="text-muted-foreground"
              onClick={() => setDeletingRow(row.original)}
              size="icon-sm"
              variant="ghost"
            >
              <Trash2Icon className="size-4" />
            </Button>
          </div>
        ),
      },
    ];
  }, [config]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          {config.title && (
            <h3 className="font-medium text-sm">{config.title}</h3>
          )}
          {config.description && (
            <p className="text-muted-foreground text-xs">{config.description}</p>
          )}
        </div>
        <Button className="shrink-0" onClick={openCreate} size="sm">
          <PlusIcon className="size-4" />
          {config.addLabel ?? "Ajouter"}
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        emptyLabel={config.emptyLabel ?? "Aucune donnée. Ajoutez-en une."}
      />

      <Dialog
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) {
            setEditingRow(null);
          }
        }}
        open={formOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingRow ? "Modifier" : (config.addLabel ?? "Ajouter")}
            </DialogTitle>
            {config.description && (
              <DialogDescription>{config.description}</DialogDescription>
            )}
          </DialogHeader>
          <SandboxForm
            fields={config.fields}
            initialValues={
              editingRow ? config.toFormValues(editingRow) : config.emptyValues
            }
            key={editingRow ? config.getRowId(editingRow) : "new"}
            onCancel={() => {
              setFormOpen(false);
              setEditingRow(null);
            }}
            onSubmit={async (values) => {
              if (editingRow) {
                await config.actions.update(
                  config.getRowId(editingRow),
                  values as TInput
                );
              } else {
                await config.actions.create(values as TInput);
              }
              setFormOpen(false);
              setEditingRow(null);
              await refresh();
            }}
            submitLabel={editingRow ? "Enregistrer" : "Ajouter"}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) {
            setDeletingRow(null);
          }
        }}
        open={deletingRow !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet enregistrement ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deletingRow) {
                  await config.actions.remove(config.getRowId(deletingRow));
                  setDeletingRow(null);
                  await refresh();
                }
              }}
              variant="destructive"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
