import type { Field } from "@/lib/form-builder";
import { Icon } from "./icon";

const inputClass =
  "h-10 w-full rounded-md border border-[#e5ebe4] bg-white px-3 text-xs text-[#354035] outline-none placeholder:text-[#abb4aa] focus:border-[#7fb38c] focus:ring-2 focus:ring-[#e4f2e3] disabled:bg-[#fafbf9] disabled:text-[#9ca79e]";

function FieldInput({ field, preview }: { field: Field; preview: boolean }) {
  const common = {
    id: field.id,
    name: field.id,
    required: preview && field.required,
    disabled: !preview,
  };

  if (field.type === "textarea") {
    return (
      <textarea
        {...common}
        rows={3}
        className={`${inputClass} h-auto min-h-20 resize-y py-3`}
        placeholder={field.placeholder || "Tulis jawaban Anda..."}
      />
    );
  }

  if (field.type === "select") {
    return (
      <div className="relative">
        <select {...common} defaultValue="" className={`${inputClass} appearance-none pr-9`}>
          <option value="" disabled>
            {field.placeholder || "Pilih salah satu"}
          </option>
          {field.options.map((option, index) => (
            <option key={`${index}-${option}`} value={option}>
              {option}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute top-3 right-3 text-[#9da89d]">
          <Icon name="chevron" size={16} />
        </span>
      </div>
    );
  }

  if (field.type === "radio") {
    return (
      <div className="space-y-2.5">
        {field.options.map((option, index) => (
          <label
            key={`${index}-${option}`}
            className="flex min-h-6 items-center gap-2.5 text-xs text-[#5d685f]"
          >
            <input
              type="radio"
              name={field.id}
              value={option}
              required={preview && field.required}
              disabled={!preview}
              className="size-4 accent-[#176443] disabled:opacity-100"
            />
            {option}
          </label>
        ))}
      </div>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className="flex min-h-6 items-center gap-2.5 text-xs text-[#5d685f]">
        <input
          type="checkbox"
          name={field.id}
          required={preview && field.required}
          disabled={!preview}
          className="size-4 accent-[#176443] disabled:opacity-100"
        />
        {field.placeholder || "Ya, saya setuju"}
      </label>
    );
  }

  return (
    <input
      {...common}
      type={field.type}
      className={inputClass}
      placeholder={field.type === "date" ? undefined : field.placeholder || "Tulis jawaban Anda..."}
    />
  );
}

export function FormField({ field, preview = false }: { field: Field; preview?: boolean }) {
  return (
    <div className="min-w-0 flex-1">
      <label
        htmlFor={field.type === "radio" || field.type === "checkbox" ? undefined : field.id}
        className="mb-2.5 block text-[13px] font-bold text-[#313b32]"
      >
        {field.label}
        {field.required && <span className="ml-1 text-[#d7716b]">*</span>}
      </label>
      {field.help && (
        <p className="-mt-1 mb-2.5 text-[11px] leading-snug text-[#939e93]">{field.help}</p>
      )}
      <FieldInput field={field} preview={preview} />
    </div>
  );
}
