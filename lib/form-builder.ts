export type FieldType =
  "text" | "email" | "number" | "textarea" | "select" | "radio" | "checkbox" | "date";

export type Field = {
  id: string;
  type: FieldType;
  label: string;
  placeholder: string;
  required: boolean;
  help: string;
  options: string[];
};

export type FormState = {
  title: string;
  description: string;
  fields: Field[];
};

export const STORAGE_KEY = "formcraft-draft-v1";

export const INITIAL_FORM: FormState = {
  title: "Formulir Pendaftaran",
  description: "Bantu kami mengenal Anda lebih baik. Isi formulir singkat berikut untuk memulai.",
  fields: [
    {
      id: "name",
      type: "text",
      label: "Nama lengkap",
      placeholder: "Masukkan nama lengkap Anda",
      required: true,
      help: "",
      options: [],
    },
    {
      id: "email",
      type: "email",
      label: "Alamat email",
      placeholder: "nama@contoh.com",
      required: true,
      help: "Kami tidak akan membagikan alamat email Anda.",
      options: [],
    },
    {
      id: "topic",
      type: "select",
      label: "Apa yang ingin Anda pelajari?",
      placeholder: "Pilih salah satu topik",
      required: false,
      help: "",
      options: ["Desain produk", "Pengembangan web", "Strategi bisnis"],
    },
  ],
};

export const FIELD_CATALOG = [
  { type: "text", name: "Teks singkat", detail: "Jawaban satu baris", icon: "text" },
  { type: "email", name: "Email", detail: "Alamat email valid", icon: "mail" },
  { type: "number", name: "Angka", detail: "Input numerik", icon: "hash" },
  { type: "textarea", name: "Teks panjang", detail: "Jawaban beberapa baris", icon: "align" },
  { type: "select", name: "Dropdown", detail: "Pilih satu pilihan", icon: "chevron" },
  { type: "radio", name: "Pilihan ganda", detail: "Pilihan terlihat", icon: "circle" },
  { type: "checkbox", name: "Kotak centang", detail: "Pilihan ya atau tidak", icon: "check" },
  { type: "date", name: "Tanggal", detail: "Pilih tanggal", icon: "calendar" },
] as const;

const DEFAULT_LABELS: Record<FieldType, string> = {
  text: "Pertanyaan singkat",
  email: "Alamat email",
  number: "Angka",
  textarea: "Pertanyaan panjang",
  select: "Pilih salah satu",
  radio: "Pilih salah satu",
  checkbox: "Saya menyetujui",
  date: "Pilih tanggal",
};

export function createField(type: FieldType): Field {
  return {
    id: crypto.randomUUID(),
    type,
    label: DEFAULT_LABELS[type],
    placeholder:
      type === "email"
        ? "nama@contoh.com"
        : type === "select"
          ? "Pilih salah satu"
          : type === "text"
            ? "Tulis jawaban Anda..."
            : "",
    required: false,
    help: "",
    options: type === "select" || type === "radio" ? ["Pilihan 1", "Pilihan 2", "Pilihan 3"] : [],
  };
}

export function moveField(fields: Field[], id: string, targetIndex: number): Field[] {
  const currentIndex = fields.findIndex((field) => field.id === id);
  if (currentIndex < 0) return fields;

  const next = [...fields];
  const [field] = next.splice(currentIndex, 1);
  const insertionIndex = targetIndex > currentIndex ? targetIndex - 1 : targetIndex;
  next.splice(insertionIndex, 0, field);
  return next;
}

export function isFieldType(value: string): value is FieldType {
  return FIELD_CATALOG.some((item) => item.type === value);
}

export function readSavedForm(): FormState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed: unknown = JSON.parse(stored);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("fields" in parsed) ||
      !Array.isArray(parsed.fields) ||
      !("title" in parsed) ||
      typeof parsed.title !== "string" ||
      !("description" in parsed) ||
      typeof parsed.description !== "string"
    )
      return null;
    return parsed as FormState;
  } catch {
    return null;
  }
}
