# Flowchart dan Alur Role Admin

Dokumen pendamping `PRD Ratis Role Admin.md`. Semua diagram ditulis dengan **Mermaid** sehingga bisa dirender di GitHub, VS Code (ekstensi Mermaid), atau mermaid.live. Alur mengikuti keputusan tim pada bagian 15.3 PRD.

## Daftar diagram

| No | Diagram | Fitur PRD |
| --- | --- | --- |
| 1 | Peta navigasi panel admin | Semua |
| 2 | Login dan logout | A1 |
| 3 | Verifikasi UMKM | A3 |
| 4 | Transisi status UMKM | A3, A4 |
| 5 | Kelola UMKM | A4 |
| 6 | Kelola kategori | A5 |
| 7 | Monitoring pesanan | A6 |
| 8 | Kelola pengguna | A7 |
| 9 | Pencatatan log aktivitas | A8 (Could) |
| 10 | Aturan lintas alur | Semua |

## 1. Peta navigasi panel admin

```mermaid
flowchart TD
    L["Login Admin"] --> D["Dashboard Global"]
    D --> M["Kelola UMKM"]
    D --> K["Kelola Kategori"]
    D --> P["Monitoring Pesanan"]
    D --> U["Kelola Pengguna"]
    D --> G["Log Aktivitas<br/>(Could)"]
    M --> MD["Daftar UMKM"]
    MD --> MDT["Detail UMKM"]
    MDT --> V["Verifikasi / Ubah Status"]
    K --> KD["Tabel Kategori"]
    P --> PD["Detail Pesanan<br/>(hanya baca)"]
    U --> UD["Nonaktifkan / Aktifkan Akun"]
    G --> GD["Filter Log"]
```

## 2. Login dan logout (A1)

```mermaid
flowchart TD
    A(["Buka halaman login"]) --> B["Isi email dan password"]
    B --> C{"Validasi form?"}
    C -->|Tidak| C1["Tampilkan error validasi"]
    C1 --> B
    C -->|Ya| E["POST /auth/login"]
    E --> F{"Kredensial benar?"}
    F -->|Tidak| F1["Pesan umum:<br/>Email atau password salah"]
    F1 --> F2{"Rate limit terlampaui?"}
    F2 -->|Ya| F3["Tahan sementara:<br/>terlalu banyak percobaan"]
    F2 -->|Tidak| B
    F -->|Ya| G{"Akun aktif dan role ADMIN?"}
    G -->|Tidak| G1["Pesan akun dinonaktifkan<br/>atau akses ditolak"]
    G -->|Ya| H["Simpan token JWT<br/>(berlaku 8 jam)"]
    H --> I(["Dashboard"])
    I --> J["Klik Logout"]
    J --> K["Hapus token dari frontend"]
    K --> A
    I --> T{"Token kedaluwarsa<br/>atau respons 401?"}
    T -->|Ya| T1["Arahkan ke login<br/>pesan sesi berakhir"]
    T1 --> A
```

Catatan:

- Rate limit login 10 percobaan per menit per alamat IP.
- Pengguna non-admin yang membuka halaman admin ditolak.
- Admin yang sudah login dan membuka halaman login langsung diarahkan ke dashboard.

## 3. Verifikasi UMKM (A3)

```mermaid
flowchart TD
    A(["Admin membuka daftar UMKM"]) --> B["Filter status = pending"]
    B --> C["Pilih UMKM atau klik Tinjau"]
    C --> D["GET /admin/shops/:id"]
    D --> E["Periksa profil toko, data pemilik,<br/>NIB dan foto usaha bila diisi"]
    E --> F{"Keputusan admin"}
    F -->|Setujui| G["Dialog konfirmasi Setujui"]
    G --> H["PATCH /admin/shops/:id/approve"]
    H --> I{"Status masih pending?"}
    I -->|Tidak| J["409: data sudah berubah<br/>muat ulang halaman"]
    I -->|Ya| K["Transaksi: status aktif<br/>+ riwayat + log admin"]
    K --> L(["Toko tampil di storefront"])
    F -->|Tolak| M["Dialog Tolak<br/>isi alasan 10-300 karakter"]
    M --> N{"Alasan valid?"}
    N -->|Tidak| M
    N -->|Ya| O["PATCH /admin/shops/:id/reject"]
    O --> P{"Status masih pending?"}
    P -->|Tidak| J
    P -->|Ya| Q["Transaksi: status ditolak<br/>+ alasan + riwayat + log"]
    Q --> R(["Pemilik melihat alasan"])
    R --> S["Pemilik memperbaiki data"]
    S --> T["Ajukan ulang tanpa batas jumlah"]
    T --> U["Status kembali pending<br/>riwayat penolakan tetap ada"]
    U --> B
```

### Urutan interaksi verifikasi

```mermaid
sequenceDiagram
    actor Admin
    participant FE as Frontend Admin
    participant BE as Backend NestJS
    participant DB as Database

    Admin->>FE: Buka detail UMKM pending
    FE->>BE: GET /admin/shops/:id
    BE->>DB: Ambil toko, pemilik, dan riwayat status
    DB-->>BE: Data
    BE-->>FE: 200 detail UMKM
    FE-->>Admin: Tampilkan detail verifikasi

    Admin->>FE: Setujui dan konfirmasi
    FE->>BE: PATCH /admin/shops/:id/approve
    BE->>DB: Cek status toko
    alt Status masih pending
        BE->>DB: Transaksi: status aktif, riwayat, log
        DB-->>BE: Sukses
        BE-->>FE: 200 toko aktif
        FE-->>Admin: Toast sukses dan status baru
    else Status sudah berubah
        BE-->>FE: 409 konflik
        FE-->>Admin: Pesan data berubah, muat ulang
    end
```

## 4. Transisi status UMKM

```mermaid
stateDiagram-v2
    [*] --> pending: Pemilik mendaftar
    pending --> aktif: Admin menyetujui
    pending --> ditolak: Admin menolak + alasan
    ditolak --> pending: Pemilik mengajukan ulang
    aktif --> nonaktif: Admin menonaktifkan + alasan
    nonaktif --> aktif: Admin mengaktifkan kembali
```

Transisi di luar diagram ditolak dengan kode 409. NIB dan foto usaha opsional, sehingga UMKM tanpa NIB tetap dapat diverifikasi.

## 5. Kelola UMKM (A4)

```mermaid
flowchart TD
    A(["Buka daftar UMKM"]) --> B["Cari nama toko atau pemilik<br/>filter status + pagination"]
    B --> C["Buka detail UMKM"]
    C --> D{"Status toko?"}
    D -->|pending| E["Tombol Setujui atau Tolak<br/>lihat alur verifikasi"]
    D -->|aktif| F["Tombol Nonaktifkan"]
    D -->|nonaktif| G["Tombol Aktifkan"]
    D -->|ditolak| H["Menunggu pengajuan ulang pemilik"]
    F --> I["Isi alasan wajib 10-300 karakter"]
    I --> J["Konfirmasi"]
    J --> K["PATCH /admin/shops/:id/status"]
    K --> L{"Transisi valid?"}
    L -->|Tidak| M["409: status tidak valid"]
    L -->|Ya| N["Status nonaktif<br/>hilang dari publik<br/>pesanan baru ditolak<br/>data tetap tersimpan"]
    G --> O["Konfirmasi"]
    O --> P["PATCH status aktif"]
    P --> Q{"Transisi valid?"}
    Q -->|Tidak| M
    Q -->|Ya| R(["Toko tampil kembali"])
```

Catatan:

- Penonaktifan tidak menghapus produk, pesanan, atau keuangan.
- Pesanan lama yang masih pending atau diproses tetap bisa diselesaikan pemilik.
- Pemilik dan staf melihat banner status toko.

## 6. Kelola kategori (A5)

```mermaid
flowchart TD
    A(["Buka halaman kategori"]) --> B["Cari kategori berdasarkan nama"]
    B --> C{"Aksi"}
    C -->|Tambah| D["Isi nama 2-40 karakter"]
    D --> E{"Nama unik?<br/>tanpa peka huruf dan spasi tepi"}
    E -->|Tidak| F["409: tampilkan pesan di bawah kolom"]
    F --> D
    E -->|Ya| G["POST /admin/categories"]
    G --> H(["Kategori muncul di tabel<br/>dan pilihan produk pemilik"])
    C -->|Ubah| I["Ubah nama atau status aktif"]
    I --> J["PATCH /admin/categories/:id"]
    J --> H
    C -->|Hapus| K{"Ada produk memakai?"}
    K -->|Ya| L["409: tolak hapus<br/>sarankan nonaktifkan"]
    K -->|Tidak| M["DELETE /admin/categories/:id"]
    M --> N(["Kategori terhapus"])
    C -->|Nonaktifkan| O["Saklar status + konfirmasi singkat"]
    O --> P["Kategori tidak muncul<br/>untuk produk baru"]
    P --> H
```

Catatan: ubah nama memakai validasi unik yang sama. Kategori nonaktif tetap tampil pada produk lama.

## 7. Monitoring pesanan (A6)

```mermaid
flowchart TD
    A(["Buka monitoring pesanan"]) --> B["Atur filter:<br/>status, toko, tanggal, kode pesanan"]
    B --> C["GET /admin/orders"]
    C --> D{"Ada hasil?"}
    D -->|Tidak| E["Pesan kosong + tombol Reset filter"]
    D -->|Ya| F["Tabel pesanan + ringkasan filter"]
    F --> G["Buka panel detail"]
    G --> H["Lihat item, total, dan riwayat status"]
    H --> I(["Selesai - tidak ada aksi ubah status"])
```

Catatan: data pelanggan dibatasi pada nama, dan kombinasi filter tercermin di alamat halaman.

## 8. Kelola pengguna (A7)

```mermaid
flowchart TD
    A(["Buka kelola pengguna"]) --> B["Cari nama atau email<br/>filter role dan status"]
    B --> C["Pilih akun"]
    C --> D{"Aksi = nonaktifkan?"}
    D -->|Tidak| G["Dialog konfirmasi aktifkan"]
    D -->|Ya| E{"Akun sendiri?"}
    E -->|Ya| F["Blokir + tampilkan alasan"]
    E -->|Tidak| H{"Admin aktif terakhir?"}
    H -->|Ya| F
    H -->|Tidak| I["Dialog konfirmasi nonaktifkan"]
    I --> J{"Pemilik UMKM?"}
    J -->|Ya| K["Jelaskan toko tidak ikut nonaktif<br/>tawarkan tautan ke detail toko"]
    J -->|Tidak| L["Lanjut konfirmasi"]
    K --> L
    L --> M["PATCH /admin/users/:id/status"]
    G --> M
    M --> N{"Berhasil?"}
    N -->|Tidak| O["Tampilkan error"]
    N -->|Ya| P["Akun nonaktif atau aktif<br/>token lama ditolak saat otorisasi"]
```

Catatan:

- Menonaktifkan pemilik tidak otomatis menonaktifkan toko.
- Akun yang dinonaktifkan tidak bisa login dan mendapat pesan yang jelas.

## 9. Pencatatan log aktivitas (A8, Could)

```mermaid
flowchart TD
    A(["Aksi admin berhasil"]) --> B["Service memanggil satu fungsi pencatat"]
    B --> C["Simpan ke admin_logs:<br/>admin, aksi, objek, alasan, waktu"]
    C --> D["Halaman log (Could)"]
    D --> E["Filter aksi, rentang tanggal, pencarian"]
    E --> F["Tabel log + tautan ke objek terkait"]
```

Pencatatan log diimplementasikan sejak awal. Halaman log dikerjakan jika waktu tersisa.

## 10. Aturan lintas alur

- Semua endpoint admin memerlukan JWT dengan role `ADMIN`; role lain mendapat 403.
- Setiap aksi berisiko (tolak, nonaktifkan, hapus) melewati dialog konfirmasi.
- Alasan penolakan dan penonaktifan wajib 10-300 karakter.
- Transisi status yang tidak valid ditolak dengan 409.
- Perubahan status UMKM, riwayat, dan log dicatat dalam satu transaksi database.
- Token JWT berlaku 8 jam; login dibatasi 10 percobaan per menit per alamat IP.
- Admin tidak bisa menonaktifkan akunnya sendiri atau admin aktif terakhir.
- NIB dan foto usaha opsional; UMKM tanpa NIB tetap dapat mendaftar dan diverifikasi.
- Penonaktifan tidak menghapus data apa pun.
