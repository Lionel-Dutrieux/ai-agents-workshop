"use client";

import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { SandboxField, SandboxValue, SandboxValues } from "./types";

export type SandboxFormProps = {
  fields: SandboxField[];
  initialValues: SandboxValues;
  submitLabel: string;
  onSubmit: (values: SandboxValues) => Promise<void>;
  onCancel: () => void;
};

/**
 * Formulaire de création / édition piloté par une liste de champs.
 * Bâti sur TanStack Form : état contrôlé, validation, soumission asynchrone.
 */
export function SandboxForm({
  fields,
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
}: SandboxFormProps) {
  const form = useForm({
    defaultValues: initialValues,
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      {fields.map((field) => (
        <form.Field
          key={field.name}
          name={field.name}
          validators={
            field.required && field.type !== "switch"
              ? {
                  onChange: ({ value }: { value: SandboxValue }) =>
                    value === "" || value == null ? "Champ requis" : undefined,
                }
              : undefined
          }
        >
          {(fieldApi) => (
            <div className="space-y-1.5">
              <label
                className="text-muted-foreground text-xs"
                htmlFor={`sandbox-${field.name}`}
              >
                {field.label}
                {field.required && field.type !== "switch" && (
                  <span className="text-destructive"> *</span>
                )}
              </label>
              <FieldControl
                field={field}
                id={`sandbox-${field.name}`}
                onBlur={fieldApi.handleBlur}
                onChange={fieldApi.handleChange}
                value={fieldApi.state.value}
              />
              {!fieldApi.state.meta.isValid && (
                <p className="text-destructive text-xs">
                  {fieldApi.state.meta.errors.join(", ")}
                </p>
              )}
            </div>
          )}
        </form.Field>
      ))}

      <div className="flex justify-end gap-2 pt-1">
        <Button onClick={onCancel} type="button" variant="ghost">
          Annuler
        </Button>
        <form.Subscribe
          selector={(state) => ({
            canSubmit: state.canSubmit,
            isSubmitting: state.isSubmitting,
          })}
        >
          {({ canSubmit, isSubmitting }) => (
            <Button disabled={!canSubmit} type="submit">
              {isSubmitting ? "Enregistrement…" : submitLabel}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}

type FieldControlProps = {
  field: SandboxField;
  id: string;
  value: SandboxValue;
  onChange: (value: SandboxValue) => void;
  onBlur: () => void;
};

function FieldControl({ field, id, value, onChange, onBlur }: FieldControlProps) {
  switch (field.type) {
    case "textarea":
      return (
        <Textarea
          id={id}
          onBlur={onBlur}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          value={String(value ?? "")}
        />
      );
    case "switch":
      return (
        <div>
          <Switch
            checked={Boolean(value)}
            id={id}
            onCheckedChange={(checked) => onChange(checked)}
          />
        </div>
      );
    case "select":
      return (
        <Select onValueChange={(next) => onChange(next)} value={String(value ?? "")}>
          <SelectTrigger id={id}>
            <SelectValue placeholder={field.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case "number":
      return (
        <Input
          id={id}
          inputMode="numeric"
          onBlur={onBlur}
          onChange={(event) =>
            onChange(event.target.value === "" ? 0 : Number(event.target.value))
          }
          placeholder={field.placeholder}
          type="number"
          value={String(value ?? "")}
        />
      );
    default:
      return (
        <Input
          id={id}
          onBlur={onBlur}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          value={String(value ?? "")}
        />
      );
  }
}
