import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { readSavedForm } from "./form-builder";
import {
  clearPendingSync,
  getPendingSync,
  getWorkspaceForms,
  peekWorkspaceForms,
  replaceLocalWorkspace,
} from "./workspace";
import type { WorkspaceForm } from "./workspace";

export type StorageStatus = {
  mode: "supabase" | "local";
  message: string;
};

type RemoteContext = { client: SupabaseClient; userId: string };
type FormRow = {
  id: string;
  form: WorkspaceForm["form"];
  created_at: string;
  updated_at: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const migrationKeyPrefix = "formcraft-supabase-migrated-";
let connection: Promise<RemoteContext | null> | null = null;
let connectionError = "";
let retryAfter = 0;
let syncQueue: Promise<StorageStatus> = Promise.resolve({
  mode: "local",
  message: "Data tersimpan di browser ini.",
});

function withTimeout<T>(operation: PromiseLike<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error("Waktu koneksi habis")), 8000);
    Promise.resolve(operation).then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function localStatus(): StorageStatus {
  return {
    mode: "local",
    message:
      supabaseUrl && supabaseKey
        ? `Supabase belum terhubung${connectionError ? `: ${connectionError}` : ""}. Data tersimpan lokal.`
        : "Mode lokal: tambahkan konfigurasi Supabase untuk menyimpan ke database.",
  };
}

function remoteStatus(): StorageStatus {
  return { mode: "supabase", message: "Terhubung ke Supabase. Formulir tersimpan di database." };
}

async function connect(): Promise<RemoteContext | null> {
  if (!supabaseUrl || !supabaseKey) return null;
  if (Date.now() < retryAfter) return null;
  if (connectionError) {
    connection = null;
    connectionError = "";
  }
  if (!connection) {
    connection = (async () => {
      try {
        const client = createClient(supabaseUrl, supabaseKey);
        const { data: userData } = await withTimeout(client.auth.getUser());
        let user = userData.user;
        if (!user) {
          const { data, error } = await withTimeout(client.auth.signInAnonymously());
          if (error || !data.user) throw new Error(error?.message || "Login anonim gagal");
          user = data.user;
        }
        const probe = await withTimeout(client.from("formcraft_forms").select("id").limit(1));
        if (probe.error) throw new Error(probe.error.message);
        connectionError = "";
        retryAfter = 0;
        return { client, userId: user.id };
      } catch (error) {
        connectionError = error instanceof Error ? error.message : "Koneksi gagal";
        retryAfter = Date.now() + 15000;
        connection = null;
        return null;
      }
    })();
  }
  return connection;
}

function asWorkspaceForm(row: FormRow): WorkspaceForm {
  return {
    id: row.id,
    form: row.form,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function asFormRow(item: WorkspaceForm, userId: string) {
  return {
    id: item.id,
    owner_id: userId,
    form: item.form,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
  };
}

async function fetchRemoteForms(context: RemoteContext): Promise<WorkspaceForm[]> {
  const { data, error } = await withTimeout(
    context.client
      .from("formcraft_forms")
      .select("id, form, created_at, updated_at")
      .eq("owner_id", context.userId)
      .order("updated_at", { ascending: false }),
  );
  if (error) throw new Error(error.message);
  return ((data ?? []) as FormRow[]).map(asWorkspaceForm);
}

async function flushPending(context: RemoteContext) {
  const pending = getPendingSync();
  const upsertIds = new Set(Object.keys(pending.upserts));
  const upserts = (upsertIds.size ? peekWorkspaceForms() || [] : [])
    .filter((item) => upsertIds.has(item.id))
    .map((item) => asFormRow(item, context.userId));
  if (upserts.length) {
    const { error } = await withTimeout(
      context.client.from("formcraft_forms").upsert(upserts, { onConflict: "id" }),
    );
    if (error) throw new Error(error.message);
  }
  const deletedIds = Object.keys(pending.deletes);
  if (deletedIds.length) {
    const { error } = await withTimeout(
      context.client
        .from("formcraft_forms")
        .delete()
        .eq("owner_id", context.userId)
        .in("id", deletedIds),
    );
    if (error) throw new Error(error.message);
  }
  clearPendingSync(pending);
}

function disconnect(error: unknown) {
  connectionError = error instanceof Error ? error.message : "Koneksi gagal";
  retryAfter = Date.now() + 15000;
  connection = null;
}

export function syncWorkspace(): Promise<StorageStatus> {
  syncQueue = syncQueue.then(async () => {
    const context = await connect();
    if (!context) return localStatus();
    try {
      await flushPending(context);
      return remoteStatus();
    } catch (error) {
      disconnect(error);
      return localStatus();
    }
  });
  return syncQueue;
}

export async function loadWorkspaceForms(): Promise<{
  forms: WorkspaceForm[];
  status: StorageStatus;
}> {
  const status = await syncWorkspace();
  if (status.mode === "local") return { forms: getWorkspaceForms(), status };

  const context = await connect();
  if (!context) return { forms: getWorkspaceForms(), status: localStatus() };
  try {
    let forms = await fetchRemoteForms(context);
    const migrationKey = `${migrationKeyPrefix}${context.userId}`;
    if (!localStorage.getItem(migrationKey)) {
      const remoteIds = new Set(forms.map((item) => item.id));
      const local =
        peekWorkspaceForms() || (forms.length === 0 || readSavedForm() ? getWorkspaceForms() : []);
      const missing = local.filter((item) => !remoteIds.has(item.id));
      if (missing.length) {
        const { error } = await withTimeout(
          context.client.from("formcraft_forms").upsert(
            missing.map((item) => asFormRow(item, context.userId)),
            { onConflict: "id" },
          ),
        );
        if (error) throw new Error(error.message);
        forms = await fetchRemoteForms(context);
      }
      localStorage.setItem(migrationKey, "1");
    }
    replaceLocalWorkspace(forms);
    return { forms, status: remoteStatus() };
  } catch (error) {
    disconnect(error);
    return { forms: getWorkspaceForms(), status: localStatus() };
  }
}

export async function loadWorkspaceForm(id: string) {
  const result = await loadWorkspaceForms();
  return { form: result.forms.find((item) => item.id === id) ?? null, status: result.status };
}
