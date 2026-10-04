import { useEffect, useRef, useState } from "react";
import { createField, INITIAL_FORM, moveField } from "@/lib/form-builder";
import type { Field, FieldType, FormState } from "@/lib/form-builder";
import { saveWorkspaceForm } from "@/lib/workspace";
import { loadWorkspaceForm, syncWorkspace } from "@/lib/workspace-repository";
import type { StorageStatus } from "@/lib/workspace-repository";

export function useFormBuilder(formId: string | null) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [selectedId, setSelectedId] = useState<string | null>("name");
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  const [storageStatus, setStorageStatus] = useState<StorageStatus | null>(null);
  const lastSavedForm = useRef<FormState | null>(null);
  const selectedField = form.fields.find((field) => field.id === selectedId) ?? null;

  useEffect(() => {
    if (!formId) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      void loadWorkspaceForm(formId).then(({ form: saved, status }) => {
        if (cancelled) return;
        setStorageStatus(status);
        if (saved) {
          lastSavedForm.current = saved.form;
          setForm(saved.form);
          setSelectedId(saved.form.fields[0]?.id ?? null);
          setLoadedId(formId);
          setMissing(false);
        } else {
          setLoadedId(null);
          setMissing(true);
        }
      });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [formId]);

  useEffect(() => {
    if (formId && loadedId === formId && lastSavedForm.current !== form) {
      saveWorkspaceForm(formId, form);
      lastSavedForm.current = form;
      const timer = window.setTimeout(() => {
        void syncWorkspace().then(setStorageStatus);
      }, 600);
      return () => window.clearTimeout(timer);
    }
  }, [form, formId, loadedId]);

  function updateForm(changes: Partial<Pick<FormState, "title" | "description">>) {
    setForm((current) => ({ ...current, ...changes }));
  }

  function updateField(id: string, changes: Partial<Field>) {
    setForm((current) => ({
      ...current,
      fields: current.fields.map((field) => (field.id === id ? { ...field, ...changes } : field)),
    }));
  }

  function addField(type: FieldType, index?: number) {
    const field = createField(type);
    setForm((current) => {
      const fields = [...current.fields];
      fields.splice(index ?? fields.length, 0, field);
      return { ...current, fields };
    });
    setSelectedId(field.id);
  }

  function reorderField(id: string, index: number) {
    setForm((current) => ({
      ...current,
      fields: moveField(current.fields, id, index),
    }));
  }

  function removeField(id: string) {
    setForm((current) => ({
      ...current,
      fields: current.fields.filter((field) => field.id !== id),
    }));
    setSelectedId((current) => (current === id ? null : current));
  }

  function duplicateField(field: Field) {
    const duplicate = {
      ...field,
      id: crypto.randomUUID(),
      options: [...field.options],
    };
    setForm((current) => {
      const fields = [...current.fields];
      fields.splice(fields.findIndex((item) => item.id === field.id) + 1, 0, duplicate);
      return { ...current, fields };
    });
    setSelectedId(duplicate.id);
  }

  function save() {
    if (formId && loadedId === formId) {
      saveWorkspaceForm(formId, form);
      lastSavedForm.current = form;
      void syncWorkspace().then(setStorageStatus);
    }
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(form, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "formulir.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  return {
    form,
    ready: Boolean(formId && loadedId === formId),
    missing,
    storageStatus,
    selectedField,
    setSelectedId,
    updateForm,
    updateField,
    addField,
    reorderField,
    removeField,
    duplicateField,
    save,
    exportJson,
  };
}
