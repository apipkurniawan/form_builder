# Formcraft

Form builder berbasis Next.js Pages Router, React, TypeScript, dan Tailwind CSS.

## Menjalankan proyek

```bash
npm install
npm run dev
```

Buka `http://localhost:3000` (atau port yang ditampilkan Next.js).

## Fitur

- Tambah field dengan drag and drop atau klik komponen.
- Ubah urutan field, edit label dan opsi, duplikat, serta hapus field.
- Preview formulir dan coba validasi field wajib.
- Simpan draft otomatis di `localStorage` dan ekspor struktur form ke JSON.

Preview hanya simulasi di browser. Jawaban responden tidak dikirim atau disimpan ke server.

## Kualitas kode

```bash
npm run format # ESLint --fix dengan aturan Prettier
npm run lint   # Pemeriksaan ESLint dan format
npm run build  # TypeScript dan build produksi
```

Logika form ada di `lib/form-builder.ts` dan `hooks/use-form-builder.ts`. Komponen UI ada di `components/form-builder/`. Styling utama memakai kelas Tailwind; `styles/globals.css` hanya memuat Tailwind.
