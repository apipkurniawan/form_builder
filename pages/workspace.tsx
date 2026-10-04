import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/form-builder/icon";
import {
  createWorkspaceForm,
  deleteWorkspaceForm,
  duplicateWorkspaceForm,
  getWorkspaceForms,
} from "@/lib/workspace";
import type { WorkspaceForm } from "@/lib/workspace";
import { loadWorkspaceForms, syncWorkspace } from "@/lib/workspace-repository";
import type { StorageStatus } from "@/lib/workspace-repository";

type SortOrder = "latest" | "oldest" | "name";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function FormRow({
  item,
  onDuplicate,
  onDelete,
}: {
  item: WorkspaceForm;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="group flex items-center gap-4 border-b border-[#edf0eb] px-4 py-4 last:border-b-0 hover:bg-[#fbfcfa] sm:px-6">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#eaf3e8] text-[#347b50]">
        <Icon name="text" size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <Link
          href={`/forms/${item.id}`}
          className="block truncate text-sm font-bold text-[#29352c] hover:text-[#176443]"
        >
          {item.form.title || "Formulir tanpa judul"}
        </Link>
        <p className="mt-1 truncate text-[11px] text-[#98a298]">
          {item.form.description || "Belum ada deskripsi"}
        </p>
      </div>
      <div className="hidden w-24 shrink-0 text-xs text-[#657365] sm:block">
        {item.form.fields.length} field
      </div>
      <div className="hidden w-28 shrink-0 text-xs text-[#657365] md:block">
        {formatDate(item.updatedAt)}
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={() => onDuplicate(item.id)}
          aria-label={`Duplikat ${item.form.title}`}
          title="Duplikat"
          className="grid size-8 place-items-center rounded-md text-[#8b9a8d] hover:bg-[#edf5eb] hover:text-[#347b50]"
        >
          <Icon name="copy" size={16} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          aria-label={`Hapus ${item.form.title}`}
          title="Hapus"
          className="grid size-8 place-items-center rounded-md text-[#8b9a8d] hover:bg-[#fff0ee] hover:text-[#bd5148]"
        >
          <Icon name="trash" size={16} />
        </button>
        <Link
          href={`/forms/${item.id}`}
          aria-label={`Buka ${item.form.title}`}
          className="ml-1 grid size-8 place-items-center rounded-md text-[#61846a] hover:bg-[#edf5eb] hover:text-[#176443]"
        >
          <Icon name="arrow" size={17} />
        </Link>
      </div>
    </div>
  );
}

export default function WorkspacePage() {
  const router = useRouter();
  const [forms, setForms] = useState<WorkspaceForm[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [storageStatus, setStorageStatus] = useState<StorageStatus | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOrder>("latest");

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      void loadWorkspaceForms().then(({ forms: saved, status }) => {
        if (cancelled) return;
        setForms(saved);
        setStorageStatus(status);
        setLoaded(true);
      });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  const visibleForms = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("id-ID");
    const filtered = forms.filter((item) =>
      `${item.form.title} ${item.form.description}`.toLocaleLowerCase("id-ID").includes(query),
    );
    return filtered.sort((a, b) => {
      if (sort === "name") return a.form.title.localeCompare(b.form.title, "id-ID");
      return sort === "oldest"
        ? a.updatedAt.localeCompare(b.updatedAt)
        : b.updatedAt.localeCompare(a.updatedAt);
    });
  }, [forms, search, sort]);

  function createForm() {
    const item = createWorkspaceForm();
    void syncWorkspace();
    void router.push(`/forms/${item.id}`);
  }

  function duplicateForm(id: string) {
    duplicateWorkspaceForm(id);
    setForms(getWorkspaceForms());
    void syncWorkspace().then(setStorageStatus);
  }

  function deleteForm(id: string) {
    const item = forms.find((form) => form.id === id);
    if (!item || !window.confirm(`Hapus "${item.form.title || "Formulir tanpa judul"}"?`)) return;
    deleteWorkspaceForm(id);
    setForms(getWorkspaceForms());
    void syncWorkspace().then(setStorageStatus);
  }

  const totalFields = forms.reduce((sum, item) => sum + item.form.fields.length, 0);

  return (
    <>
      <Head>
        <title>Workspace — Formcraft</title>
        <meta name="description" content="Kelola semua formulir Anda dalam satu workspace." />
      </Head>
      <div className="min-h-screen bg-[#f8f9f6] font-sans text-[#202b22]">
        <header className="flex h-[73px] items-center justify-between border-b border-[#e9ece7] bg-white px-5 md:px-8">
          <Link
            href="/workspace"
            className="flex items-center gap-2.5 text-[22px] font-extrabold tracking-[-.07em]"
          >
            <span className="grid size-7 -rotate-6 grid-cols-2 place-content-center gap-[3px] rounded-lg bg-[#166844] p-[7px]">
              <span className="rounded-[1px] bg-[#e5f2dc]" />
              <span className="rounded-[1px] bg-[#e5f2dc] opacity-55" />
              <span className="rounded-[1px] bg-[#e5f2dc] opacity-70" />
              <span className="rounded-[1px] bg-[#e5f2dc]" />
            </span>
            <span>
              formcraft<span className="text-[#62a27b]">.</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-[#91a093] sm:inline">Ruang kerja Anda</span>
            <span className="grid size-9 place-items-center rounded-full bg-[#eaf3e8] text-xs font-bold text-[#2c764a]">
              W
            </span>
          </div>
        </header>
        <div className="mx-auto max-w-[1440px] md:grid md:min-h-[calc(100vh-73px)] md:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="hidden border-r border-[#e9ece7] bg-white px-4 py-8 md:block">
            <p className="mb-4 px-3 text-[10px] font-extrabold tracking-[.14em] text-[#9baa9b]">
              WORKSPACE
            </p>
            <div className="flex items-center gap-3 rounded-lg bg-[#eaf3e8] px-3 py-3 text-xs font-bold text-[#1e6842]">
              <Icon name="grid" size={17} /> Semua formulir
              <span className="ml-auto rounded-md bg-white px-1.5 py-0.5 text-[10px]">
                {forms.length}
              </span>
            </div>
            <button
              type="button"
              onClick={createForm}
              disabled={!loaded}
              className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-xs font-semibold text-[#69796b] hover:bg-[#f5f8f3]"
            >
              <Icon name="plus" size={17} /> Buat formulir
            </button>
            <div className="mt-10 rounded-xl border border-[#e1eee0] bg-[#f1f7ef] p-4">
              <span className="mb-3 grid size-8 place-items-center rounded-lg bg-white text-[#4b8c5c]">
                <Icon name="spark" size={18} />
              </span>
              <p className="text-xs font-bold">Semua ide dimulai di sini</p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-[#7e9681]">
                Buat formulir baru, susun pertanyaan, lalu lihat hasilnya secara langsung.
              </p>
            </div>
          </aside>
          <main className="min-w-0 px-4 py-8 sm:px-7 md:px-10 md:py-10 lg:px-14">
            <div className="mx-auto max-w-[990px]">
              <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span className="text-[10px] font-extrabold tracking-[.14em] text-[#6e9b78]">
                    RUANG KERJA
                  </span>
                  <h1 className="mt-2 text-[27px] font-bold tracking-tight sm:text-[31px]">
                    Workspace
                  </h1>
                  <p className="mt-1.5 text-xs text-[#8d9a8e] sm:text-sm">
                    Semua formulir Anda, tersusun dalam satu tempat.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={createForm}
                  disabled={!loaded}
                  className="flex h-10 items-center gap-2 rounded-lg bg-[#176443] px-4 text-xs font-bold text-white shadow-sm hover:bg-[#104e34]"
                >
                  <Icon name="plus" size={18} /> Formulir baru
                </button>
              </div>
              <div className="relative mb-8 overflow-hidden rounded-2xl bg-[#165b3d] px-6 py-6 text-white sm:px-8 sm:py-7">
                <span className="pointer-events-none absolute -top-20 -right-8 size-52 rounded-full border-[36px] border-white/5" />
                <span className="pointer-events-none absolute right-24 -bottom-20 size-40 rounded-full border-[28px] border-white/5" />
                <div className="relative flex flex-wrap items-center justify-between gap-6">
                  <div>
                    <span className="text-[10px] font-bold tracking-[.13em] text-[#a8d3b2]">
                      RINGKASAN WORKSPACE
                    </span>
                    <h2 className="mt-2 text-lg font-bold">Formulir siap Anda kelola</h2>
                    <p className="mt-1 text-xs text-[#b9d9c1]">
                      Lanjutkan pekerjaan atau mulai formulir baru kapan saja.
                    </p>
                  </div>
                  <div className="flex gap-7 sm:gap-10">
                    <div>
                      <strong className="block text-[28px] leading-none">{forms.length}</strong>
                      <span className="mt-1.5 block text-[11px] text-[#b9d9c1]">Formulir</span>
                    </div>
                    <div className="border-l border-white/20 pl-7 sm:pl-10">
                      <strong className="block text-[28px] leading-none">{totalFields}</strong>
                      <span className="mt-1.5 block text-[11px] text-[#b9d9c1]">Total field</span>
                    </div>
                  </div>
                </div>
              </div>
              <section className="overflow-hidden rounded-xl border border-[#e6ebe4] bg-white shadow-[0_10px_32px_rgba(37,57,34,.035)]">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#edf0eb] px-4 py-5 sm:px-6">
                  <div>
                    <h2 className="text-base font-bold">Semua formulir</h2>
                    <p className="mt-1 text-[11px] text-[#99a39a]">
                      {forms.length} formulir dalam workspace Anda
                    </p>
                  </div>
                  <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                    <label className="relative min-w-0 flex-1 sm:w-52 sm:flex-none">
                      <span className="sr-only">Cari formulir</span>
                      <span className="pointer-events-none absolute top-2.5 left-3 text-[#a0ada1]">
                        <Icon name="search" size={16} />
                      </span>
                      <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Cari formulir..."
                        className="h-9 w-full rounded-lg border border-[#e4eae2] bg-white pr-3 pl-9 text-xs outline-none placeholder:text-[#aab5a9] focus:border-[#87b891] focus:ring-2 focus:ring-[#e6f3e5]"
                      />
                    </label>
                    <select
                      aria-label="Urutkan formulir"
                      value={sort}
                      onChange={(event) => setSort(event.target.value as SortOrder)}
                      className="h-9 rounded-lg border border-[#e4eae2] bg-white px-3 text-xs text-[#536454] outline-none focus:border-[#87b891]"
                    >
                      <option value="latest">Terbaru</option>
                      <option value="oldest">Terlama</option>
                      <option value="name">Nama A–Z</option>
                    </select>
                  </div>
                </div>
                <div className="hidden items-center gap-4 border-b border-[#edf0eb] bg-[#fbfcfa] px-6 py-3 text-[10px] font-extrabold tracking-wider text-[#9ba99c] sm:flex">
                  <span className="flex-1">FORMULIR</span>
                  <span className="w-24 shrink-0">FIELD</span>
                  <span className="hidden w-28 shrink-0 md:block">DIPERBARUI</span>
                  <span className="w-[126px] shrink-0 text-right">AKSI</span>
                </div>
                {!loaded ? (
                  <p className="px-6 py-12 text-center text-xs text-[#95a196]">
                    Memuat formulir...
                  </p>
                ) : visibleForms.length ? (
                  visibleForms.map((item) => (
                    <FormRow
                      key={item.id}
                      item={item}
                      onDuplicate={duplicateForm}
                      onDelete={deleteForm}
                    />
                  ))
                ) : (
                  <div className="px-6 py-14 text-center">
                    <span className="mx-auto grid size-12 place-items-center rounded-xl bg-[#eef6ec] text-[#4c8b5e]">
                      <Icon name={search ? "search" : "plus"} size={24} />
                    </span>
                    <h3 className="mt-4 text-sm font-bold">
                      {search ? "Formulir tidak ditemukan" : "Belum ada formulir"}
                    </h3>
                    <p className="mt-1.5 text-xs text-[#96a197]">
                      {search
                        ? "Coba kata kunci lain untuk menemukan formulir Anda."
                        : "Mulai dengan membuat formulir pertama Anda."}
                    </p>
                    {!search && (
                      <button
                        type="button"
                        onClick={createForm}
                        className="mt-5 rounded-lg bg-[#176443] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#104e34]"
                      >
                        Buat formulir
                      </button>
                    )}
                  </div>
                )}
              </section>
              <p className="mt-5 text-center text-[11px] text-[#a0aaa0]">
                {storageStatus?.message || "Memeriksa penyimpanan..."}
              </p>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
