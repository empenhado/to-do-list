"use client";

import { useId, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { taskSchema, type TaskFormData } from "@/lib/validations";

type Result = { success: true } | { success: false; error: string };

type TaskFormProps = {
  defaultValues?: TaskFormData;
  submitLabel: string;
  successMessage: string;
  onSubmit: (data: TaskFormData) => Promise<Result>;
  onSuccess?: () => void;
  onCancel?: () => void;
  resetOnSuccess?: boolean;
};

const emptyValues: TaskFormData = { title: "", description: "" };

export function TaskForm({
  defaultValues = emptyValues,
  submitLabel,
  successMessage,
  onSubmit,
  onSuccess,
  onCancel,
  resetOnSuccess = false,
}: TaskFormProps) {
  const id = useId(); // evita ids repetidos quando há mais de um formulário na tela
  const [isPending, startTransition] = useTransition();

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues,
  });

  function handleSubmit(data: TaskFormData) {
    startTransition(async () => {
      const res = await onSubmit(data);
      if (res.success) {
        toast.success(successMessage);
        if (resetOnSuccess) form.reset(emptyValues);
        onSuccess?.();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <FieldGroup>
        <Controller
          name="title"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${id}-title`}>Título</FieldLabel>
              <Input
                {...field}
                id={`${id}-title`}
                aria-invalid={fieldState.invalid}
                placeholder="Ex.: Estudar para a prova de WEB"
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${id}-description`}>Descrição</FieldLabel>
              <InputGroup>
                <InputGroupTextarea
                  {...field}
                  id={`${id}-description`}
                  aria-invalid={fieldState.invalid}
                  placeholder="Detalhes da tarefa (opcional)"
                  rows={4}
                  className="min-h-24 resize-none"
                />
                <InputGroupAddon align="block-end">
                  <InputGroupText className="tabular-nums">
                    {field.value.length}/500 caracteres
                  </InputGroupText>
                </InputGroupAddon>
              </InputGroup>
              <FieldDescription>Campo opcional.</FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <div className="flex justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        ) : (
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Limpar
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}