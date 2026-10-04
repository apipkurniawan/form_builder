import { useState } from "react";
import type { FormEvent } from "react";
import type { FormState } from "@/lib/form-builder";
import { FormField } from "./form-field";
import { Icon } from "./icon";

export function FormPreview({ form }: { form: FormState }) {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="min-h-[calc(100vh-73px)] bg-[#f7f9f6] px-3 pt-9 pb-20 md:px-5 md:pt-14">
      <div className="mb-7 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f3e6] px-2.5 py-1.5 text-[10px] font-extrabold tracking-wider text-[#408054]">
          <Icon name="eye" size={15} /> MODE PREVIEW
        </span>
        <h1 className="mt-4 text-[26px] font-bold tracking-tight">Lihat seperti responden</h1>
        <p className="mt-1 text-xs text-[#94a096]">
          Isi formulir di bawah untuk mencoba pengalaman responden.
        </p>
      </div>
      <div className="mx-auto max-w-[620px] overflow-hidden rounded-xl border border-[#e7ebe5] bg-white shadow-[0_13px_40px_rgba(37,57,34,.045)]">
        <div className="h-[7px] bg-gradient-to-r from-[#286e4a] via-[#72aa75] to-[#d2e6b4]" />
        {submitted ? (
          <div className="px-6 py-18 text-center">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-[#e6f5e7] text-[#277345]">
              <Icon name="check" size={29} />
            </span>
            <h2 className="mt-5 text-[22px] font-bold">Formulir berhasil dikirim!</h2>
            <p className="mt-2 text-xs text-[#8b978d]">
              Preview berjalan dengan baik. Jawaban tidak disimpan.
            </p>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="mx-auto mt-6 flex items-center gap-3 rounded-md bg-[#176443] px-4 py-3 text-[11px] font-bold text-white hover:bg-[#104e34]"
            >
              Isi kembali <Icon name="arrow" size={16} />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="border-b border-[#eef1ec] px-6 pt-9 pb-7 md:px-10">
              <span className="text-[10px] font-extrabold tracking-[.14em] text-[#78a381]">
                FORMULIR
              </span>
              <h2 className="mt-2 text-[25px] font-bold tracking-tight">
                {form.title || "Formulir tanpa judul"}
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-[#849086]">{form.description}</p>
            </div>
            <div className="space-y-8 px-6 pt-8 pb-2 md:px-10">
              {form.fields.map((field) => (
                <FormField key={field.id} field={field} preview />
              ))}
            </div>
            <div className="flex items-center justify-between gap-3 px-6 py-8 md:px-10">
              <span className="max-w-32 text-[10px] leading-snug text-[#a5aea4]">
                * Menandakan pertanyaan wajib
              </span>
              <button
                type="submit"
                className="flex items-center gap-3 rounded-md bg-[#176443] px-4 py-3 text-[11px] font-bold text-white hover:bg-[#104e34]"
              >
                Kirim formulir <Icon name="arrow" size={16} />
              </button>
            </div>
          </form>
        )}
      </div>
      <p className="mt-5 text-center text-xs text-[#94a096]">
        Ini hanya preview. Jawaban tidak dikirim ke server.
      </p>
    </main>
  );
}
