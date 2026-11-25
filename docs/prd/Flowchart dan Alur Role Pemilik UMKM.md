# Flowchart dan Alur Role Pemilik UMKM

Dokumen pendamping `PRD Ratis Role Pemilik UMKM.md`. Semua diagram ditulis dengan **Mermaid** sehingga bisa dirender di GitHub, VS Code (ekstensi Mermaid), atau mermaid.live. Alur mengikuti keputusan tim pada bagian 15.3 PRD.

Dokumen ini fokus pada apa yang dilakukan pemilik UMKM. Keputusan admin hanya ditampilkan sebagai batas alur, bukan sebagai aksi yang bisa dilakukan pemilik. Perbedaan tanggung jawab admin dan pemilik dijelaskan di bagian 2.

## Daftar diagram

| No | Diagram | Fitur PRD |
| --- | --- | --- |
| 1 | Peta navigasi panel pemilik | Semua |
| 2 | Perbedaan alur admin dan pemilik UMKM | Semua |
| 3 | Registrasi dan onboarding toko | O1 |
| 4 | Login dan logout | O2 |
| 5 | Status toko dan akses pemilik | O4, bagian 7.3 |
| 6 | Profil toko dan pengajuan ulang | O4 |
| 7 | Manajemen produk | O5 |
| 8 | Manajemen stok | O6 |
| 9 | Alur pesanan end-to-end | O7 |
| 10 | Transisi status pesanan | O7 |
| 11 | Pembatalan dan pengembalian stok | O7 |
| 12 | Keuangan otomatis dan manual | O8 |
| 13 | Manajemen staf dan hak akses | O9 |
| 14 | Notifikasi dalam aplikasi | O10 |
| 15 | Laporan dan ekspor | O11, O12 |
| 16 | Pratinjau storefront | O13 |
| 17 | Aturan lintas alur | Semua |

## 1. Peta navigasi panel pemilik

```mermaid
flowchart TD
    L["Login Pemilik"] --> D["Dashboard Usaha"]
    D --> S{"Status toko?"}
    S -->|pending| P["Mode Onboarding<br/>Profil read-only<br/>Siapkan produk"]
    S -->|ditolak| R["Mode Perbaikan<br/>Edit profil<br/>Ajukan ulang"]
    S -->|aktif| A["Mode Operasional"]
    S -->|nonaktif| N["Mode Terkunci<br/>Lihat data<br/>Selesaikan pesanan lama"]
    A --> PR["Produk dan Stok"]
    A --> PS["Pesanan"]
    A --> K["Keuangan"]
    A --> SF["Staf"]
    A --> LP["Laporan"]
    A --> NT["Notifikasi"]
    A --> PV["Pratinjau Toko"]
    P --> PR
    R --> PR
    N --> PR
    N --> PS
    N --> K
    N --> SF
    N --> LP
    N --> NT
    N --> PV
    PR --> PRD["Daftar Produk"]
    PRD --> PRF["Form Produk"]
    PRD --> PRS["Penyesuaian Stok"]
    PS --> PSD["Detail Pesanan"]
    PSD --> PSA["Proses / Selesai / Batalkan"]
    K --> KD["Ringkasan dan Transaksi"]
    SF --> SFD["Tambah / Nonaktifkan Staf"]
    LP --> LPD["Filter Periode / Ekspor"]
```

Catatan:

- Menu admin tidak pernah muncul di panel pemilik. Pemilik tidak dapat membuka verifikasi, kategori global, monitoring lintas toko, atau pengelolaan pengguna.
- Mode `pending` dan `ditolak` tetap memberi akses ke produk agar pemilik dapat menyiapkan katalog sebelum toko aktif.
- Mode `nonaktif` bersifat read-only untuk profil dan produk; tombol aksi tulis dinonaktifkan, tetapi pemilik masih dapat melihat data dan menyelesaikan pesanan lama.

## 2. Perbedaan alur admin dan pemilik UMKM

| Aspek | Admin | Pemilik UMKM |
| --- | --- | --- |
| Tujuan utama | Menjaga kualitas platform | Menjalankan usaha sendiri |
| Cakupan data | Lintas toko | Hanya tokonya sendiri |
| Status toko | Menyetujui, menolak, menonaktifkan, dan mengaktifkan | Hanya melihat status dan mengajukan ulang setelah ditolak |
| Verifikasi | Memeriksa data dan mengambil keputusan | Mendaftar, memperbaiki data, dan menunggu keputusan |
| Produk dan stok | Tidak boleh mengubah | Mengelola produk dan menyesuaikan stok |
| Pesanan | Hanya membaca semua pesanan | Memproses pesanan tokonya |
| Keuangan | Tidak mengakses keuangan toko | Melihat pemasukan otomatis dan mencatat pengeluaran |
| Kategori | Mengelola kategori global | Hanya memilih kategori aktif |
| Pengguna dan staf | Menonaktifkan akun bermasalah | Mengelola staf tokonya, maksimal 5 aktif |
| Kontak pelanggan | Hanya nama | Nama, nomor HP, dan alamat untuk pesanan tokonya |
| Dashboard | Statistik platform | Statistik usaha sendiri |
| Notifikasi | Log aktivitas dan monitoring platform | Pesanan baru, status toko, dan stok menipis |
| Endpoint | `/admin` dengan role `ADMIN` | `/owner` dengan role `OWNER` |
| Storefront | Melihat toko aktif di platform | Pratinjau tokonya sendiri dan melihat toko saat aktif |

```mermaid
flowchart LR
    AD["Admin"] -->|"setujui / tolak / nonaktifkan"| SH["Status Toko"]
    AD -->|"kelola"| CAT["Kategori Global"]
    AD -->|"baca"| ORD["Pesanan Lintas Toko"]
    OW["Pemilik UMKM"] -->|"daftar / perbaiki / ajukan ulang"| SH
    OW -->|"kelola"| OPS["Produk, Stok, Pesanan, Keuangan, Staf"]
    OPS --> SHOP["Toko Miliknya"]
```

Batas tanggung jawab:

- Admin tidak mengubah produk, stok, pesanan, atau keuangan toko.
- Pemilik tidak dapat menyetujui, menolak, atau mengaktifkan tokonya sendiri.
- Staf membantu operasional tokonya, tetapi tidak mendapat akses admin atau keuangan.

## 3. Registrasi dan onboarding toko (O1)

```mermaid
flowchart TD
    A(["Buka halaman registrasi"]) --> B["Isi data akun dan data toko"]
    B --> C{"Validasi form?"}
    C -->|Tidak| C1["Tampilkan error per kolom"] --> B
    C -->|Ya| D{"Email sudah terdaftar?"}
    D -->|Ya| D1["409: email sudah digunakan"] --> B
    D -->|Tidak| E["NIB dan foto usaha opsional"]
    E --> F{"Foto valid?"}
    F -->|Tidak| F1["Tampilkan error unggah<br/>lanjut tanpa foto"]
    F1 --> G
    F -->|Ya| G["Transaksi: buat user OWNER<br/>+ shop pending + riwayat status"]
    G --> H["Auto-login<br/>token JWT 8 jam"]
    H --> I(["Dashboard mode onboarding"])
    I --> J["Pemilik menyiapkan produk"]
    J --> K["Admin meninjau di panel admin"]
    K --> L{"Keputusan admin"}
    L -->|Setuju| M(["Toko aktif<br/>storefront tayang"])
    L -->|Tolak| N(["Toko ditolak<br/>alasan terlihat"])
    N --> O["Pemilik memperbaiki profil"]
    O --> P["Ajukan ulang"]
    P --> K
```

Catatan:

- Pemilik tidak dapat menyetujui atau menolak tokonya sendiri; keputusan ada di admin.
- NIB dan foto usaha opsional. UMKM tanpa NIB tetap dapat mendaftar dan diverifikasi.
- Produk dapat disiapkan saat toko masih `pending` atau `ditolak`.
- Pengajuan ulang tidak dibatasi jumlahnya, tetapi setiap pengajuan tercatat di riwayat status.

## 4. Login dan logout (O2)

```mermaid
flowchart TD
    A(["Buka halaman login"]) --> B["Isi email dan password"]
    B --> C{"Validasi form?"}
    C -->|Tidak| C1["Tampilkan error validasi"] --> B
    C -->|Ya| D["POST /auth/login"]
    D --> E{"Kredensial benar?"}
    E -->|Tidak| E1["Pesan umum:<br/>Email atau password salah"]
    E1 --> E2{"Rate limit terlampaui?"}
    E2 -->|Ya| E3["Tahan sementara:<br/>terlalu banyak percobaan"]
    E2 -->|Tidak| B
    E -->|Ya| F{"Akun aktif dan role OWNER?"}
    F -->|Tidak| F1["Pesan akun dinonaktifkan<br/>atau akses ditolak"]
    F -->|Ya| G["Simpan token JWT<br/>berlaku 8 jam"]
    G --> H["Dashboard sesuai status toko"]
    H --> T{"Token kedaluwarsa<br/>atau respons 401?"}
    T -->|Ya| T1["Arahkan ke login<br/>pesan sesi berakhir"] --> A
    H --> I["Klik Logout"]
    I --> J["Hapus token dari frontend"] --> A
```

Catatan:

- Pemilik dengan toko `pending`, `ditolak`, atau `nonaktif` tetap dapat login dan melihat dashboard dengan banner status.
- Staf memakai endpoint login yang sama, tetapi diarahkan ke panel staf. Alur panel staf dibahas di PRD terpisah.
- Pengguna dengan role lain yang membuka halaman pemilik ditolak.
- Rate limit login 10 percobaan per menit per alamat IP.

## 5. Status toko dan akses pemilik

```mermaid
stateDiagram-v2
    [*] --> pending: Registrasi pemilik
    pending --> aktif: Admin menyetujui
    pending --> ditolak: Admin menolak + alasan
    ditolak --> pending: Pemilik ajukan ulang
    aktif --> nonaktif: Admin menonaktifkan + alasan
    nonaktif --> aktif: Admin mengaktifkan kembali
```

| Status toko | Yang dapat dilakukan pemilik | Storefront | Pesanan baru | Aksi utama |
| --- | --- | --- | --- | --- |
| `pending` | Login, melihat dashboard, mengelola produk, melihat profil dan status | Tidak tayang | Tidak ada | Menunggu verifikasi admin |
| `ditolak` | Login, mengelola produk, memperbaiki profil, mengajukan ulang | Tidak tayang | Tidak ada | Perbaiki data dan ajukan ulang |
| `aktif` | Semua fitur operasional | Tayang | Diterima | Jalankan operasional harian |
| `nonaktif` | Login, melihat data, menyelesaikan pesanan yang sudah ada | Tidak tayang | Ditolak | Menunggu admin mengaktifkan kembali |

Catatan:

- Satu-satunya transisi yang dipicu pemilik adalah `ditolak` menjadi `pending` melalui pengajuan ulang.
- Pemilik tidak dapat mengaktifkan toko `nonaktif` sendiri.
- Produk dapat dikelola saat `pending`, `ditolak`, dan `aktif`; saat `nonaktif` hanya dapat dibaca.
- Saat toko `nonaktif`, staf tidak dapat memproses pesanan; penyelesaian pesanan lama dilakukan oleh pemilik.

## 6. Profil toko dan pengajuan ulang (O4)

```mermaid
flowchart TD
    A(["Buka profil toko"]) --> B["GET /owner/shop<br/>tampilkan profil, status, riwayat"]
    B --> C{"Status toko?"}
    C -->|pending| D["Profil read-only<br/>tidak ada tombol edit"]
    C -->|nonaktif| E["Profil read-only<br/>tidak bisa aktifkan sendiri"]
    C -->|aktif| F["Tombol Edit"]
    C -->|ditolak| G["Tombol Edit + Ajukan Ulang"]
    F --> H["Ubah data<br/>NIB dan foto opsional"]
    H --> I{"Validasi?"}
    I -->|Tidak| I1["400: error per kolom"] --> H
    I -->|Ya| J["PATCH /owner/shop"]
    J --> K{"Status masih aktif?"}
    K -->|Tidak| K1["409: muat ulang status"] --> B
    K -->|Ya| L(["Profil tersimpan<br/>status tetap aktif"])
    G --> M["Perbaiki data yang diminta"]
    M --> M1["PATCH /owner/shop"]
    M1 --> M2{"Validasi berhasil?"}
    M2 -->|Tidak| M3["400: error per kolom"] --> M
    M2 -->|Ya| N["POST /owner/shop/resubmit"]
    N --> O{"Status masih ditolak?"}
    O -->|Tidak| K1
    O -->|Ya| P["Transaksi: status pending<br/>+ riwayat pengajuan"]
    P --> Q(["Masuk daftar verifikasi admin"])
```

Catatan:

- `slug` toko bersifat tetap agar tautan tidak berubah saat nama toko diedit.
- Perubahan profil pada toko `aktif` tidak memerlukan verifikasi ulang.
- Pengajuan ulang tidak dibatasi, tetapi admin dapat menolak lagi dengan alasan baru.
- NIB dan foto usaha tetap opsional saat memperbaiki profil.

## 7. Manajemen produk (O5)

```mermaid
flowchart TD
    A(["Buka halaman produk"]) --> B["GET /owner/products<br/>cari, filter, pagination"]
    B --> C{"Status toko?"}
    C -->|nonaktif| D["Mode read-only<br/>tidak ada aksi ubah"]
    C -->|pending / ditolak / aktif| E{"Aksi"}
    E -->|Tambah| F["Isi nama, kategori aktif, harga,<br/>stok awal, minStock, deskripsi, foto"]
    F --> G{"Validasi?"}
    G -->|Tidak| G1["400: error per kolom"] --> F
    G -->|Ya| H["POST /owner/products"]
    H --> I(["Produk tersimpan<br/>tampil di panel pemilik"])
    E -->|Ubah| J["Ubah nama, kategori, harga,<br/>minStock, deskripsi, foto"]
    J --> K["PATCH /owner/products/:id"]
    K --> I
    E -->|Nonaktifkan| L["PATCH status isActive=false"]
    L --> M(["Hilang dari storefront<br/>pesanan lama tetap utuh"])
    E -->|Aktifkan| N["PATCH status isActive=true"]
    N --> I
    E -->|Hapus| O{"Pernah dipakai di pesanan?"}
    O -->|Ya| P["409: tidak boleh hapus<br/>sarankan nonaktifkan"]
    O -->|Tidak| Q["DELETE /owner/products/:id"]
    Q --> R(["Produk terhapus"])
    I --> S{"Toko aktif dan produk aktif?"}
    S -->|Ya| T(["Tampil di storefront"])
    S -->|Tidak| U(["Hanya tampil di panel pemilik"])
```

Catatan:

- Stok tidak diubah melalui form edit produk. Perubahan stok memakai alur O6 agar tercatat.
- Harga baru hanya berlaku untuk pesanan baru; item pesanan lama memakai harga saat pesanan dibuat.
- Produk dengan riwayat pesanan tidak boleh dihapus permanen.
- Produk dengan stok 0 boleh tetap aktif dan ditandai "Stok habis" di storefront.
- Admin tidak mengubah produk; seluruh aksi produk dilakukan pemilik.

## 8. Manajemen stok (O6)

```mermaid
flowchart TD
    A(["Buka detail produk / stok"]) --> B["GET /owner/products/:id/stock-movements"]
    B --> C{"Status toko?"}
    C -->|nonaktif| D["Mode read-only"]
    C -->|pending / ditolak / aktif| E["Klik Sesuaikan Stok"]
    E --> F["Pilih Tambah / Kurangi<br/>jumlah > 0, alasan 5-200 karakter"]
    F --> G{"Validasi?"}
    G -->|Tidak| G1["400: error per kolom"] --> F
    G -->|Ya| H["Hitung stok baru"]
    H --> I{"Stok baru < 0?"}
    I -->|Ya| I1["400: stok tidak cukup"] --> F
    I -->|Tidak| J["Transaksi: update stok<br/>+ stock_movement + aktor"]
    J --> K["Cek minStock"]
    K --> L{"Stok <= minStock?"}
    L -->|Ya| M["Buat notifikasi stok menipis<br/>jika belum ada"]
    L -->|Tidak| N["Tidak ada notifikasi baru"]
    M --> O(["Stok dan riwayat diperbarui"])
    N --> O
```

Catatan:

- Stok dikurangi saat pesanan dibuat oleh pelanggan, bukan saat pesanan diproses.
- Pembatalan pesanan mengembalikan stok tepat satu kali.
- Penyelesaian pesanan tidak mengubah stok lagi.
- Notifikasi stok menipis tidak dibuat berulang selama stok masih di bawah ambang.
- Pemilik dan staf dapat menyesuaikan stok saat toko tidak `nonaktif`.

## 9. Alur pesanan end-to-end (O7)

```mermaid
flowchart TD
    A(["Pelanggan checkout"]) --> B{"Stok cukup?"}
    B -->|Tidak| B1["Checkout gagal<br/>stok tidak berubah"]
    B -->|Ya| C["Transaksi: buat order pending<br/>kurangi stok + stock_movement"]
    C --> D["Notifikasi pesanan baru<br/>ke pemilik dan staf"]
    D --> E["Pemilik atau staf buka detail pesanan"]
    E --> F{"Status pesanan?"}
    F -->|pending| G{"Aksi"}
    F -->|diproses| H{"Aksi"}
    F -->|selesai / dibatalkan| I["Tidak ada aksi status<br/>hanya baca"]
    G -->|Proses| J["PATCH status diproses<br/>+ riwayat"]
    G -->|Batalkan| K["Lihat alur pembatalan"]
    H -->|Selesaikan| L["PATCH status selesai<br/>+ completedAt"]
    H -->|Batalkan| K
    L --> M["Transaksi: buat finance_entries INCOME<br/>source ORDER"]
    M --> N(["Pesanan selesai<br/>pemasukan tercatat"])
    J --> O(["Pesanan diproses"])
```

### Urutan interaksi pesanan

```mermaid
sequenceDiagram
    participant C as Pelanggan
    participant P as Pemilik atau Staf
    participant FE as Frontend Pemilik
    participant BE as Backend NestJS
    participant DB as Database

    C->>BE: Checkout pesanan
    BE->>DB: Transaksi: cek stok, buat order pending, kurangi stok, catat movement
    DB-->>BE: Sukses
    BE-->>C: Pesanan dibuat
    BE->>DB: Buat notifikasi untuk pemilik dan staf
    P->>FE: Buka pesanan baru
    FE->>BE: GET /owner/orders/:id
    BE->>DB: Ambil pesanan, item, dan riwayat status
    DB-->>BE: Data
    BE-->>FE: 200 detail pesanan
    FE-->>P: Tampilkan detail dan tombol Proses
    P->>FE: Klik Proses
    FE->>BE: PATCH /owner/orders/:id/status status diproses
    BE->>DB: Cek transisi dan simpan riwayat
    DB-->>BE: Sukses
    BE-->>FE: 200 status diproses
    P->>FE: Klik Selesaikan
    FE->>BE: PATCH /owner/orders/:id/status status selesai
    BE->>DB: Transaksi: status selesai, completedAt, finance income
    DB-->>BE: Sukses
    BE-->>FE: 200 status selesai
    FE-->>P: Toast sukses dan pemasukan tercatat
```

Catatan:

- Admin hanya dapat membaca pesanan lintas toko dan tidak memiliki tombol ubah status.
- Pemilik dan staf melihat kontak pelanggan lengkap hanya untuk pesanan tokonya.
- Pembatalan oleh pelanggan mengikuti PRD pelanggan; pemilik menerima notifikasi dan melihat alasan yang tersedia.
- Pesanan `selesai` dan `dibatalkan` bersifat final.

## 10. Transisi status pesanan

```mermaid
stateDiagram-v2
    [*] --> pending: Checkout pelanggan
    pending --> diproses: Pemilik atau staf memproses
    pending --> dibatalkan: Pemilik atau staf membatalkan + alasan
    pending --> dibatalkan: Pelanggan membatalkan
    diproses --> selesai: Pemilik atau staf menyelesaikan
    diproses --> dibatalkan: Pemilik atau staf membatalkan + alasan
    selesai --> [*]
    dibatalkan --> [*]
```

| Transisi | Pelaku | Efek stok | Efek keuangan |
| --- | --- | --- | --- |
| `pending` ke `diproses` | Pemilik atau staf | Tidak berubah | Tidak ada |
| `pending` ke `dibatalkan` | Pemilik, staf, atau pelanggan | Dikembalikan | Tidak ada |
| `diproses` ke `selesai` | Pemilik atau staf | Tidak berubah | Pemasukan otomatis dibuat |
| `diproses` ke `dibatalkan` | Pemilik atau staf | Dikembalikan | Tidak ada |

Catatan:

- Transisi di luar tabel ditolak dengan kode 409.
- Status `selesai` dan `dibatalkan` tidak dapat diubah lagi.
- Setelah pesanan selesai, pembatalan dan pengembalian dana tidak tersedia.
- Pembatalan oleh pemilik atau staf wajib memiliki alasan 10-300 karakter.

## 11. Pembatalan dan pengembalian stok (O7)

```mermaid
flowchart TD
    A(["Buka detail pesanan"]) --> B{"Status pending atau diproses?"}
    B -->|Tidak| B1["409: pesanan final<br/>tidak bisa dibatalkan"]
    B -->|Ya| C["Klik Batalkan"]
    C --> D["Isi alasan 10-300 karakter"]
    D --> E{"Alasan valid?"}
    E -->|Tidak| E1["400: error validasi"] --> D
    E -->|Ya| F["PATCH /owner/orders/:id/status<br/>status dibatalkan"]
    F --> G{"Status masih pending atau diproses?"}
    G -->|Tidak| G1["409: data sudah berubah<br/>muat ulang detail"]
    G -->|Ya| H["Transaksi: status dibatalkan<br/>+ cancellationReason + riwayat"]
    H --> I["Kembalikan stok tiap item<br/>+ stock_movement pembatalan"]
    I --> J["Tidak membuat finance income"]
    J --> K(["Pesanan dibatalkan<br/>stok kembali tepat sekali"])
```

Catatan:

- Pengembalian stok dilakukan dalam transaksi yang sama dengan perubahan status.
- Klik ganda atau pembatalan ulang tidak mengembalikan stok dua kali.
- Pembatalan oleh pelanggan juga mengembalikan stok, tetapi alasan mengikuti PRD pelanggan.
- Setelah pesanan `selesai`, tidak ada pembatalan atau refund.

## 12. Keuangan otomatis dan manual (O8)

```mermaid
flowchart TD
    A(["Pesanan berubah selesai"]) --> B["Transaksi: buat finance_entries<br/>INCOME, source ORDER, amount = total"]
    B --> C["Pemasukan otomatis tidak dapat diedit atau dihapus"]
    D(["Pemilik buka keuangan"]) --> E["GET /owner/finance/summary<br/>+ GET /owner/finance/entries"]
    C --> E
    E --> F{"Aksi"}
    F -->|Tambah pengeluaran| G["Isi tanggal, kategori, deskripsi, nominal"]
    G --> H{"Validasi?"}
    H -->|Tidak| H1["400: error per kolom"] --> G
    H -->|Ya| I["POST /owner/finance/expenses"]
    I --> J["Ringkasan diperbarui"]
    F -->|Edit pengeluaran| K["PATCH /owner/finance/expenses/:id"]
    K --> J
    F -->|Hapus pengeluaran| L["DELETE /owner/finance/expenses/:id"]
    L --> J
    F -->|Lihat pemasukan otomatis| M["Hanya baca<br/>tanpa tombol edit atau hapus"]
    J --> N(["Pemasukan, pengeluaran, laba bersih"])
```

Catatan:

- Pembukuan memakai basis kas: pemasukan diakui saat pesanan selesai, pengeluaran diakui pada tanggal yang diisi.
- Nominal memakai rupiah tanpa desimal dan tanggal memakai WIB.
- Tanggal pengeluaran tidak boleh di masa depan.
- Tidak ada pemasukan manual; pemasukan hanya berasal dari pesanan selesai.
- Staf tidak dapat membuka keuangan dan mendapat 403.

## 13. Manajemen staf dan hak akses (O9)

```mermaid
flowchart TD
    A(["Buka halaman staf"]) --> B{"Status toko aktif?"}
    B -->|Tidak| B1["Read-only<br/>hanya lihat daftar staf"]
    B -->|Ya| C["GET /owner/staff"]
    C --> D{"Aksi"}
    D -->|Tambah| E{"Jumlah staf aktif < 5?"}
    E -->|Tidak| E1["409: batas staf tercapai"]
    E -->|Ya| F["Isi nama, email, password"]
    F --> G{"Validasi dan email unik?"}
    G -->|Tidak| G1["400 atau 409: tampilkan error"] --> F
    G -->|Ya| H["POST /owner/staff<br/>role STAFF + shopId"]
    H --> I(["Staf dibuat"])
    D -->|Nonaktifkan| J["PATCH status isActive=false"]
    J --> K(["Staf tidak bisa login<br/>riwayat tetap tersimpan"])
    D -->|Aktifkan| L{"Slot aktif tersedia?"}
    L -->|Tidak| E1
    L -->|Ya| M["PATCH status isActive=true"]
    M --> I
    I --> N{"Staf login?"}
    N -->|Ya| O["Akses: pesanan, penyesuaian stok,<br/>lihat produk, notifikasi pesanan"]
    O --> P{"Coba keuangan, laporan,<br/>profil toko, atau kelola staf?"}
    P -->|Ya| Q["403: akses ditolak"]
    P -->|Tidak| R(["Operasional terbatas"])
```

Catatan:

- Pemilik hanya dapat mengelola staf tokonya sendiri.
- Admin dapat menonaktifkan akun lintas platform; pemilik tidak dapat mengakses fitur admin.
- Staf tidak dihapus permanen agar riwayat pesanan dan stok tetap utuh.
- Saat toko `nonaktif`, staf dapat login dan melihat data, tetapi tidak dapat memproses pesanan.
- Penyelesaian pesanan lama saat toko `nonaktif` dilakukan oleh pemilik.

## 14. Notifikasi dalam aplikasi (O10)

```mermaid
flowchart TD
    A["Kejadian"] --> B{"Jenis"}
    B -->|Pesanan baru| C["Notifikasi ke pemilik dan staf"]
    B -->|Pesanan dibatalkan pelanggan| D["Notifikasi ke pemilik"]
    B -->|Stok menipis| E{"Sudah ada notifikasi<br/>untuk produk ini?"}
    E -->|Ya| F["Tidak membuat duplikat"]
    E -->|Tidak| G["Buat notifikasi stok menipis"]
    B -->|Toko disetujui, ditolak,<br/>atau dinonaktifkan| H["Notifikasi ke pemilik"]
    C --> I["Simpan notifications<br/>isRead=false"]
    D --> I
    G --> I
    H --> I
    I --> J["Badge lonceng bertambah"]
    J --> K["Pemilik membuka notifikasi"]
    K --> L["PATCH /owner/notifications/:id/read"]
    L --> M["Badge berkurang"]
    K --> N["Klik tautan notifikasi"]
    N --> O["Buka pesanan, produk, atau profil toko"]
```

Catatan:

- Frontend memeriksa notifikasi baru setiap 30 detik dan saat tab kembali aktif.
- Tidak ada email atau WhatsApp pada versi ini.
- Notifikasi stok menipis tidak dibuat berulang selama stok masih di bawah ambang.
- Jika data terkait sudah tidak ada, tautan diarahkan ke halaman daftar yang sesuai.
- Staf hanya menerima notifikasi pesanan baru untuk tokonya.

## 15. Laporan dan ekspor (O11, O12)

```mermaid
flowchart TD
    A(["Buka laporan"]) --> B["Pilih periode 7 hari, 30 hari,<br/>atau rentang tanggal khusus"]
    B --> C{"Rentang valid?"}
    C -->|Tidak| C1["400: maksimal 90 hari"] --> B
    C -->|Ya| D["GET /owner/reports/sales"]
    D --> E["Tampilkan jumlah pesanan, pesanan selesai,<br/>omzet, rata-rata, grafik, produk terlaris"]
    E --> F{"Ekspor CSV?"}
    F -->|Tidak| G(["Selesai"])
    F -->|Ya| H["Pilih jenis: pesanan atau keuangan"]
    H --> I["GET /owner/reports/export"]
    I --> J{"Data lebih dari 5.000 baris?"}
    J -->|Ya| J1["Minta persempit rentang"] --> B
    J -->|Tidak| K(["Unduh CSV UTF-8"])
```

Catatan:

- Omzet hanya menghitung pesanan `selesai`; pesanan `dibatalkan` tidak dihitung.
- Laporan dan ekspor hanya dapat diakses pemilik; staf mendapat 403.
- Ekspor penjualan tidak menyertakan nomor HP dan alamat pelanggan.
- Periode tanpa data menghasilkan angka 0 dan file CSV dengan baris header saja.

## 16. Pratinjau storefront (O13)

```mermaid
flowchart TD
    A(["Klik Pratinjau Toko"]) --> B["GET /owner/storefront-preview"]
    B --> C{"Status toko?"}
    C -->|aktif| D["Tampilkan storefront tanpa banner"]
    C -->|pending / ditolak / nonaktif| E["Tampilkan banner<br/>Pratinjau - toko belum tayang"]
    D --> F["Tampilkan produk aktif<br/>harga dan stok"]
    E --> F
    F --> G["Checkout dinonaktifkan"]
    G --> H(["Selesai"])
```

Catatan:

- Pratinjau hanya untuk toko milik pemilik yang sedang login.
- Pratinjau tidak dapat dibagikan sebagai tautan publik.
- Storefront publik tetap hanya menampilkan toko `aktif`.
- Produk nonaktif tidak muncul di pratinjau.

## 17. Aturan lintas alur

- Semua endpoint pemilik memerlukan JWT dengan role `OWNER`; role lain mendapat 403.
- Semua endpoint staf memerlukan role `STAFF`; staf tidak dapat membuka endpoint pemilik atau admin.
- Admin memakai `/admin` dengan role `ADMIN` dan tidak dapat mengubah data operasional toko.
- `shopId` selalu diambil dari token, bukan dari input klien, agar data tidak bocor antar toko.
- Hanya admin yang dapat menyetujui, menolak, menonaktifkan, atau mengaktifkan toko.
- Pemilik hanya dapat memicu transisi `ditolak` menjadi `pending` melalui pengajuan ulang.
- Transisi status toko dan status pesanan yang tidak valid ditolak dengan 409.
- Stok dikurangi saat pesanan dibuat, dikembalikan tepat satu kali saat dibatalkan, dan tidak berubah saat pesanan selesai.
- Pesanan `selesai` membuat satu pemasukan otomatis; pesanan `dibatalkan` tidak membuat pemasukan.
- Setelah pesanan selesai, tidak ada pembatalan atau pengembalian dana.
- Produk hanya boleh dihapus permanen jika belum pernah dipakai di pesanan.
- Jumlah staf aktif maksimal 5. Staf tidak dapat melihat keuangan, laporan, profil toko, atau mengelola staf.
- Pembatalan oleh pemilik atau staf wajib memiliki alasan 10-300 karakter.
- NIB dan foto usaha opsional; UMKM tanpa NIB tetap dapat mendaftar dan diverifikasi.
- Token JWT berlaku 8 jam dan login dibatasi 10 percobaan per menit per alamat IP.
- Notifikasi hanya tersedia di dalam aplikasi.
- Registrasi, pengajuan ulang, perubahan status pesanan, penyesuaian stok, pembuatan pemasukan, dan penambahan staf memakai transaksi database.
- Pemilik dan staf hanya melihat kontak pelanggan untuk pesanan tokonya; admin hanya melihat nama pelanggan.
