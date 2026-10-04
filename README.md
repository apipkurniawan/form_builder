# Formcraft

Form builder berbasis Next.js Pages Router, React, TypeScript, dan Tailwind CSS.

## Menjalankan proyek

```bash
npm install
npm run dev
```

Buka `http://localhost:3000` (atau port yang ditampilkan Next.js). Halaman utama menampilkan daftar formulir di workspace.

## Fitur

- Daftar workspace di `/workspace` dengan pencarian, pengurutan, buat, duplikat, dan hapus formulir.
- Setiap formulir memiliki editor sendiri di `/forms/[id]`. Draft lama otomatis masuk ke workspace.
- Tambah field dengan drag and drop atau klik komponen.
- Ubah urutan field, edit label dan opsi, duplikat, serta hapus field.
- Preview formulir dan coba validasi field wajib.
- Simpan semua formulir otomatis di `localStorage` dan ekspor struktur form ke JSON.

Preview hanya simulasi di browser. Jawaban responden tidak dikirim atau disimpan ke server.

## Kualitas kode

```bash
npm run format # ESLint --fix dengan aturan Prettier
npm run lint   # Pemeriksaan ESLint dan format
npm run build  # TypeScript dan build produksi
```

Logika form dan penyimpanan workspace ada di `lib/form-builder.ts`, `lib/workspace.ts`, dan `hooks/use-form-builder.ts`. Komponen UI ada di `components/form-builder/`. Styling utama memakai kelas Tailwind; `styles/globals.css` hanya memuat Tailwind.
