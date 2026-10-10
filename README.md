# Formcraft

Form builder berbasis Next.js Pages Router, React, TypeScript, Tailwind CSS, dan Supabase. Tanpa konfigurasi Supabase, aplikasi tetap berjalan dengan data lokal di browser.

## Menjalankan proyek

```bash
npm install
npm run dev
```

Buka `http://localhost:3000` (atau port yang ditampilkan Next.js). Halaman utama menampilkan daftar formulir di workspace.

## Menghubungkan Supabase

1. Buat proyek Supabase dan aktifkan **Anonymous Sign-Ins** di pengaturan Authentication.
2. Jalankan SQL di `supabase/migrations/20261004000000_create_formcraft_forms.sql` melalui SQL Editor atau Supabase CLI. Tabel menggunakan Row Level Security agar setiap identitas anonim hanya dapat mengakses formulirnya sendiri.
3. Salin `.env.example` ke `.env.local`, lalu isi URL proyek dan **publishable key** Supabase.
4. Jalankan ulang server Next.js. Status penyimpanan tampil di workspace dan editor.

Jangan gunakan service role key pada variabel `NEXT_PUBLIC_*`. Identitas anonim melekat pada sesi browser; jika data browser dihapus atau pengguna pindah perangkat, formulir di database tidak bisa diakses kembali tanpa sistem login permanen.

Jika kredensial belum diisi, anonymous sign-in belum aktif, tabel belum dibuat, atau koneksi gagal, aplikasi memakai penyimpanan lokal. Perubahan lokal yang belum tersinkron akan dicoba lagi saat Supabase tersambung. Draft lama di `localStorage` ikut dimigrasikan saat pertama kali terhubung.

## Fitur

- Nama workspace dapat diubah di `/workspace`; nama disimpan di browser dan disinkronkan ke metadata akun Supabase saat terhubung.
- Daftar workspace di `/workspace` dengan pencarian, pengurutan, buat, duplikat, dan hapus formulir.
- Setiap formulir memiliki editor sendiri di `/forms/[id]`.
- Tambah field dengan drag and drop atau klik komponen.
- Ubah urutan field, edit label dan opsi, duplikat, serta hapus field.
- Preview formulir dan coba validasi field wajib.
- Simpan formulir otomatis dan ekspor struktur form ke JSON.

Preview hanya simulasi di browser. Jawaban responden tidak dikirim atau disimpan ke server.

## Kualitas kode

```bash
npm run format # ESLint --fix dengan aturan Prettier
npm run lint   # Pemeriksaan ESLint dan format
npm run build  # TypeScript dan build produksi
```

Logika form ada di `lib/form-builder.ts` dan `hooks/use-form-builder.ts`. Penyimpanan lokal dan sinkronisasi Supabase ada di `lib/workspace.ts` dan `lib/workspace-repository.ts`. Komponen UI ada di `components/form-builder/`.
