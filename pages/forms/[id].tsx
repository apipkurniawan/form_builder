import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { BuilderCanvas } from "@/components/form-builder/builder-canvas";
import { BuilderHeader } from "@/components/form-builder/builder-header";
import { ComponentPalette } from "@/components/form-builder/component-palette";
import { FieldSettings } from "@/components/form-builder/field-settings";
import { FormPreview } from "@/components/form-builder/form-preview";
import { Icon } from "@/components/form-builder/icon";
import { useFormBuilder } from "@/hooks/use-form-builder";
import type { FieldType } from "@/lib/form-builder";
import { DEFAULT_WORKSPACE_NAME, getWorkspaceName } from "@/lib/workspace";

type MobilePanel = "fields" | "canvas" | "settings";

export default function FormEditor() {
  const router = useRouter();
  const formId = router.isReady && typeof router.query.id === "string" ? router.query.id : null;
  const builder = useFormBuilder(formId);
  const [preview, setPreview] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>("canvas");
  const [toast, setToast] = useState("");
  const [workspaceName, setWorkspaceName] = useState(DEFAULT_WORKSPACE_NAME);

  useEffect(() => {
    const timer = window.setTimeout(() => setWorkspaceName(getWorkspaceName()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function addField(type: FieldType, index?: number) {
    builder.addField(type, index);
    setMobilePanel("canvas");
  }

  function save() {
    builder.save();
    setToast("Draft berhasil disimpan");
  }

  function exportJson() {
    builder.exportJson();
    setToast("Struktur formulir berhasil diunduh");
  }

  if (!router.isReady || (!builder.ready && !builder.missing)) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f7f8f5] text-sm text-[#829084]">
        Memuat formulir...
      </div>
    );
  }

  if (builder.missing) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f8f5] px-6 text-center">
        <div>
          <h1 className="text-2xl font-bold">Formulir tidak ditemukan</h1>
          <p className="mt-2 text-sm text-[#829084]">Formulir ini mungkin sudah dihapus.</p>
          <Link
            href="/workspace"
            className="mt-6 inline-block rounded-lg bg-[#176443] px-5 py-3 text-sm font-semibold text-white"
          >
            Kembali ke workspace
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>Formcraft — Form Builder</title>
        <meta
          name="description"
          content="Buat formulir dengan drag and drop dan lihat hasilnya secara langsung."
        />
      </Head>
      <div className="min-h-screen bg-[#f7f8f5] font-sans text-[#202321]">
        <BuilderHeader
          formTitle={builder.form.title}
          workspaceName={workspaceName}
          storageStatus={builder.storageStatus}
          preview={preview}
          onSave={save}
          onExport={exportJson}
          onTogglePreview={() => setPreview((current) => !current)}
        />
        {builder.storageStatus?.mode === "local" && (
          <div className="border-b border-[#eadfcb] bg-[#fff8ec] px-5 py-2 text-center text-[11px] text-[#8b6b37]">
            {builder.storageStatus.message}
          </div>
        )}
        {preview ? (
          <FormPreview form={builder.form} />
        ) : (
          <>
            <nav
              className="flex h-12 border-b border-[#e9ece7] bg-white md:hidden"
              aria-label="Panel editor"
            >
              {(
                [
                  { panel: "fields", label: "Komponen", icon: "grid" },
                  { panel: "canvas", label: "Kanvas", icon: "text" },
                  { panel: "settings", label: "Pengaturan", icon: "settings" },
                ] as const
              ).map((item) => (
                <button
                  key={item.panel}
                  type="button"
                  onClick={() => setMobilePanel(item.panel)}
                  className={`flex w-1/3 items-center justify-center gap-1.5 text-[11px] font-bold ${mobilePanel === item.panel ? "border-b-2 border-[#1d7045] text-[#1d7045]" : "text-[#879487]"}`}
                >
                  <Icon name={item.icon} size={17} /> {item.label}
                </button>
              ))}
            </nav>
            <div className="min-h-[calc(100vh-73px)] md:grid md:grid-cols-[210px_minmax(0,1fr)] lg:grid-cols-[210px_minmax(0,1fr)_250px] xl:grid-cols-[260px_minmax(0,1fr)_286px]">
              <ComponentPalette visible={mobilePanel === "fields"} onAdd={addField} />
              <BuilderCanvas
                form={builder.form}
                selectedId={builder.selectedField?.id ?? null}
                visible={mobilePanel === "canvas"}
                onUpdateForm={builder.updateForm}
                onSelect={(id) => {
                  builder.setSelectedId(id);
                  setMobilePanel("settings");
                }}
                onAdd={addField}
                onReorder={builder.reorderField}
                onDuplicate={builder.duplicateField}
                onRemove={builder.removeField}
                onPreview={() => setPreview(true)}
              />
              <FieldSettings
                field={builder.selectedField}
                visible={mobilePanel === "settings"}
                onUpdate={builder.updateField}
                onDuplicate={builder.duplicateField}
                onRemove={builder.removeField}
              />
            </div>
          </>
        )}
        {toast && (
          <div className="fixed right-6 bottom-6 z-20 flex items-center gap-2 rounded-lg bg-[#164d34] px-4 py-3 text-xs text-white shadow-xl">
            <Icon name="check" size={17} /> {toast}
          </div>
        )}
      </div>
    </>
  );
}
