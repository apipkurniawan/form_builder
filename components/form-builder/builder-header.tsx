import { Icon } from "./icon";

type Props = {
  preview: boolean;
  onSave: () => void;
  onExport: () => void;
  onTogglePreview: () => void;
};

const secondaryButton =
  "flex h-9 items-center justify-center gap-2 rounded-lg border border-[#e6eae5] bg-white px-3.5 text-xs font-bold text-[#424a42] hover:bg-[#f6f8f5]";

export function BuilderHeader({ preview, onSave, onExport, onTogglePreview }: Props) {
  return (
    <header className="relative z-10 flex h-[73px] items-center gap-6 border-b border-[#e9ece7] bg-white px-4 md:px-7">
      <div className="flex items-center gap-2.5 text-[22px] font-extrabold tracking-[-.07em] whitespace-nowrap">
        <span className="grid size-7 -rotate-6 grid-cols-2 place-content-center gap-[3px] rounded-lg bg-[#166844] p-[7px]">
          <span className="rounded-[1px] bg-[#e5f2dc]" />
          <span className="rounded-[1px] bg-[#e5f2dc] opacity-55" />
          <span className="rounded-[1px] bg-[#e5f2dc] opacity-70" />
          <span className="rounded-[1px] bg-[#e5f2dc]" />
        </span>
        <span>
          formcraft<span className="text-[#62a27b]">.</span>
        </span>
      </div>
      <span className="hidden h-7 w-px bg-[#e5e8e3] md:block" />
      <div className="hidden items-center gap-3 text-[13px] text-[#939993] md:flex">
        <span>Workspace</span>
        <span className="text-[#c9ceca]">/</span>
        <strong className="font-semibold text-[#404741]">Formulir baru</strong>
        <span className="rounded-full border border-[#e5e9e2] bg-[#f2f4ef] px-2.5 py-1 text-[11px] text-[#748072]">
          Draft
        </span>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <span className="mr-3 hidden items-center gap-2 whitespace-nowrap text-xs text-[#8b938b] xl:flex">
          <span className="size-2 rounded-full bg-[#6caf7e]" /> Tersimpan otomatis
        </span>
        <button type="button" className={secondaryButton} onClick={onExport} title="Unduh JSON">
          <Icon name="download" size={17} /> <span className="hidden sm:inline">Ekspor</span>
        </button>
        <button type="button" className={secondaryButton} onClick={onSave} title="Simpan">
          <Icon name="save" size={17} /> <span className="hidden sm:inline">Simpan</span>
        </button>
        <button
          type="button"
          onClick={onTogglePreview}
          className="flex h-9 items-center justify-center gap-2 rounded-lg bg-[#176443] px-3.5 text-xs font-bold whitespace-nowrap text-white hover:bg-[#104e34]"
        >
          <Icon name={preview ? "undo" : "eye"} size={17} />
          <span>{preview ? "Kembali ke editor" : "Preview"}</span>
        </button>
      </div>
    </header>
  );
}
