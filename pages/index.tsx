import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import type { DragEvent, FormEvent, ReactNode } from "react";

type FieldType = "text" | "email" | "number" | "textarea" | "select" | "radio" | "checkbox" | "date";
type Field = { id: string; type: FieldType; label: string; placeholder: string; required: boolean; help: string; options: string[] };
type FormState = { title: string; description: string; fields: Field[] };
type IconName = "grid" | "eye" | "save" | "download" | "plus" | "text" | "mail" | "hash" | "align" | "chevron" | "circle" | "check" | "calendar" | "grip" | "copy" | "trash" | "arrow" | "close" | "settings" | "spark" | "undo";

const initialForm: FormState = {
  title: "Formulir Pendaftaran",
  description: "Bantu kami mengenal Anda lebih baik. Isi formulir singkat berikut untuk memulai.",
  fields: [
    { id: "name", type: "text", label: "Nama lengkap", placeholder: "Masukkan nama lengkap Anda", required: true, help: "", options: [] },
    { id: "email", type: "email", label: "Alamat email", placeholder: "nama@contoh.com", required: true, help: "Kami tidak akan membagikan alamat email Anda.", options: [] },
    { id: "topic", type: "select", label: "Apa yang ingin Anda pelajari?", placeholder: "Pilih salah satu topik", required: false, help: "", options: ["Desain produk", "Pengembangan web", "Strategi bisnis"] },
  ],
};
const fieldCatalog: { type: FieldType; name: string; detail: string; icon: IconName }[] = [
  { type: "text", name: "Teks singkat", detail: "Jawaban satu baris", icon: "text" },
  { type: "email", name: "Email", detail: "Alamat email valid", icon: "mail" },
  { type: "number", name: "Angka", detail: "Input numerik", icon: "hash" },
  { type: "textarea", name: "Teks panjang", detail: "Jawaban beberapa baris", icon: "align" },
  { type: "select", name: "Dropdown", detail: "Pilih satu pilihan", icon: "chevron" },
  { type: "radio", name: "Pilihan ganda", detail: "Pilihan terlihat", icon: "circle" },
  { type: "checkbox", name: "Kotak centang", detail: "Pilihan ya atau tidak", icon: "check" },
  { type: "date", name: "Tanggal", detail: "Pilih tanggal", icon: "calendar" },
];
const labels: Record<FieldType, string> = { text: "Pertanyaan singkat", email: "Alamat email", number: "Angka", textarea: "Pertanyaan panjang", select: "Pilih salah satu", radio: "Pilih salah satu", checkbox: "Saya menyetujui", date: "Pilih tanggal" };
const iconPaths: Record<IconName, ReactNode> = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
  eye: <><path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="2.5"/></>,
  save: <><path d="M4 4h13l3 3v13H4z"/><path d="M7 4v6h9V4M7 20v-7h10v7"/></>,
  download: <><path d="M12 3v12m-4-4 4 4 4-4M4 17v3h16v-3"/></>,
  plus: <path d="M12 5v14M5 12h14"/>,
  text: <><path d="M4 7h16M7 12h10M7 17h7"/></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
  hash: <><path d="M9 3 7 21M17 3l-2 18M4 9h17M3 15h17"/></>,
  align: <><path d="M4 6h16M4 10h16M4 14h13M4 18h9"/></>,
  chevron: <path d="m6 9 6 6 6-6"/>,
  circle: <circle cx="12" cy="12" r="8"/>,
  check: <><rect x="4" y="4" width="16" height="16" rx="3"/><path d="m8 12 3 3 5-6"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/></>,
  grip: <><circle cx="9" cy="5" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="19" r="1"/></>,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></>,
  trash: <><path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7M10 11v5m4-5v5"/></>,
  arrow: <path d="M5 12h14m-6-6 6 6-6 6"/>,
  close: <path d="M5 5 19 19M19 5 5 19"/>,
  settings: <><path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="2" fill="white"/><circle cx="15" cy="17" r="2" fill="white"/></>,
  spark: <><path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2ZM19 17l.6 1.4L21 19l-1.4.6L19 21l-.6-1.4L17 19l1.4-.6L19 17Z"/></>,
  undo: <><path d="M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-2"/></>,
};
function Icon({ name, size = 18, strokeWidth = 1.8 }: { name: IconName; size?: number; strokeWidth?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{iconPaths[name]}</svg>;
}
function makeField(type: FieldType): Field {
  return { id: crypto.randomUUID(), type, label: labels[type], placeholder: type === "email" ? "nama@contoh.com" : type === "select" ? "Pilih salah satu" : type === "text" ? "Tulis jawaban Anda..." : "", required: false, help: "", options: type === "select" || type === "radio" ? ["Pilihan 1", "Pilihan 2", "Pilihan 3"] : [] };
}
function FieldInput({ field, preview = false }: { field: Field; preview?: boolean }) {
  const props = { name: field.id, required: preview && field.required, disabled: !preview };
  if (field.type === "textarea") return <textarea className="form-input textarea" placeholder={field.placeholder || "Tulis jawaban Anda..."} rows={3} {...props} />;
  if (field.type === "select") return <div className="select-wrap"><select className="form-input" defaultValue="" {...props}><option value="" disabled>{field.placeholder || "Pilih salah satu"}</option>{field.options.map((option, i) => <option key={i} value={option}>{option}</option>)}</select><Icon name="chevron" size={16}/></div>;
  if (field.type === "radio") return <div className="choice-list">{field.options.map((option, i) => <label className="choice-row" key={i}><input type="radio" name={field.id} value={option} required={preview && field.required} disabled={!preview}/><span>{option}</span></label>)}</div>;
  if (field.type === "checkbox") return <label className="choice-row"><input type="checkbox" name={field.id} required={preview && field.required} disabled={!preview}/><span>{field.placeholder || "Ya, saya setuju"}</span></label>;
  return <input className="form-input" type={field.type} placeholder={field.type === "date" ? undefined : field.placeholder || "Tulis jawaban Anda..."} {...props}/>;
}
function FormField({ field, preview = false }: { field: Field; preview?: boolean }) {
  return <div className="field-content"><label className="field-label" htmlFor={field.type === "radio" || field.type === "checkbox" ? undefined : field.id}>{field.label}{field.required && <span className="required-star">*</span>}</label>{field.help && <p className="field-help">{field.help}</p>}<FieldInput field={field} preview={preview}/></div>;
}

export default function Home() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [selectedId, setSelectedId] = useState<string | null>("name");
  const [mode, setMode] = useState<"build" | "preview">("build");
  const [mobilePanel, setMobilePanel] = useState<"fields" | "canvas" | "settings">("canvas");
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [toast, setToast] = useState("");
  const [submitted, setSubmitted] = useState<Record<string, FormDataEntryValue> | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const selected = useMemo(() => form.fields.find(field => field.id === selectedId), [form.fields, selectedId]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { const stored = localStorage.getItem("formcraft-draft-v1"); if (stored) { const parsed = JSON.parse(stored) as FormState; if (parsed && Array.isArray(parsed.fields)) { setForm(parsed); setSelectedId(parsed.fields[0]?.id ?? null); } } } catch { /* Ignore an invalid old draft. */ }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => { if (hydrated) localStorage.setItem("formcraft-draft-v1", JSON.stringify(form)); }, [form, hydrated]);
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(""), 2800); return () => window.clearTimeout(timer); }, [toast]);
  function updateField(id: string, changes: Partial<Field>) { setForm(current => ({ ...current, fields: current.fields.map(field => field.id === id ? { ...field, ...changes } : field) })); }
  function addField(type: FieldType, index = form.fields.length) { const field = makeField(type); setForm(current => { const fields = [...current.fields]; fields.splice(index, 0, field); return { ...current, fields }; }); setSelectedId(field.id); setMobilePanel("canvas"); }
  function moveField(id: string, index: number) { setForm(current => { const fields = [...current.fields]; const oldIndex = fields.findIndex(field => field.id === id); if (oldIndex < 0) return current; const [field] = fields.splice(oldIndex, 1); fields.splice(index > oldIndex ? index - 1 : index, 0, field); return { ...current, fields }; }); }
  function removeField(id: string) { setForm(current => ({ ...current, fields: current.fields.filter(field => field.id !== id) })); setSelectedId(current => current === id ? null : current); }
  function duplicateField(field: Field) { const duplicate = { ...field, id: crypto.randomUUID(), options: [...field.options] }; setForm(current => { const fields = [...current.fields]; fields.splice(fields.findIndex(item => item.id === field.id) + 1, 0, duplicate); return { ...current, fields }; }); setSelectedId(duplicate.id); }
  function drop(event: DragEvent, index: number) { event.preventDefault(); setDropIndex(null); const type = event.dataTransfer.getData("application/formcraft-type") as FieldType; const id = event.dataTransfer.getData("application/formcraft-id"); if (id) moveField(id, index); else if (fieldCatalog.some(item => item.type === type)) addField(type, index); }
  function save() { localStorage.setItem("formcraft-draft-v1", JSON.stringify(form)); setToast("Draft berhasil disimpan"); }
  function exportJson() { const blob = new Blob([JSON.stringify(form, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "formulir.json"; link.click(); URL.revokeObjectURL(url); setToast("Struktur formulir berhasil diunduh"); }
  function submitPreview(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSubmitted(Object.fromEntries(new FormData(event.currentTarget).entries())); }
  const dropZone = (index: number) => <div key={`drop-${index}`} className={`drop-zone ${dropIndex === index ? "drop-zone-active" : ""}`} onDragOver={event => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; setDropIndex(index); }} onDragLeave={() => setDropIndex(current => current === index ? null : current)} onDrop={event => drop(event, index)}><span>Letakkan komponen di sini</span></div>;
  return <>
    <Head><title>Formcraft — Form Builder</title><meta name="description" content="Buat formulir dengan drag and drop dan lihat hasilnya secara langsung." /></Head>
    <div className="app-shell">
      <header className="topbar"><div className="brand"><span className="brand-mark"><span></span><span></span><span></span><span></span></span><span>formcraft<span className="brand-dot">.</span></span></div><span className="header-divider"/><div className="breadcrumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>Formulir baru</strong><span className="draft-pill">Draft</span></div><div className="top-actions"><span className="saved-indicator"><span className="saved-dot"/>Tersimpan otomatis</span><button className="top-button light" onClick={exportJson} title="Unduh JSON"><Icon name="download" size={17}/><span>Ekspor</span></button><button className="top-button light" onClick={save}><Icon name="save" size={17}/><span>Simpan</span></button><button className="top-button primary" onClick={() => { setMode(current => current === "build" ? "preview" : "build"); setSubmitted(null); }}><Icon name={mode === "build" ? "eye" : "undo"} size={17}/><span>{mode === "build" ? "Preview" : "Kembali ke editor"}</span></button></div></header>
      {mode === "build" ? <>
        <div className="mobile-tabs"><button className={mobilePanel === "fields" ? "active" : ""} onClick={() => setMobilePanel("fields")}><Icon name="grid" size={17}/> Komponen</button><button className={mobilePanel === "canvas" ? "active" : ""} onClick={() => setMobilePanel("canvas")}><Icon name="text" size={17}/> Kanvas</button><button className={mobilePanel === "settings" ? "active" : ""} onClick={() => setMobilePanel("settings")}><Icon name="settings" size={17}/> Pengaturan</button></div>
        <div className="builder-layout">
          <aside className={`left-panel ${mobilePanel === "fields" ? "mobile-show" : ""}`}><div className="panel-head"><div><div className="eyebrow">BANGUN FORMULIR</div><h2>Komponen</h2></div><div className="count-badge">{fieldCatalog.length}</div></div><p className="panel-intro">Tarik komponen ke kanvas atau klik untuk menambahkannya.</p><div className="catalog-heading">FIELD DASAR</div><div className="component-list">{fieldCatalog.map(item => <button className="component-item" key={item.type} draggable onDragStart={event => { event.dataTransfer.setData("application/formcraft-type", item.type); event.dataTransfer.effectAllowed = "copy"; }} onClick={() => addField(item.type)}><span className="component-icon"><Icon name={item.icon} size={19}/></span><span className="component-copy"><strong>{item.name}</strong><small>{item.detail}</small></span><Icon name="plus" size={17}/></button>)}</div><div className="sidebar-tip"><span className="tip-icon"><Icon name="spark" size={19}/></span><strong>Tips cepat</strong><p>Klik field pada kanvas untuk mengatur label, deskripsi, dan pilihannya.</p></div></aside>
          <main className={`canvas-area ${mobilePanel === "canvas" ? "mobile-show" : ""}`}><div className="workspace-top"><div><span className="workspace-kicker">EDITOR FORMULIR</span><h1>Rancang formulir Anda</h1><p>Susun pertanyaan dan buat pengalaman yang lebih baik untuk responden.</p></div><div className="field-total"><span>{form.fields.length}</span> field</div></div><div className="canvas-wrap"><div className="canvas-paper"><div className="form-accent"/><div className="form-heading"><span className="form-eyebrow">FORMULIR BARU</span><input aria-label="Judul formulir" className="title-input" value={form.title} onChange={event => setForm(current => ({ ...current, title: event.target.value }))} placeholder="Judul formulir"/><textarea aria-label="Deskripsi formulir" className="description-input" value={form.description} onChange={event => setForm(current => ({ ...current, description: event.target.value }))} placeholder="Tambahkan deskripsi formulir..." rows={2}/></div><div className="fields-area">{form.fields.length === 0 && <div className="empty-state"><span><Icon name="plus" size={24}/></span><h3>Mulai dengan sebuah field</h3><p>Tarik komponen dari panel kiri atau klik komponen untuk menambahkannya.</p></div>}{dropZone(0)}{form.fields.map((field, index) => <div key={field.id}><div className={`builder-field ${selectedId === field.id ? "selected" : ""}`} onClick={() => { setSelectedId(field.id); setMobilePanel("settings"); }} draggable onDragStart={event => { event.dataTransfer.setData("application/formcraft-id", field.id); event.dataTransfer.effectAllowed = "move"; }} onDragOver={event => { event.preventDefault(); const bounds = event.currentTarget.getBoundingClientRect(); setDropIndex(event.clientY < bounds.top + bounds.height / 2 ? index : index + 1); }} onDrop={event => { const bounds = event.currentTarget.getBoundingClientRect(); drop(event, event.clientY < bounds.top + bounds.height / 2 ? index : index + 1); }}><div className="drag-handle"><Icon name="grip" size={17}/></div><FormField field={field}/><div className="field-actions"><button title="Duplikat field" aria-label="Duplikat field" onClick={event => { event.stopPropagation(); duplicateField(field); }}><Icon name="copy" size={17}/></button><button title="Hapus field" aria-label="Hapus field" onClick={event => { event.stopPropagation(); removeField(field.id); }}><Icon name="trash" size={17}/></button></div></div>{dropZone(index + 1)}</div>)}</div><div className="form-footer"><div className="form-footer-note">Dibuat dengan <strong>formcraft.</strong></div><button onClick={() => setMode("preview")}>Kirim formulir <Icon name="arrow" size={16}/></button></div></div><p className="canvas-hint"><Icon name="grip" size={15}/> Tarik field untuk mengubah urutan · Klik field untuk mengedit</p></div></main>
          <aside className={`right-panel ${mobilePanel === "settings" ? "mobile-show" : ""}`}><div className="panel-head right-head"><div><div className="eyebrow">KUSTOMISASI</div><h2>Pengaturan field</h2></div><Icon name="settings" size={19}/></div>{selected ? <div className="settings-body"><div className="selected-type"><span className="selected-type-icon"><Icon name={fieldCatalog.find(item => item.type === selected.type)?.icon || "text"} size={18}/></span><div><small>TIPE FIELD</small><strong>{fieldCatalog.find(item => item.type === selected.type)?.name}</strong></div></div><div className="setting-group"><label htmlFor="field-label">Label pertanyaan</label><input id="field-label" value={selected.label} onChange={event => updateField(selected.id, { label: event.target.value })}/><p>Teks yang akan dilihat oleh responden.</p></div>{selected.type !== "date" && selected.type !== "radio" && <div className="setting-group"><label htmlFor="field-placeholder">{selected.type === "checkbox" ? "Label pilihan" : "Placeholder"}</label><input id="field-placeholder" value={selected.placeholder} onChange={event => updateField(selected.id, { placeholder: event.target.value })} placeholder="Teks petunjuk..."/></div>}<div className="setting-group"><label htmlFor="field-help">Deskripsi / bantuan</label><textarea id="field-help" rows={3} value={selected.help} onChange={event => updateField(selected.id, { help: event.target.value })} placeholder="Tambahkan petunjuk tambahan..."/></div>{(selected.type === "select" || selected.type === "radio") && <div className="setting-group"><label htmlFor="field-options">Pilihan jawaban</label><textarea id="field-options" rows={5} value={selected.options.join("\n")} onChange={event => updateField(selected.id, { options: event.target.value.split("\n") })} placeholder="Satu pilihan per baris"/><p>Tulis satu pilihan pada setiap baris.</p></div>}<div className="setting-divider"/><label className="toggle-row"><span><strong>Wajib diisi</strong><small>Responden harus menjawab pertanyaan ini</small></span><input type="checkbox" checked={selected.required} onChange={event => updateField(selected.id, { required: event.target.checked })}/><span className="toggle-track"/></label><div className="setting-divider"/><div className="settings-actions"><button onClick={() => duplicateField(selected)}><Icon name="copy" size={16}/> Duplikat</button><button className="danger" onClick={() => removeField(selected.id)}><Icon name="trash" size={16}/> Hapus</button></div></div> : <div className="no-selection"><span><Icon name="settings" size={23}/></span><h3>Pilih sebuah field</h3><p>Klik field pada kanvas untuk mengatur tampilannya.</p></div>}</aside>
        </div>
      </> : <div className="preview-page"><div className="preview-heading"><span className="preview-label"><Icon name="eye" size={15}/> MODE PREVIEW</span><h1>Lihat seperti responden</h1><p>Isi formulir di bawah untuk mencoba pengalaman responden.</p></div><div className="preview-card"><div className="form-accent"/>{submitted ? <div className="success-state"><span className="success-icon"><Icon name="check" size={29}/></span><h2>Formulir berhasil dikirim!</h2><p>Preview berjalan dengan baik. Jawaban tersimpan untuk sesi ini saja.</p><button onClick={() => setSubmitted(null)}>Isi kembali <Icon name="arrow" size={16}/></button></div> : <form onSubmit={submitPreview}><div className="preview-form-heading"><span className="form-eyebrow">FORMULIR</span><h2>{form.title || "Formulir tanpa judul"}</h2><p>{form.description}</p></div><div className="preview-fields">{form.fields.map(field => <FormField key={field.id} field={field} preview/>)}</div><div className="preview-submit"><span>* Menandakan pertanyaan wajib</span><button type="submit">Kirim formulir <Icon name="arrow" size={16}/></button></div></form>}</div><p className="preview-note">Ini hanya preview. Jawaban tidak dikirim ke server.</p></div>}
      {toast && <div className="toast"><Icon name="check" size={17}/>{toast}</div>}
    </div>
  </>;
}
