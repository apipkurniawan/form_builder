import type { ReactNode } from "react";
import { FIELD_CATALOG } from "@/lib/form-builder";
import type { Field } from "@/lib/form-builder";
import { Icon } from "./icon";

type Props = {
  field: Field | null;
  visible: boolean;
  onUpdate: (id: string, changes: Partial<Field>) => void;
  onDuplicate: (field: Field) => void;
  onRemove: (id: string) => void;
};

const controlClass =
  "w-full rounded-md border border-[#e4e9e3] bg-white px-3 py-2.5 text-[11px] text-[#3d473e] outline-none placeholder:text-[#b0b9af] focus:border-[#7fb38c] focus:ring-2 focus:ring-[#e4f2e3]";

function SettingGroup({
  label,
  htmlFor,
  description,
  children,
}: {
  label: string;
  htmlFor: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-5">
      <label htmlFor={htmlFor} className="mb-2 block text-[11px] font-bold text-[#404940]">
        {label}
      </label>
      {children}
      {description && <p className="mt-1.5 text-[10px] text-[#a2aba1]">{description}</p>}
    </div>
  );
}

export function FieldSettings({ field, visible, onUpdate, onDuplicate, onRemove }: Props) {
  const catalogItem = FIELD_CATALOG.find((item) => item.type === field?.type);

  return (
    <aside
      className={`${visible ? "block" : "hidden"} border-[#e9ece7] bg-white px-5 py-7 md:fixed md:top-[73px] md:right-0 md:bottom-0 md:z-10 md:w-[285px] md:overflow-y-auto md:border-l md:shadow-[-15px_0_40px_#1b3a241a] lg:static lg:block lg:w-auto lg:shadow-none`}
    >
      <div className="flex items-center justify-between border-b border-[#e9ece7] pb-6">
        <div>
          <p className="text-[10px] font-extrabold tracking-[.13em] text-[#9ca59a]">KUSTOMISASI</p>
          <h2 className="mt-1.5 text-lg font-bold tracking-tight">Pengaturan field</h2>
        </div>
        <span className="text-[#a3b0a4]">
          <Icon name="settings" size={19} />
        </span>
      </div>
      {field ? (
        <div className="pt-5">
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-[#edf1e9] bg-[#f5f8f3] p-2.5">
            <span className="grid size-9 place-items-center rounded-md bg-[#e3f0e0] text-[#43845b]">
              <Icon name={catalogItem?.icon ?? "text"} size={18} />
            </span>
            <div>
              <small className="block text-[9px] font-extrabold tracking-wider text-[#9aa99a]">
                TIPE FIELD
              </small>
              <strong className="text-xs text-[#405040]">{catalogItem?.name}</strong>
            </div>
          </div>
          <SettingGroup
            htmlFor="field-label"
            label="Label pertanyaan"
            description="Teks yang akan dilihat oleh responden."
          >
            <input
              id="field-label"
              className={controlClass}
              value={field.label}
              onChange={(event) => onUpdate(field.id, { label: event.target.value })}
            />
          </SettingGroup>
          {field.type !== "date" && field.type !== "radio" && (
            <SettingGroup
              htmlFor="field-placeholder"
              label={field.type === "checkbox" ? "Label pilihan" : "Placeholder"}
            >
              <input
                id="field-placeholder"
                className={controlClass}
                value={field.placeholder}
                placeholder="Teks petunjuk..."
                onChange={(event) => onUpdate(field.id, { placeholder: event.target.value })}
              />
            </SettingGroup>
          )}
          <SettingGroup htmlFor="field-help" label="Deskripsi / bantuan">
            <textarea
              id="field-help"
              rows={3}
              className={`${controlClass} resize-y`}
              value={field.help}
              placeholder="Tambahkan petunjuk tambahan..."
              onChange={(event) => onUpdate(field.id, { help: event.target.value })}
            />
          </SettingGroup>
          {(field.type === "select" || field.type === "radio") && (
            <SettingGroup
              htmlFor="field-options"
              label="Pilihan jawaban"
              description="Tulis satu pilihan pada setiap baris."
            >
              <textarea
                id="field-options"
                rows={5}
                className={`${controlClass} resize-y`}
                value={field.options.join("\n")}
                placeholder="Satu pilihan per baris"
                onChange={(event) =>
                  onUpdate(field.id, { options: event.target.value.split("\n") })
                }
              />
            </SettingGroup>
          )}
          <div className="my-5 h-px bg-[#eef0ec]" />
          <label className="flex cursor-pointer items-center justify-between gap-3">
            <span>
              <strong className="block text-[11px]">Wajib diisi</strong>
              <small className="mt-1 block text-[10px] leading-snug text-[#a0aaa0]">
                Responden harus menjawab pertanyaan ini
              </small>
            </span>
            <input
              type="checkbox"
              checked={field.required}
              onChange={(event) => onUpdate(field.id, { required: event.target.checked })}
              className="peer sr-only"
            />
            <span className="relative h-5 w-9 shrink-0 rounded-full bg-[#e1e7df] transition before:absolute before:top-[3px] before:left-[3px] before:size-3.5 before:rounded-full before:bg-white before:shadow-sm before:transition peer-checked:bg-[#287a50] peer-checked:before:translate-x-4 peer-focus-visible:ring-2 peer-focus-visible:ring-[#a5d5b5]" />
          </label>
          <div className="my-5 h-px bg-[#eef0ec]" />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onDuplicate(field)}
              className="flex h-9 items-center gap-1.5 rounded-md border border-[#e5ebe4] px-2.5 text-[11px] text-[#607062] hover:bg-[#f6f9f5]"
            >
              <Icon name="copy" size={16} /> Duplikat
            </button>
            <button
              type="button"
              onClick={() => onRemove(field.id)}
              className="flex h-9 items-center gap-1.5 rounded-md border border-[#e5ebe4] px-2.5 text-[11px] text-[#bd6b65] hover:bg-[#fff2f0]"
            >
              <Icon name="trash" size={16} /> Hapus
            </button>
          </div>
        </div>
      ) : (
        <div className="py-20 text-center">
          <span className="mx-auto grid size-11 place-items-center rounded-xl bg-[#eff6ed] text-[#589067]">
            <Icon name="settings" size={23} />
          </span>
          <h3 className="mt-4 mb-2 text-sm font-bold">Pilih sebuah field</h3>
          <p className="mx-auto max-w-60 text-xs leading-relaxed text-[#949e95]">
            Klik field pada kanvas untuk mengatur tampilannya.
          </p>
        </div>
      )}
    </aside>
  );
}
