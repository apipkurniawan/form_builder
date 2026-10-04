import { INITIAL_FORM, readSavedForm } from "./form-builder";
import type { FormState } from "./form-builder";

export type WorkspaceForm = {
  id: string;
  form: FormState;
  createdAt: string;
  updatedAt: string;
};

const WORKSPACE_KEY = "formcraft-workspace-v1";
const PENDING_KEY = "formcraft-pending-sync-v1";

export type PendingSync = {
  upserts: Record<string, string>;
  deletes: Record<string, string>;
};

export function getPendingSync(): PendingSync {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(PENDING_KEY) || "null");
    if (
      value &&
      typeof value === "object" &&
      "upserts" in value &&
      "deletes" in value &&
      value.upserts &&
      typeof value.upserts === "object" &&
      value.deletes &&
      typeof value.deletes === "object"
    ) {
      return value as PendingSync;
    }
  } catch {
    // Ignore invalid sync metadata.
  }
  return { upserts: {}, deletes: {} };
}

function markPending(id: string, operation: "upsert" | "delete") {
  const pending = getPendingSync();
  const version = crypto.randomUUID();
  if (operation === "upsert") {
    pending.upserts[id] = version;
    delete pending.deletes[id];
  } else {
    pending.deletes[id] = version;
    delete pending.upserts[id];
  }
  localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
}

export function clearPendingSync(snapshot: PendingSync) {
  const pending = getPendingSync();
  for (const [id, version] of Object.entries(snapshot.upserts)) {
    if (pending.upserts[id] === version) delete pending.upserts[id];
  }
  for (const [id, version] of Object.entries(snapshot.deletes)) {
    if (pending.deletes[id] === version) delete pending.deletes[id];
  }
  localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
}

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

export function replaceLocalWorkspace(forms: WorkspaceForm[]) {
  writeWorkspace(forms);
}

export function peekWorkspaceForms(): WorkspaceForm[] | null {
  try {
    const stored = localStorage.getItem(WORKSPACE_KEY);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed.filter(isWorkspaceForm);
    }
  } catch {
    // Start a fresh workspace if a previous value is invalid.
  }
  return null;
}

export function getWorkspaceForms(): WorkspaceForm[] {
  const stored = peekWorkspaceForms();
  if (stored) return stored;

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
  markPending(item.id, "upsert");
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
  markPending(id, "upsert");
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
  markPending(duplicate.id, "upsert");
  return duplicate;
}

export function deleteWorkspaceForm(id: string) {
  writeWorkspace(getWorkspaceForms().filter((item) => item.id !== id));
  markPending(id, "delete");
}
