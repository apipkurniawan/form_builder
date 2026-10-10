import type { DragEvent } from "react";
import { FIELD_CATALOG } from "@/lib/form-builder";
import type { FieldType } from "@/lib/form-builder";
import { Icon } from "./icon";

type Props = {
  visible: boolean;
  onAdd: (type: FieldType) => void;
};

export function ComponentPalette({ visible, onAdd }: Props) {
  function startDrag(event: DragEvent<HTMLButtonElement>, type: FieldType) {
    event.dataTransfer.setData("application/formcraft-type", type);
    event.dataTransfer.setData("text/plain", type);
    event.dataTransfer.effectAllowed = "copy";
  }

  return (
    <aside
      className={`${visible ? "block" : "hidden"} border-[#e9ece7] bg-white px-5 py-7 md:block md:border-r md:px-3 xl:px-4`}
    >
      <div className="flex items-center justify-between px-2">
        <div>
          <p className="text-[10px] font-extrabold tracking-[.13em] text-[#9ca59a]">
            BANGUN FORMULIR
          </p>
          <h2 className="mt-1.5 text-lg font-bold tracking-tight">Komponen</h2>
        </div>
        <span className="grid size-7 place-items-center rounded-lg bg-[#f1f5ef] text-xs font-bold text-[#52805d]">
          {FIELD_CATALOG.length}
        </span>
      </div>
      <p className="mt-4 mb-7 px-2 text-xs leading-relaxed text-[#929a91]">
        Tarik komponen ke kanvas atau klik untuk menambahkannya.
      </p>
      <p className="mb-3 px-2 text-[10px] font-extrabold tracking-[.13em] text-[#9ca59a]">
        FIELD DASAR
      </p>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-1">
        {FIELD_CATALOG.map((item) => (
          <button
            key={item.type}
            type="button"
            draggable
            onDragStart={(event) => startDrag(event, item.type)}
            onClick={() => onAdd(item.type)}
            className="flex min-h-15 items-center gap-2.5 rounded-lg border border-[#ebeee9] bg-white px-2.5 text-left text-[#9aa49a] transition hover:-translate-y-px hover:border-[#b9d4be] hover:bg-[#f7fbf6]"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-md bg-[#f4f7f1] text-[#4c8060]">
              <Icon name={item.icon} size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <strong className="block text-xs text-[#343b34]">{item.name}</strong>
              <small className="block text-[10px] text-[#9ba39b]">{item.detail}</small>
            </span>
            <span className="hidden lg:block">
              <Icon name="plus" size={17} />
            </span>
          </button>
        ))}
      </div>
      <div className="mt-9 rounded-xl border border-[#e3eee1] bg-[#eff6ed] p-4">
        <span className="mb-3 grid size-8 place-items-center rounded-lg bg-white text-[#518662]">
          <Icon name="spark" size={19} />
        </span>
        <strong className="text-xs">Tips cepat</strong>
        <p className="mt-1.5 text-[11px] leading-relaxed text-[#76907a]">
          Klik field pada kanvas untuk mengatur label, deskripsi, dan pilihannya.
        </p>
      </div>
    </aside>
  );
}
