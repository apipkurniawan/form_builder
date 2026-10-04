import { useState } from "react";
import type { DragEvent } from "react";
import { isFieldType } from "@/lib/form-builder";
import type { Field, FieldType, FormState } from "@/lib/form-builder";
import { FormField } from "./form-field";
import { Icon } from "./icon";

type Props = {
  form: FormState;
  selectedId: string | null;
  visible: boolean;
  onUpdateForm: (changes: Partial<Pick<FormState, "title" | "description">>) => void;
  onSelect: (id: string) => void;
  onAdd: (type: FieldType, index: number) => void;
  onReorder: (id: string, index: number) => void;
  onDuplicate: (field: Field) => void;
  onRemove: (id: string) => void;
  onPreview: () => void;
};

export function BuilderCanvas({
  form,
  selectedId,
  visible,
  onUpdateForm,
  onSelect,
  onAdd,
  onReorder,
  onDuplicate,
  onRemove,
  onPreview,
}: Props) {
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  function handleDrop(event: DragEvent, index: number) {
    event.preventDefault();
    setDropIndex(null);
    const id = event.dataTransfer.getData("application/formcraft-id");
    const type = event.dataTransfer.getData("application/formcraft-type");
    if (id) onReorder(id, index);
    else if (isFieldType(type)) onAdd(type, index);
  }

  function dropZone(index: number) {
    const active = dropIndex === index;
    return (
      <div
        className={`relative grid place-items-center transition-all ${active ? "h-10" : "h-4"}`}
        onDragOver={(event) => {
          event.preventDefault();
          setDropIndex(index);
        }}
        onDragLeave={() => setDropIndex((current) => (current === index ? null : current))}
        onDrop={(event) => handleDrop(event, index)}
      >
        <span
          className={`absolute right-2 left-2 border-t-2 border-dashed ${active ? "border-[#8dbd93]" : "border-transparent"}`}
        />
        {active && (
          <span className="relative z-10 rounded bg-[#e6f3e5] px-2 py-1 text-[10px] text-[#4d895a]">
            Letakkan komponen di sini
          </span>
        )}
      </div>
    );
  }

  return (
    <main
      className={`${visible ? "block" : "hidden"} min-w-0 bg-[#f8f9f6] px-3 py-7 md:block md:px-7 md:py-9 xl:px-14`}
    >
      <div className="mx-auto mb-6 flex max-w-[745px] items-center justify-between gap-4 px-1">
        <div>
          <span className="text-[10px] font-extrabold tracking-[.13em] text-[#6b9775]">
            EDITOR FORMULIR
          </span>
          <h1 className="mt-2 text-xl font-bold tracking-tight md:text-2xl">
            Rancang formulir Anda
          </h1>
          <p className="mt-1.5 max-w-72 text-xs leading-relaxed text-[#929a91] md:max-w-none">
            Susun pertanyaan dan buat pengalaman yang lebih baik untuk responden.
          </p>
        </div>
        <span className="hidden shrink-0 rounded-lg border border-[#e1ecde] bg-[#edf3eb] px-3 py-2 text-[11px] font-semibold text-[#64806a] sm:block">
          <strong className="text-[#246746]">{form.fields.length}</strong> field
        </span>
      </div>
      <div className="mx-auto max-w-[745px]">
        <div className="overflow-hidden rounded-xl border border-[#e7ebe5] bg-white shadow-[0_13px_40px_rgba(37,57,34,.045)]">
          <div className="h-[7px] bg-gradient-to-r from-[#286e4a] via-[#72aa75] to-[#d2e6b4]" />
          <div className="border-b border-[#f1f2ef] px-6 pt-7 pb-5 md:px-10 md:pt-9">
            <span className="text-[10px] font-extrabold tracking-[.14em] text-[#78a381]">
              FORMULIR BARU
            </span>
            <input
              aria-label="Judul formulir"
              value={form.title}
              onChange={(event) => onUpdateForm({ title: event.target.value })}
              placeholder="Judul formulir"
              className="mt-2 block w-full border-0 bg-transparent py-1 text-[23px] font-bold tracking-tight text-[#242c24] outline-none focus:border-b focus:border-[#8cbf96] md:text-[27px]"
            />
            <textarea
              aria-label="Deskripsi formulir"
              value={form.description}
              onChange={(event) => onUpdateForm({ description: event.target.value })}
              placeholder="Tambahkan deskripsi formulir..."
              rows={2}
              className="block min-h-11 w-full resize-y border-0 bg-transparent py-1 text-xs leading-relaxed text-[#828d83] outline-none"
            />
          </div>
          <div className="px-2 pt-4 pb-3 md:px-7" onDragEnd={() => setDropIndex(null)}>
            {form.fields.length === 0 && (
              <div className="px-5 pt-11 pb-8 text-center">
                <span className="mx-auto grid size-11 place-items-center rounded-xl bg-[#eff6ed] text-[#589067]">
                  <Icon name="plus" size={24} />
                </span>
                <h3 className="mt-4 text-sm font-bold">Mulai dengan sebuah field</h3>
                <p className="mx-auto mt-2 max-w-64 text-xs leading-relaxed text-[#949e95]">
                  Tarik komponen dari panel kiri atau klik komponen untuk menambahkannya.
                </p>
              </div>
            )}
            {dropZone(0)}
            {form.fields.map((field, index) => (
              <div key={field.id}>
                <div
                  draggable
                  onClick={() => onSelect(field.id)}
                  onDragStart={(event) => {
                    event.dataTransfer.setData("application/formcraft-id", field.id);
                    event.dataTransfer.effectAllowed = "move";
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    const bounds = event.currentTarget.getBoundingClientRect();
                    setDropIndex(
                      event.clientY < bounds.top + bounds.height / 2 ? index : index + 1,
                    );
                  }}
                  onDrop={(event) => {
                    const bounds = event.currentTarget.getBoundingClientRect();
                    handleDrop(
                      event,
                      event.clientY < bounds.top + bounds.height / 2 ? index : index + 1,
                    );
                  }}
                  className={`group relative flex min-h-28 cursor-pointer gap-2 rounded-lg border bg-white py-5 pr-8 pl-2.5 transition md:gap-3 md:pr-9 md:pl-5 ${selectedId === field.id ? "border-[#92be9b] ring-[3px] ring-[#ebf5e9]" : "border-transparent hover:border-[#dce8dc]"}`}
                >
                  <span className="mt-0.5 shrink-0 cursor-grab text-[#b7c0b6] active:cursor-grabbing">
                    <Icon name="grip" size={17} />
                  </span>
                  <FormField field={field} />
                  <div className="absolute top-2 right-2 flex gap-0.5 opacity-100 md:opacity-0 md:group-hover:opacity-100">
                    <button
                      type="button"
                      title="Duplikat field"
                      aria-label="Duplikat field"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDuplicate(field);
                      }}
                      className="grid size-7 place-items-center rounded bg-white text-[#8e9b8f] hover:bg-[#f0f4ef] hover:text-[#256e49]"
                    >
                      <Icon name="copy" size={17} />
                    </button>
                    <button
                      type="button"
                      title="Hapus field"
                      aria-label="Hapus field"
                      onClick={(event) => {
                        event.stopPropagation();
                        onRemove(field.id);
                      }}
                      className="grid size-7 place-items-center rounded bg-white text-[#8e9b8f] hover:bg-[#fff0ee] hover:text-[#bd5148]"
                    >
                      <Icon name="trash" size={17} />
                    </button>
                  </div>
                </div>
                {dropZone(index + 1)}
              </div>
            ))}
          </div>
          <div className="mx-6 flex items-center justify-between border-t border-[#f1f2ef] py-6 md:mx-10">
            <span className="text-[10px] text-[#afb7ac]">
              Dibuat dengan <strong className="text-[#6e9878]">formcraft.</strong>
            </span>
            <button
              type="button"
              onClick={onPreview}
              className="flex items-center gap-3 rounded-md bg-[#176443] px-4 py-3 text-[11px] font-bold text-white hover:bg-[#104e34]"
            >
              Kirim formulir <Icon name="arrow" size={16} />
            </button>
          </div>
        </div>
        <p className="mt-5 flex items-center justify-center gap-1 text-center text-[11px] text-[#9da69b]">
          <Icon name="grip" size={15} /> Tarik field untuk mengubah urutan · Klik field untuk
          mengedit
        </p>
      </div>
    </main>
  );
}
