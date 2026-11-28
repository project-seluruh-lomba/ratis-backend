# Flowchart dan Alur Role Staf/Kasir

Dokumen pendamping `PRD Ratis Role Staf Kasir.md`. Semua diagram ditulis dengan **Mermaid** sehingga bisa dirender di GitHub, VS Code (ekstensi Mermaid), atau mermaid.live. Alur mengikuti keputusan tim pada bagian 15.3 PRD.

Dokumen ini fokus pada apa yang dilakukan staf/kasir. Keputusan admin dan pemilik hanya ditampilkan sebagai batas alur, bukan sebagai aksi yang bisa dilakukan staf. Batas tanggung jawab antar role dijelaskan di bagian 2.

## Daftar diagram

| No | Diagram | Fitur PRD |
| --- | --- | --- |
| 1 | Peta navigasi panel staf | Semua |
| 2 | Batas tanggung jawab staf, pemilik, dan admin | Semua |
| 3 | Login dan logout | S1 |
| 4 | Status toko dan akses staf | S1, bagian 7.3 |
| 5 | Status akun staf | S1, bagian 7.4 |
| 6 | Dashboard operasional | S2 |
| 7 | Manajemen pesanan | S3 |
| 8 | Transisi status pesanan | S3, bagian 7.2 |
| 9 | Pembatalan dan pengembalian stok | S3 |
| 10 | Penyesuaian stok | S4 |
| 11 | Lihat produk dan kategori | S5 |
| 12 | Notifikasi pesanan baru | S6 |
| 13 | Profil dan ganti kata sandi | S7 (Could) |
| 14 | Aturan lintas alur | Semua |

## 1. Peta navigasi panel staf

```mermaid
flowchart TD
    L["Login Staf"] --> D["Dashboard Operasional"]
    D --> P["Pesanan"]
    D --> PR["Produk"]
    D --> ST["Stok"]
    D --> N["Notifikasi"]
    D --> PF["Profil Saya<br/>(Could)"]
    P --> PD["Detail Pesanan"]
    PD --> PA["Proses / Selesaikan / Batalkan"]
    PR --> PRD["Daftar Produk"]
    PRD --> PRT["Detail Produk"]
    PRT --> ST
    ST --> STA["Sesuaikan Stok"]
    ST --> STR["Riwayat Stok"]
    N --> ND["Daftar Notifikasi"]
    ND --> PD
```

Catatan:

- Menu Keuangan, Laporan, Staf, dan Pengaturan Toko tidak pernah muncul di panel staf.
- Saat toko `nonaktif`, semua halaman tetap dapat dibuka, tetapi tombol aksi tulis dinonaktifkan dan banner mode baca-saja ditampilkan.
- Staf tidak dapat membuka halaman pemilik atau admin; rute tersebut ditolak.

## 2. Batas tanggung jawab staf, pemilik, dan admin

| Aspek | Staf/kasir | Pemilik UMKM | Admin |
| --- | --- | --- | --- |
| Tujuan utama | Menjalankan operasional harian | Menjalankan usaha sendiri | Menjaga kualitas platform |
| Cakupan data | Tokonya sendiri | Tokonya sendiri | Lintas toko |
| Asal akun | Dibuat pemilik | Registrasi publik | Seeding |
| Status toko | Melihat status, tidak mengubah | Melihat status dan mengajukan ulang | Menyetujui, menolak, menonaktifkan, dan mengaktifkan |
| Produk | Hanya melihat | Mengelola | Tidak boleh mengubah |
| Stok | Menyesuaikan | Menyesuaikan | Tidak boleh mengubah |
| Pesanan | Memproses, menyelesaikan, membatalkan | Memproses, menyelesaikan, membatalkan | Hanya membaca |
| Keuangan dan laporan | Tidak dapat mengakses | Melihat pemasukan otomatis dan mencatat pengeluaran | Tidak mengakses keuangan toko |
| Kelola staf | Tidak dapat mengakses | Mengelola staf tokonya, maksimal 5 aktif | Menonaktifkan akun bermasalah |
| Kontak pelanggan | Pesanan tokonya | Pesanan tokonya | Hanya nama |
| Notifikasi | Pesanan baru tokonya | Pesanan baru, status toko, dan stok menipis | Log aktivitas dan monitoring platform |
| Endpoint | `/staff` dengan role `STAFF` | `/owner` dengan role `OWNER` | `/admin` dengan role `ADMIN` |

```mermaid
flowchart LR
    OW["Pemilik UMKM"] -->|"buat / ubah / nonaktifkan"| AK["Akun Staf"]
    OW -->|"kelola"| OPS["Produk, Stok, Pesanan, Keuangan, Staf"]
    ST["Staf/kasir"] -->|"proses / selesaikan / batalkan"| ORD["Pesanan Toko"]
    ST -->|"sesuaikan"| STK["Stok Toko"]
    ST -->|"lihat"| PRD["Produk dan Kategori"]
    ST -.->|"403 akses ditolak"| FIN["Keuangan, Laporan, Profil Toko, Kelola Staf"]
    AD["Admin"] -->|"verifikasi / nonaktifkan"| SH["Status Toko"]
    SH -->|"menentukan mode kerja"| ST
```

Batas tanggung jawab:

- Staf tidak dapat membuat akun sendiri, mengubah profil toko, atau mengelola produk.
- Staf tidak dapat melihat keuangan, laporan, dan ekspor; backend menolak dengan 403.
- Staf hanya melihat kontak pelanggan untuk pesanan tokonya.
- Admin tidak mengubah data operasional toko; admin hanya menentukan status toko.
- Pemilik menentukan akun staf dan dapat mereset password staf.

## 3. Login dan logout (S1)

```mermaid
flowchart TD
    A(["Buka halaman login bersama"]) --> B["Isi email dan password"]
    B --> C{"Validasi form?"}
    C -->|Tidak| C1["Tampilkan error validasi"] --> B
    C -->|Ya| D["POST /auth/login"]
    D --> E{"Kredensial benar?"}
    E -->|Tidak| E1["Pesan umum:<br/>Email atau password salah"]
    E1 --> E2{"Rate limit terlampaui?"}
    E2 -->|Ya| E3["Tahan sementara:<br/>terlalu banyak percobaan"]
    E2 -->|Tidak| B
    E -->|Ya| F{"Akun aktif?"}
    F -->|Tidak| F1["Pesan akun dinonaktifkan"]
    F -->|Ya| G{"Role akun?"}
    G -->|STAFF| H["Simpan token JWT<br/>berlaku 8 jam"]
    G -->|OWNER| H1["Arahkan ke panel pemilik"]
    G -->|ADMIN| H2["Arahkan ke login admin"]
    G -->|CUSTOMER| H3["Akses panel ditolak"]
    H --> I(["Dashboard staf"])
    I --> J["Klik Logout"]
    J --> K["Hapus token dari frontend"] --> A
    I --> T{"Token kedaluwarsa<br/>atau respons 401?"}
    T -->|Ya| T1["Arahkan ke login<br/>pesan sesi berakhir"] --> A
    I --> U{"Akun dinonaktifkan pemilik<br/>saat sesi berjalan?"}
    U -->|Ya| U1["401/403 pada permintaan berikutnya<br/>arahkan ke login"] --> A
```

Catatan:

- Staf memakai halaman login yang sama dengan pemilik; tujuan panel ditentukan oleh role.
- Staf dengan toko `nonaktif` tetap dapat login dan melihat data, tetapi panel berada dalam mode baca-saja.
- Akun staf nonaktif tidak dapat login. Token lama ditolak karena status akun diperiksa pada setiap permintaan.
- Rate limit login 10 percobaan per menit per alamat IP.

## 4. Status toko dan akses staf

```mermaid
stateDiagram-v2
    [*] --> pending: Registrasi pemilik
    pending --> aktif: Admin menyetujui
    pending --> ditolak: Admin menolak + alasan
    ditolak --> pending: Pemilik ajukan ulang
    aktif --> nonaktif: Admin menonaktifkan + alasan
    nonaktif --> aktif: Admin mengaktifkan kembali
```

| Status toko | Yang dapat dilakukan staf | Storefront | Pesanan baru | Aksi utama |
| --- | --- | --- | --- | --- |
| `aktif` | Semua fitur operasional staf | Tayang | Diterima | Proses pesanan dan jaga stok |
| `nonaktif` | Login, melihat dashboard, produk, pesanan, dan riwayat; tidak dapat mengubah status pesanan atau stok | Tidak tayang | Ditolak | Menunggu admin mengaktifkan kembali; penyelesaian pesanan lama oleh pemilik |
| `pending` | Akun staf tidak dibuat pada status ini; jika ada data lama, hanya baca | Tidak tayang | Tidak ada | Menunggu verifikasi admin |
| `ditolak` | Akun staf tidak dibuat pada status ini; jika ada data lama, hanya baca | Tidak tayang | Tidak ada | Menunggu pemilik memperbaiki dan mengajukan ulang |

Catatan:

- Staf hanya dibuat pemilik saat toko `aktif`, sehingga status `pending` dan `ditolak` bukan kondisi normal akun staf.
- Status toko hanya dapat diubah admin. Staf tidak dapat mengaktifkan atau menonaktifkan toko.
- Saat toko `nonaktif`, backend menolak aksi tulis staf dengan 403 atau 409, bukan hanya menonaktifkan tombol di frontend.
- Penyelesaian pesanan lama saat toko `nonaktif` dilakukan pemilik.

## 5. Status akun staf

```mermaid
stateDiagram-v2
    [*] --> aktif: Pemilik membuat staf
    aktif --> nonaktif: Pemilik menonaktifkan
    nonaktif --> aktif: Pemilik mengaktifkan kembali (slot aktif < 5)
```

| Status akun | Dampak |
| --- | --- |
| `aktif` | Staf dapat login dan bekerja sesuai status toko. |
| `nonaktif` | Staf tidak dapat login. Token lama ditolak pada permintaan berikutnya. Riwayat pesanan dan stok tetap tersimpan. |

Catatan:

- Staf tidak dihapus permanen agar jejak operasional tidak hilang.
- Mengaktifkan kembali hanya boleh jika jumlah staf aktif belum mencapai 5.
- Perubahan status akun staf hanya dapat dilakukan pemilik.

## 6. Dashboard operasional (S2)

```mermaid
flowchart TD
    A(["Staf login"]) --> B["GET /staff/dashboard"]
    B --> C{"Status toko?"}
    C -->|nonaktif| D["Banner mode baca-saja<br/>aksi tulis dinonaktifkan"]
    C -->|aktif| E["Mode operasional"]
    D --> F["Tampilkan kartu operasional"]
    E --> F
    F --> F1["Pesanan perlu diproses<br/>(pending + diproses)"]
    F --> F2["Pesanan masuk hari ini"]
    F --> F3["Pesanan selesai hari ini"]
    F --> F4["Produk stok menipis"]
    F --> F5["Lima pesanan terbaru"]
    F1 --> G["Klik kartu -> daftar terfilter"]
    F5 --> H["Klik pesanan -> detail"]
    F --> I["Tidak ada omzet, pemasukan,<br/>pengeluaran, atau laba"]
    F --> J{"Data kosong?"}
    J -->|Ya| K["Pesan kosong yang ramah"]
    J -->|Tidak| L["Tampilkan data dan waktu pembaruan"]
    L --> M["Tombol Muat ulang"]
    M --> B
```

Catatan:

- Dashboard staf hanya memuat informasi operasional, bukan informasi keuangan.
- "Stok menipis" berarti stok kurang dari atau sama dengan `minStock` produk.
- Semua tanggal memakai WIB.
- Saat backend gratis sedang bangun, tampilkan kerangka loading dan teks "Menyiapkan data, mohon tunggu".

## 7. Manajemen pesanan (S3)

```mermaid
flowchart TD
    A(["Buka menu Pesanan"]) --> B["GET /staff/orders<br/>filter status, tanggal,<br/>cari kode atau nama pelanggan"]
    B --> C{"Ada hasil?"}
    C -->|Tidak| C1["Pesan kosong + tombol Reset filter"]
    C -->|Ya| D["Daftar pesanan + pagination"]
    D --> E["Buka detail<br/>GET /staff/orders/:id"]
    E --> F{"Status toko?"}
    F -->|nonaktif| F1["Mode baca-saja<br/>tombol aksi nonaktif"]
    F -->|aktif| G{"Status pesanan?"}
    G -->|pending| H{"Aksi"}
    G -->|diproses| I{"Aksi"}
    G -->|selesai / dibatalkan| J["Hanya baca<br/>tidak ada aksi status"]
    H -->|Proses| K["PATCH /staff/orders/:id/status<br/>status diproses + riwayat"]
    H -->|Batalkan| L["Lihat alur pembatalan"]
    I -->|Selesaikan| M["PATCH status selesai<br/>+ completedAt"]
    I -->|Batalkan| L
    M --> N["Transaksi: finance income dibuat<br/>tidak terlihat oleh staf"]
    K --> O{"Konflik status 409?"}
    N --> O
    O -->|Ya| P["Muat ulang detail<br/>pesan data sudah berubah"]
    O -->|Tidak| Q(["Status diperbarui<br/>di daftar dan detail"])
```

### Urutan interaksi memproses pesanan

```mermaid
sequenceDiagram
    participant S as Staf
    participant FE as Frontend Staf
    participant BE as Backend NestJS
    participant DB as Database

    S->>FE: Buka pesanan pending
    FE->>BE: GET /staff/orders/:id
    BE->>DB: Ambil pesanan, item, dan riwayat<br/>(shopId dari token)
    DB-->>BE: Data
    BE-->>FE: 200 detail pesanan
    FE-->>S: Detail dan tombol Proses

    S->>FE: Klik Proses
    FE->>BE: PATCH /staff/orders/:id/status status diproses
    BE->>DB: Cek role STAFF, status toko, dan transisi
    DB-->>BE: Valid
    BE->>DB: Simpan status + riwayat status
    DB-->>BE: Sukses
    BE-->>FE: 200 status diproses
    FE-->>S: Toast sukses

    S->>FE: Klik Selesaikan
    FE->>BE: PATCH /staff/orders/:id/status status selesai
    BE->>DB: Transaksi: status selesai, completedAt, finance income
    DB-->>BE: Sukses
    BE-->>FE: 200 status selesai
    FE-->>S: Pesanan selesai
```

Catatan:

- Staf tidak dapat mengubah item atau total pesanan.
- Staf hanya melihat kontak pelanggan lengkap untuk pesanan tokonya.
- Pemasukan otomatis dibuat saat pesanan selesai, tetapi staf tidak dapat melihatnya.
- Pesanan `selesai` dan `dibatalkan` bersifat final.

## 8. Transisi status pesanan

```mermaid
stateDiagram-v2
    [*] --> pending: Checkout pelanggan
    pending --> diproses: Staf atau pemilik memproses
    pending --> dibatalkan: Staf atau pemilik membatalkan + alasan
    pending --> dibatalkan: Pelanggan membatalkan
    diproses --> selesai: Staf atau pemilik menyelesaikan
    diproses --> dibatalkan: Staf atau pemilik membatalkan + alasan
    selesai --> [*]
    dibatalkan --> [*]
```

| Transisi | Pelaku | Efek stok | Efek keuangan |
| --- | --- | --- | --- |
| `pending` ke `diproses` | Staf atau pemilik | Tidak berubah | Tidak ada |
| `pending` ke `dibatalkan` | Staf, pemilik, atau pelanggan | Dikembalikan | Tidak ada |
| `diproses` ke `selesai` | Staf atau pemilik | Tidak berubah | Pemasukan otomatis dibuat |
| `diproses` ke `dibatalkan` | Staf atau pemilik | Dikembalikan | Tidak ada |

Catatan:

- Transisi di luar tabel ditolak dengan kode 409.
- Status `selesai` dan `dibatalkan` tidak dapat diubah lagi.
- Pembatalan oleh staf wajib memiliki alasan 10-300 karakter.
- Saat toko `nonaktif`, staf tidak dapat melakukan transisi apa pun; penyelesaian pesanan lama dilakukan pemilik.

## 9. Pembatalan dan pengembalian stok (S3)

```mermaid
flowchart TD
    A(["Buka detail pesanan"]) --> B{"Status pending atau diproses?"}
    B -->|Tidak| B1["409: pesanan final<br/>tidak bisa dibatalkan"]
    B -->|Ya| C{"Status toko aktif?"}
    C -->|Tidak| C1["403 atau 409: aksi tulis ditolak<br/>penyelesaian oleh pemilik"]
    C -->|Ya| D["Klik Batalkan"]
    D --> E["Isi alasan 10-300 karakter"]
    E --> F{"Alasan valid?"}
    F -->|Tidak| F1["400: error validasi"] --> E
    F -->|Ya| G["PATCH /staff/orders/:id/status<br/>status dibatalkan"]
    G --> H{"Status masih pending atau diproses?"}
    H -->|Tidak| H1["409: data sudah berubah<br/>muat ulang detail"]
    H -->|Ya| I["Transaksi: status dibatalkan<br/>+ cancellationReason + riwayat"]
    I --> J["Kembalikan stok tiap item<br/>+ stock_movement pembatalan"]
    J --> K["Tidak membuat finance income"]
    K --> L(["Pesanan dibatalkan<br/>stok kembali tepat sekali"])
```

Catatan:

- Pengembalian stok dilakukan dalam transaksi yang sama dengan perubahan status.
- Klik ganda atau pembatalan ulang tidak mengembalikan stok dua kali.
- Pembatalan oleh pelanggan juga mengembalikan stok, tetapi alasan mengikuti PRD pelanggan.
- Setelah pesanan `selesai`, tidak ada pembatalan atau refund.

## 10. Penyesuaian stok (S4)

```mermaid
flowchart TD
    A(["Buka Produk lalu Detail Produk"]) --> B["GET /staff/products/:id"]
    B --> C["Lihat riwayat stok<br/>GET /staff/products/:id/stock-movements"]
    C --> D{"Status toko?"}
    D -->|nonaktif| D1["Mode baca-saja<br/>tombol Sesuaikan Stok nonaktif"]
    D -->|aktif| E["Klik Sesuaikan Stok"]
    E --> F["Pilih Tambah / Kurangi<br/>jumlah > 0, alasan 5-200,<br/>catatan opsional"]
    F --> G{"Validasi?"}
    G -->|Tidak| G1["400: error per kolom"] --> F
    G -->|Ya| H["Hitung stok baru"]
    H --> I{"Stok baru < 0?"}
    I -->|Ya| I1["400: stok tidak cukup"] --> F
    I -->|Tidak| J["Transaksi: update stok<br/>+ stock_movement + actorId staf"]
    J --> K{"Stok <= minStock?"}
    K -->|Ya| L["Notifikasi stok menipis<br/>untuk pemilik jika belum ada"]
    K -->|Tidak| M["Tidak ada notifikasi baru"]
    L --> N(["Stok dan riwayat diperbarui<br/>dashboard ikut berubah"])
    M --> N
```

Catatan:

- Staf hanya dapat menyesuaikan stok, bukan mengubah nama, harga, kategori, atau status produk.
- Stok dikurangi saat pesanan dibuat pelanggan, bukan saat pesanan diproses.
- Pembatalan pesanan mengembalikan stok tepat satu kali; penyelesaian tidak mengubah stok lagi.
- Riwayat stok bersifat append-only dan mencatat staf sebagai pelaku.
- Notifikasi stok menipis ditujukan ke pemilik sesuai PRD pemilik; staf hanya menerima notifikasi pesanan baru.

## 11. Lihat produk dan kategori (S5)

```mermaid
flowchart TD
    A(["Buka menu Produk"]) --> B["GET /staff/products<br/>cari, filter kategori, status, stok menipis"]
    B --> C["Daftar produk + badge<br/>Stok menipis / Stok habis"]
    C --> D["Buka detail produk"]
    D --> E["Info produk + riwayat stok"]
    E --> F["Tidak ada tombol tambah, ubah,<br/>hapus, atau nonaktifkan"]
    F --> G{"Staf memanggil endpoint ubah?"}
    G -->|Ya| H["403: akses ditolak"]
    G -->|Tidak| I(["Selesai"])
    C --> J["Lihat kategori<br/>GET /staff/categories"]
    J --> I
```

Catatan:

- Harga produk boleh dilihat karena dibutuhkan saat melayani pesanan, tetapi omzet dan laporan tidak ditampilkan.
- Produk nonaktif tetap terlihat di panel staf dengan badge agar staf tahu produk tersebut tidak tayang.
- Produk dengan stok 0 tetap tampil dan ditandai "Stok habis".
- Staf tidak dapat membuka produk toko lain; ID di luar cakupan menghasilkan 403 atau 404.

## 12. Notifikasi pesanan baru (S6)

```mermaid
flowchart TD
    A["Pelanggan membuat pesanan"] --> B["Backend membuat notifikasi<br/>untuk pemilik + staf aktif toko"]
    B --> C["Staf polling setiap 30 detik<br/>dan saat tab kembali aktif"]
    C --> D["Badge lonceng bertambah"]
    D --> E{"Aksi"}
    E -->|Buka dropdown| F["Lima notifikasi terbaru"]
    E -->|Buka halaman| G["Daftar lengkap + filter belum dibaca"]
    F --> H["Klik item -> tandai dibaca<br/>lalu buka detail pesanan"]
    G --> I["Tandai satu atau semua dibaca"]
    H --> J["Badge berkurang"]
    I --> J
    H --> K{"Pesanan masih ada?"}
    K -->|Tidak| L["Arahkan ke daftar pesanan"]
    K -->|Ya| M(["Buka detail pesanan"])
```

Catatan:

- Staf hanya menerima notifikasi pesanan baru untuk tokonya.
- Notifikasi keuangan, verifikasi toko, dan perubahan staf tidak dikirim ke staf.
- Tidak ada email atau WhatsApp pada versi ini.
- Jika data terkait sudah tidak ada, tautan diarahkan ke halaman daftar yang sesuai.

## 13. Profil dan ganti kata sandi (S7, Could)

```mermaid
flowchart TD
    A(["Buka Profil Saya"]) --> B["GET /staff/profile"]
    B --> C["Tampilkan nama, email, role,<br/>toko, status akun, status toko"]
    C --> D["Klik Ganti Kata Sandi"]
    D --> E["Isi password lama,<br/>password baru, konfirmasi"]
    E --> F{"Validasi?"}
    F -->|Tidak| F1["400: error per kolom"] --> E
    F -->|Ya| G["PATCH /staff/profile/password"]
    G --> H{"Password lama cocok?"}
    H -->|Tidak| H1["400: password lama salah"] --> E
    H -->|Ya| I{"Password baru sama dengan lama?"}
    I -->|Ya| I1["400: pilih password baru"] --> E
    I -->|Tidak| J["Simpan hash password baru"]
    J --> K(["Toast sukses<br/>form dikosongkan"])
    C --> L["Keterangan: nama, email,<br/>dan reset password oleh pemilik"]
```

Catatan:

- Staf tidak dapat mengubah nama, email, role, atau toko.
- Pemilik tetap dapat mereset password staf kapan saja.
- Fitur ini berprioritas Could dan boleh ditunda jika waktu terbatas.

## 14. Aturan lintas alur

- Semua endpoint staf memerlukan JWT dengan role `STAFF`; role lain mendapat 403.
- Staf tidak dapat membuka endpoint pemilik (`/owner`) atau admin (`/admin`).
- `shopId` selalu diambil dari token, bukan dari input klien, agar data tidak bocor antar toko.
- Staf hanya dapat membaca dan mengubah data toko tempat ia terdaftar.
- Staf hanya dapat melihat kontak pelanggan untuk pesanan tokonya; admin hanya melihat nama pelanggan.
- Staf tidak dapat melihat keuangan, laporan, ekspor, profil toko, atau mengelola staf dan produk.
- Hanya pemilik yang dapat membuat, menonaktifkan, mengaktifkan, dan mereset password staf.
- Jumlah staf aktif maksimal 5 per toko. Staf tidak dihapus permanen.
- Saat toko `nonaktif`, staf dapat login dan melihat data, tetapi semua aksi tulis ditolak backend.
- Penyelesaian pesanan lama saat toko `nonaktif` dilakukan pemilik.
- Transisi status pesanan hanya `pending` ke `diproses`, `diproses` ke `selesai`, dan `pending` atau `diproses` ke `dibatalkan`; transisi lain ditolak dengan 409.
- Pembatalan oleh staf wajib memiliki alasan 10-300 karakter.
- Stok dikurangi saat pesanan dibuat, dikembalikan tepat satu kali saat dibatalkan, dan tidak berubah saat pesanan selesai.
- Pesanan `selesai` membuat satu pemasukan otomatis; pesanan `dibatalkan` tidak membuat pemasukan.
- Setelah pesanan selesai, tidak ada pembatalan atau pengembalian dana.
- Penyesuaian stok tidak boleh menghasilkan stok negatif dan selalu mencatat alasan serta pelaku.
- Perubahan status pesanan, pengembalian stok, dan penyesuaian stok memakai transaksi database.
- Token JWT berlaku 8 jam dan login dibatasi 10 percobaan per menit per alamat IP.
- Notifikasi hanya tersedia di dalam aplikasi; staf hanya menerima notifikasi pesanan baru.
