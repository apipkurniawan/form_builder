import { useEffect, useState } from "react";
import {
  createField,
  INITIAL_FORM,
  moveField,
  readSavedForm,
  STORAGE_KEY,
} from "@/lib/form-builder";
import type { Field, FieldType, FormState } from "@/lib/form-builder";

export function useFormBuilder() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [selectedId, setSelectedId] = useState<string | null>("name");
  const [hydrated, setHydrated] = useState(false);
  const selectedField = form.fields.find((field) => field.id === selectedId) ?? null;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = readSavedForm();
      if (saved) {
        setForm(saved);
        setSelectedId(saved.fields[0]?.id ?? null);
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
  }, [form, hydrated]);

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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
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
