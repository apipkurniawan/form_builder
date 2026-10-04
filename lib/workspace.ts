import { INITIAL_FORM, readSavedForm } from "./form-builder";
import type { FormState } from "./form-builder";

export type WorkspaceForm = {
  id: string;
  form: FormState;
  createdAt: string;
  updatedAt: string;
};

const WORKSPACE_KEY = "formcraft-workspace-v1";

function isWorkspaceForm(value: unknown): value is WorkspaceForm {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Partial<WorkspaceForm>;
  return (
    typeof item.id === "string" &&
    typeof item.createdAt === "string" &&
    typeof item.updatedAt === "string" &&
    typeof item.form?.title === "string" &&
    typeof item.form.description === "string" &&
    Array.isArray(item.form.fields)
  );
}

function writeWorkspace(forms: WorkspaceForm[]) {
  localStorage.setItem(WORKSPACE_KEY, JSON.stringify(forms));
}

export function getWorkspaceForms(): WorkspaceForm[] {
  try {
    const stored = localStorage.getItem(WORKSPACE_KEY);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed.filter(isWorkspaceForm);
    }
  } catch {
    // Start a fresh workspace if a previous value is invalid.
  }

  const now = new Date().toISOString();
  const firstForm: WorkspaceForm = {
    id: crypto.randomUUID(),
    form: readSavedForm() ?? INITIAL_FORM,
    createdAt: now,
    updatedAt: now,
  };
  writeWorkspace([firstForm]);
  return [firstForm];
}

export function getWorkspaceForm(id: string): WorkspaceForm | null {
  return getWorkspaceForms().find((item) => item.id === id) ?? null;
}

export function createWorkspaceForm(): WorkspaceForm {
  const now = new Date().toISOString();
  const item: WorkspaceForm = {
    id: crypto.randomUUID(),
    form: { title: "Formulir tanpa judul", description: "", fields: [] },
    createdAt: now,
    updatedAt: now,
  };
  writeWorkspace([item, ...getWorkspaceForms()]);
  return item;
}

export function saveWorkspaceForm(id: string, form: FormState) {
  const forms = getWorkspaceForms();
  if (!forms.some((item) => item.id === id)) return;
  writeWorkspace(
    forms.map((item) =>
      item.id === id ? { ...item, form, updatedAt: new Date().toISOString() } : item,
    ),
  );
}

export function duplicateWorkspaceForm(id: string): WorkspaceForm | null {
  const forms = getWorkspaceForms();
  const source = forms.find((item) => item.id === id);
  if (!source) return null;
  const now = new Date().toISOString();
  const duplicate: WorkspaceForm = {
    id: crypto.randomUUID(),
    form: {
      ...source.form,
      title: `${source.form.title || "Formulir tanpa judul"} (salinan)`,
      fields: source.form.fields.map((field) => ({
        ...field,
        id: crypto.randomUUID(),
        options: [...field.options],
      })),
    },
    createdAt: now,
    updatedAt: now,
  };
  writeWorkspace([duplicate, ...forms]);
  return duplicate;
}

export function deleteWorkspaceForm(id: string) {
  writeWorkspace(getWorkspaceForms().filter((item) => item.id !== id));
}
