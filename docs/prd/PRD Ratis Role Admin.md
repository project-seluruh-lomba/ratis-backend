# PRD Ratis: Role Admin

Tim Ratis | Techcomfest 2027, Web Application Competition | Sub-Tema 2 (SDG 8)

## 1. Ringkasan

Admin adalah pengelola platform Ratis. Tugas utamanya ada tiga: memastikan hanya UMKM yang sah yang tampil di platform, menjaga data pendukung bersama (kategori produk) tetap rapi, dan memantau kesehatan platform secara keseluruhan. Admin **tidak** mengoperasikan toko: produk, stok, pesanan, dan keuangan tetap menjadi milik masing-masing UMKM.

### 1.1 Latar belakang

Ratis adalah platform digitalisasi UMKM yang menyatukan toko online, pengelolaan operasional, dan pencatatan keuangan dalam satu aplikasi web. Karena banyak UMKM berbeda berbagi satu platform, diperlukan pihak yang menjaga kualitas dan keamanannya. Tanpa verifikasi, siapa pun bisa membuka toko palsu, dan pelanggan kehilangan kepercayaan. Karena itu role admin dibutuhkan sebagai lapisan kontrol.

### 1.2 Posisi admin di ekosistem Ratis

| Role | Hubungan dengan admin |
| --- | --- |
| Pemilik UMKM | Mendaftar, lalu menunggu verifikasi admin. Statusnya (pending, aktif, ditolak, nonaktif) ditentukan admin. |
| Staf/kasir | Akunnya mengikuti status toko. Jika toko nonaktif, staf tidak bisa memproses pesanan baru. |
| Pelanggan | Hanya melihat toko berstatus aktif. Akun pelanggan bermasalah bisa dinonaktifkan admin. |
| Admin | Memverifikasi, menonaktifkan, mengelola kategori, dan memantau. Tidak mengubah data operasional toko. |

## 2. Tujuan dan metrik keberhasilan

Setiap tujuan admin punya ukuran yang bisa dicek saat pengujian dan saat juri mencoba aplikasi.

| Tujuan | Metrik | Target | Cara mengukur |
| --- | --- | --- | --- |
| Menjaga kualitas toko | Langkah memverifikasi satu UMKM | Maksimal 3 klik dari dashboard (Tinjau, Setujui atau Tolak, Konfirmasi) | Uji manual alur verifikasi |
| Gambaran platform cepat | Kecocokan angka dashboard dengan database | Sama persis | Bandingkan dengan query langsung |
| Gambaran platform cepat | Waktu muat dashboard (backend aktif) | Kurang dari 3 detik | Tab Network di browser |
| Mengendalikan penyalahgunaan | Langkah menonaktifkan toko bermasalah | Maksimal 2 klik dari daftar UMKM | Uji manual |
| Mengendalikan penyalahgunaan | Toko nonaktif tidak tampil di publik | Hilang saat halaman dimuat ulang | Uji manual sisi pelanggan |
| Keamanan akses | Akses endpoint admin oleh role lain | Selalu ditolak dengan kode 403 | Uji dengan token role lain |
| Data tetap rapi | Kategori ganda atau kategori terpakai yang terhapus | 0 kejadian | Uji validasi nama unik dan aturan hapus |

## 3. Pengguna dan hak akses

### 3.1 Persona

**Nama:** Admin Platform (anggota tim Ratis). **Latar:** melek teknologi, terbiasa dengan dashboard. **Perangkat:** utama desktop atau laptop, kadang tablet. **Kebutuhan:** bekerja cepat saat memeriksa banyak pendaftar, tidak ingin salah menolak atau menyetujui toko, dan ingin tahu kondisi platform dalam sekali lihat. **Frustrasi yang dihindari:** data tidak sinkron, aksi tanpa konfirmasi, dan tidak ada jejak siapa melakukan apa.

Akun admin dibuat lewat seeding di database. **Tidak ada registrasi publik** untuk admin, sehingga tidak ada celah orang luar mendaftar sebagai admin.

### 3.2 Skenario penggunaan

1. **Pagi hari:** admin login, melihat dashboard, dan menemukan 3 UMKM pending. Admin membuka satu per satu, memeriksa kelengkapan data, lalu menyetujui atau menolak.
2. **Ada laporan toko bermasalah:** admin mencari toko lewat pencarian, membuka detailnya, lalu menonaktifkan dengan alasan.
3. **Kategori baru dibutuhkan:** pemilik meminta kategori tertentu. Admin menambahkannya di halaman kategori agar muncul di semua toko.
4. **Pemantauan rutin:** admin membuka daftar pesanan lintas toko untuk melihat apakah ada toko yang pesanannya menumpuk di status pending.
5. **Akun pengguna bermasalah:** admin mencari akun lewat email lalu menonaktifkannya.

### 3.3 Matriks hak akses

| Aksi | Admin | Pemilik UMKM | Staf/kasir | Pelanggan |
| --- | --- | --- | --- | --- |
| Login | Ya | Ya | Ya | Ya |
| Melihat dashboard global | Ya | Tidak | Tidak | Tidak |
| Menyetujui atau menolak UMKM | Ya | Tidak | Tidak | Tidak |
| Menonaktifkan atau mengaktifkan UMKM | Ya | Tidak | Tidak | Tidak |
| Mengelola kategori | Ya | Tidak (hanya memilih) | Tidak | Tidak |
| Melihat pesanan semua toko | Ya (hanya baca) | Hanya tokonya | Hanya tokonya | Hanya miliknya |
| Mengubah produk, stok, keuangan toko | Tidak | Ya (tokonya) | Sebagian | Tidak |
| Menonaktifkan akun pengguna | Ya | Tidak | Tidak | Tidak |

## 4. Ruang lingkup, asumsi, dan dependensi

### 4.1 Termasuk dalam lingkup

- Login dan logout admin dengan sesi berbasis JWT.
- Dashboard global: statistik UMKM, pesanan, omzet, tren, dan pintasan.
- Verifikasi UMKM baru: lihat detail, setujui, atau tolak dengan alasan.
- Pengelolaan UMKM yang sudah ada: cari, filter, nonaktifkan, aktifkan kembali.
- Pengelolaan kategori produk global: tambah, ubah, hapus, dan nonaktifkan.
- Monitoring pesanan lintas toko dengan filter dan detail (hanya baca).
- Pengelolaan pengguna: lihat daftar, cari, filter role, dan nonaktifkan akun.
- Pencatatan log aktivitas admin (prioritas Could).

### 4.2 Di luar lingkup

- Mengubah produk, stok, harga, atau keuangan milik UMKM.
- Memproses, mengubah, atau membatalkan pesanan.
- Moderasi ulasan dan komentar pelanggan.
- Pembayaran online, penarikan dana, dan komisi platform.
- Notifikasi email atau WhatsApp otomatis (pemberitahuan cukup tampil di aplikasi).
- Verifikasi dokumen legal seperti KTP atau SIUP, dan integrasi API perizinan; NIB hanya dicatat sebagai data opsional.
- Pembuatan akun admin lewat antarmuka (akun admin hanya dari seeding).

### 4.3 Asumsi

- Pendaftaran pemilik UMKM sudah tersedia (modul sisi pemilik) dan menghasilkan data toko berstatus `pending`.
- Satu pemilik memiliki satu toko pada versi lomba ini.
- Jumlah data pada demo kecil (puluhan toko, ratusan pesanan), sehingga pagination sederhana sudah cukup.
- Aplikasi dipakai terutama pada layar desktop, dan tetap bisa dipakai di tablet.
- Tidak semua UMKM memiliki NIB (misalnya pedagang kaki lima), sehingga NIB dan foto usaha bersifat opsional saat pendaftaran.
- Angka konfigurasi seperti ukuran halaman (10 baris), masa berlaku token, dan batas percobaan login adalah usulan awal yang boleh disesuaikan tim.

### 4.4 Dependensi

| Dependensi | Dibutuhkan untuk | Catatan |
| --- | --- | --- |
| Modul autentikasi dan RBAC | Seluruh fitur admin | Harus selesai paling awal |
| Modul pendaftaran UMKM | Verifikasi dan kelola UMKM | Menghasilkan data toko pending |
| Modul pesanan | Dashboard dan monitoring pesanan | Dikerjakan bersama peran pemilik dan pelanggan |
| Modul produk | Hitungan produk per kategori | Relasi produk ke kategori |
| Penyimpanan berkas (mis. Cloudinary) | Foto usaha opsional saat pendaftaran | Dapat ditunda jika waktu terbatas |
| Database dan seeding | Semua halaman | Data demo untuk keempat status UMKM |

## 5. Daftar fitur dan prioritas

Prioritas memakai skema MoSCoW: Must (wajib ada untuk lomba), Should (sangat diinginkan), Could (dikerjakan jika waktu tersisa).

| ID | Fitur | User story | Halaman | Prioritas |
| --- | --- | --- | --- | --- |
| A1 | Login dan logout | Sebagai admin, saya masuk dengan email dan password agar bisa mengakses panel admin | Login | Must |
| A2 | Dashboard global | Sebagai admin, saya melihat ringkasan UMKM, pesanan, dan omzet agar tahu kondisi platform | Dashboard | Must |
| A3 | Verifikasi UMKM | Sebagai admin, saya meninjau pendaftar baru lalu menyetujui atau menolak dengan alasan | Daftar dan detail UMKM | Must |
| A4 | Kelola UMKM | Sebagai admin, saya mencari, memfilter, dan menonaktifkan atau mengaktifkan UMKM | Daftar dan detail UMKM | Must |
| A5 | Kelola kategori | Sebagai admin, saya mengelola kategori produk yang dipakai semua toko | Kelola kategori | Must |
| A6 | Monitoring pesanan | Sebagai admin, saya melihat pesanan lintas toko untuk memantau aktivitas | Monitoring pesanan | Should |
| A7 | Kelola pengguna | Sebagai admin, saya melihat dan menonaktifkan akun yang bermasalah | Kelola pengguna | Should |
| A8 | Log aktivitas admin | Sebagai admin, saya melihat riwayat tindakan admin untuk akuntabilitas | Log aktivitas | Could |

## 6. Spesifikasi fungsional per fitur

### A1 Login dan logout

- **Deskripsi:** pintu masuk admin ke panel. Autentikasi memakai email dan password, hasilnya token JWT.
- **Input:** email (wajib, format email valid) dan password (wajib, minimal 8 karakter).
- **Alur sukses:** admin mengisi form, backend memeriksa email dan mencocokkan hash password (bcrypt), memastikan role `ADMIN` dan akun aktif, lalu mengirim token dan data pengguna. Frontend menyimpan token dan mengarahkan ke dashboard.
- **Alur gagal:** kredensial salah mengembalikan pesan umum "Email atau password salah" tanpa menyebut mana yang salah. Akun nonaktif mendapat pesan khusus. Terlalu banyak percobaan gagal ditahan sementara (rate limit).
- **Logout:** token dihapus dari penyimpanan frontend dan pengguna diarahkan ke halaman login.
- **Kasus tepi:** token kedaluwarsa saat admin sedang bekerja, maka permintaan berikutnya mendapat 401 dan admin diarahkan ke login dengan pesan sesi berakhir. Pengguna non-admin yang mencoba login di halaman admin ditolak.

### A2 Dashboard global

- **Deskripsi:** ringkasan kondisi platform dalam satu layar.
- **Data yang ditampilkan:** jumlah UMKM per status; total pesanan; total omzet (dari pesanan berstatus selesai); tren pesanan dan omzet per hari untuk 7 atau 30 hari terakhir; daftar UMKM pending terbaru (maksimal 5); lima toko dengan omzet tertinggi.
- **Aturan hitung:** omzet hanya menghitung pesanan berstatus `selesai`. Pesanan `dibatalkan` tidak dihitung. Rentang tanggal memakai zona waktu WIB.
- **Interaksi:** mengganti rentang waktu memuat ulang grafik dan daftar toko teratas. Tombol "Tinjau" pada UMKM pending membuka halaman detail verifikasi.
- **Kasus tepi:** belum ada data (platform baru) menampilkan angka 0 dan pesan kosong yang ramah, bukan error. Backend lambat menampilkan kerangka loading.

### A3 Verifikasi UMKM

- **Deskripsi:** keputusan admin atas UMKM yang baru mendaftar.
- **Alur setuju:** admin membuka detail UMKM berstatus `pending`, memeriksa data, menekan Setujui dan mengonfirmasi. Status menjadi `aktif`, waktu dan nama admin pemverifikasi tersimpan, toko langsung tampil di storefront.
- **Alur tolak:** admin menekan Tolak, mengisi alasan (wajib, 10 sampai 300 karakter), lalu mengonfirmasi. Status menjadi `ditolak`, alasan tersimpan dan terlihat oleh pemilik.
- **Data yang diperiksa:** profil toko, data pemilik, NIB (opsional, 13 digit jika diisi), dan foto usaha (opsional). UMKM tanpa NIB, seperti pedagang kaki lima, tetap dapat diverifikasi berdasarkan data lain.
- **Validasi:** hanya UMKM berstatus `pending` yang bisa disetujui atau ditolak. Percobaan di status lain mendapat 409.
- **Kasus tepi:** dua admin memproses UMKM yang sama bersamaan, maka yang kedua mendapat 409 dan halaman memuat status terbaru. Pemilik yang ditolak boleh memperbaiki data dan mengajukan ulang tanpa batas jumlah (status kembali `pending`, riwayat penolakan tetap tercatat).

### A4 Kelola UMKM

- **Deskripsi:** pengelolaan UMKM yang sudah terdaftar.
- **Pencarian dan filter:** pencarian berdasarkan nama toko atau nama pemilik (tidak peka huruf besar kecil), filter status, pagination 10 baris per halaman, urut terbaru.
- **Nonaktifkan:** admin menekan Nonaktifkan, mengisi alasan (wajib), dan mengonfirmasi. Efeknya: toko tidak tampil di publik, pesanan baru ditolak, pemilik dan staf melihat banner bahwa toko dinonaktifkan. Data produk, pesanan, dan keuangan **tidak dihapus**.
- **Aktifkan kembali:** mengembalikan status ke `aktif` dan toko tampil lagi.
- **Kasus tepi:** menonaktifkan toko yang punya pesanan berstatus `pending` atau `diproses`. Pesanan tersebut tetap bisa diselesaikan oleh pemilik, hanya pesanan baru yang diblokir.

### A5 Kelola kategori

- **Deskripsi:** daftar kategori global yang dipakai pemilik UMKM saat membuat produk.
- **Tambah:** input nama (wajib, 2 sampai 40 karakter, unik tanpa peka huruf besar kecil). Sistem membuat `slug` otomatis dari nama.
- **Ubah:** mengganti nama atau status aktif. Perubahan nama langsung terlihat di semua produk yang memakai kategori itu.
- **Hapus:** hanya boleh jika tidak ada produk yang memakai kategori tersebut. Jika masih dipakai, sistem menolak dengan 409 dan menyarankan menonaktifkan kategori.
- **Nonaktifkan:** kategori nonaktif tidak muncul sebagai pilihan untuk produk baru, tetapi produk lama tetap menampilkannya.
- **Kasus tepi:** nama berbeda hanya spasi atau huruf besar (misalnya "Makanan" dan "makanan ") dianggap duplikat.

### A6 Monitoring pesanan

- **Deskripsi:** tampilan hanya baca atas semua pesanan di platform.
- **Kolom:** kode pesanan, nama toko, nama pelanggan, total, status, tanggal.
- **Filter:** status (pending, diproses, selesai, dibatalkan), toko, rentang tanggal, dan pencarian kode pesanan. Filter bisa digabung.
- **Detail:** panel samping berisi daftar item (nama produk, jumlah, harga), total, dan riwayat perubahan status.
- **Aturan:** admin tidak punya tombol mengubah status. Data pelanggan yang tampil dibatasi pada nama, bukan alamat atau kontak lengkap (prinsip data minimum).
- **Kasus tepi:** filter tanpa hasil menampilkan pesan kosong dengan tombol Reset filter.

### A7 Kelola pengguna

- **Deskripsi:** daftar seluruh akun (admin, pemilik, staf, pelanggan).
- **Kolom:** nama, email, role, status akun, tanggal daftar.
- **Nonaktifkan:** akun nonaktif tidak bisa login dan mendapat pesan yang jelas. Data pesanan dan toko terkait tetap tersimpan.
- **Pengaman:** admin tidak bisa menonaktifkan akunnya sendiri, dan tidak bisa menonaktifkan admin terakhir yang aktif.
- **Kasus tepi:** menonaktifkan pemilik UMKM tidak otomatis menonaktifkan tokonya. Admin harus menonaktifkan toko secara terpisah (pilihan sadar, bukan efek samping).

### A8 Log aktivitas admin (Could)

- **Deskripsi:** catatan jejak setiap aksi penting admin.
- **Aksi yang dicatat:** login admin, setujui atau tolak UMKM, aktifkan atau nonaktifkan UMKM, ubah kategori, dan nonaktifkan pengguna.
- **Isi catatan:** siapa (admin), apa (aksi), objek (jenis dan ID), alasan jika ada, dan waktu.
- **Tampilan:** tabel hanya baca, urut terbaru, dengan filter jenis aksi dan pagination.
- **Catatan:** pencatatan sebaiknya dibuat sejak awal di service (satu fungsi pencatat), walaupun halaman log-nya dikerjakan belakangan.

## 7. Aturan bisnis dan status UMKM

### 7.1 Aturan bisnis

1. Status UMKM ada empat: `pending`, `aktif`, `ditolak`, `nonaktif`. UMKM baru otomatis `pending`. NIB dan foto usaha opsional; UMKM tanpa NIB tetap dapat mendaftar dan diverifikasi.
2. Penolakan dan penonaktifan **wajib** disertai alasan (10 sampai 300 karakter) yang bisa dilihat pemilik.
3. Toko berstatus selain `aktif` tidak tampil di storefront publik dan tidak menerima pesanan baru.
4. Penonaktifan tidak menghapus data. Produk, pesanan, dan keuangan toko tetap tersimpan.
5. Kategori yang masih dipakai produk tidak boleh dihapus, hanya boleh dinonaktifkan.
6. Nama kategori harus unik tanpa memperhatikan huruf besar kecil dan spasi di tepi.
7. Admin hanya membaca data pesanan dan tidak bisa mengubahnya.
8. Admin tidak bisa mengubah produk, stok, atau keuangan toko.
9. Admin tidak bisa menonaktifkan akunnya sendiri atau admin aktif terakhir.
10. Semua endpoint admin dilindungi `JwtAuthGuard` dan `RolesGuard` dengan role `ADMIN`.
11. Setiap perubahan status UMKM mencatat siapa admin yang melakukannya dan kapan.
12. Perubahan status memakai transaksi database agar status dan riwayat selalu konsisten.

### 7.2 Transisi status UMKM

| Dari | Ke | Pemicu | Syarat |
| --- | --- | --- | --- |
| (baru) | pending | Pemilik mendaftar | Data wajib terisi |
| pending | aktif | Admin menyetujui | Tidak ada |
| pending | ditolak | Admin menolak | Alasan wajib |
| ditolak | pending | Pemilik memperbaiki data dan mengajukan ulang | Dilakukan pemilik |
| aktif | nonaktif | Admin menonaktifkan | Alasan wajib |
| nonaktif | aktif | Admin mengaktifkan kembali | Tidak ada |

Transisi selain yang tercantum ditolak dengan kode 409.

## 8. Alur utama

### 8.1 Verifikasi UMKM baru

1. Pemilik mendaftar dan toko berstatus `pending`.
2. Admin melihat UMKM pending di dashboard atau di daftar UMKM.
3. Admin membuka halaman detail dan memeriksa profil toko, data pemilik, serta NIB dan foto usaha bila diisi.
4. Jika sesuai, admin menekan Setujui lalu mengonfirmasi. Status menjadi `aktif` dan toko tampil di storefront.
5. Jika tidak sesuai, admin menekan Tolak, mengisi alasan, lalu mengonfirmasi. Status menjadi `ditolak`.
6. Sistem mencatat admin pemverifikasi, waktu, dan alasan (jika ada).

### 8.2 Pengajuan ulang setelah ditolak

1. Pemilik melihat status `ditolak` beserta alasan di halamannya.
2. Pemilik memperbaiki data lalu mengajukan ulang.
3. Status kembali `pending` dan muncul lagi di daftar pending admin, dengan riwayat penolakan sebelumnya tetap terlihat.

### 8.3 Menonaktifkan toko bermasalah

1. Admin mencari toko di daftar UMKM.
2. Admin membuka detail lalu menekan Nonaktifkan dan mengisi alasan.
3. Toko hilang dari storefront, pesanan baru ditolak, dan pemilik serta staf melihat banner status.
4. Jika masalah selesai, admin menekan Aktifkan untuk mengembalikan toko.

### 8.4 Mengelola kategori

1. Admin membuka halaman kategori lalu menambah atau mengubah kategori.
2. Untuk menghapus, sistem memeriksa jumlah produk pemakai kategori tersebut.
3. Jika masih dipakai, penghapusan ditolak dan admin diarahkan menonaktifkan kategori.

## 9. Spesifikasi halaman UI

Panel admin terdiri dari 6 halaman (ditambah halaman log aktivitas jika fitur A8 dikerjakan). Setiap halaman dijelaskan dengan tujuan, komponen dan fitur, perilaku, serta state tampilan.

**Ketentuan umum semua halaman:**

- **Layout:** sidebar kiri berisi menu (Dashboard, UMKM, Kategori, Pesanan, Pengguna, Log), header atas berisi nama admin dan tombol logout, dan area konten di kanan.
- **State tampilan:** setiap halaman punya state loading (kerangka atau spinner), kosong (pesan dan ajakan aksi), dan error (pesan jelas dengan tombol Coba lagi).
- **Umpan balik:** setiap aksi ubah data menampilkan toast sukses atau gagal. Aksi berisiko (tolak, nonaktifkan, hapus) selalu melewati dialog konfirmasi.
- **Responsif:** sidebar berubah menjadi menu geser pada layar kecil, dan tabel bisa digeser horizontal.
- **Proteksi rute:** halaman admin hanya bisa dibuka dengan token admin yang valid. Tanpa token, pengguna dialihkan ke login.

### 9.1 Login admin

**Tujuan:** pintu masuk aman ke panel admin.

**Komponen dan fitur:**

1. Form email dan password dengan validasi langsung (format email, kolom wajib, minimal 8 karakter).
2. Tombol tampilkan atau sembunyikan password.
3. Tombol Masuk berstatus loading dan nonaktif saat permintaan berjalan, agar tidak terkirim dua kali.
4. Pesan error di atas form: "Email atau password salah", "Akun dinonaktifkan", atau "Terlalu banyak percobaan, coba lagi nanti".
5. Redirect otomatis ke dashboard setelah login berhasil, dan ke login jika sesi berakhir.
6. Admin yang sudah login dan membuka halaman login langsung dialihkan ke dashboard.
7. Identitas visual Ratis (logo dan nama) agar halaman terlihat konsisten dengan aplikasi.

**Perilaku:** tekan Enter untuk mengirim form. Fokus awal pada kolom email. Pesan error hilang saat pengguna mulai mengetik ulang.

### 9.2 Dashboard

**Tujuan:** memberi gambaran kondisi platform dalam sekali lihat dan mengarahkan admin ke tindakan yang mendesak.

**Komponen dan fitur:**

1. Empat kartu jumlah UMKM per status (pending, aktif, ditolak, nonaktif), dan setiap kartu bisa diklik menuju daftar UMKM yang sudah terfilter.
2. Kartu total pesanan dan total omzet seluruh platform (omzet hanya dari pesanan selesai).
3. Grafik tren pesanan atau omzet per hari dengan pilihan rentang 7 atau 30 hari.
4. Daftar UMKM pending terbaru (maksimal 5) dengan tombol pintas Tinjau.
5. Daftar lima toko dengan omzet tertinggi pada rentang waktu terpilih.
6. Sapaan dan nama admin, serta waktu pembaruan data terakhir.
7. Tombol Muat ulang untuk menyegarkan data tanpa memuat ulang halaman.

**Perilaku:** mengganti rentang waktu hanya memuat ulang grafik dan daftar toko teratas. Jika tidak ada UMKM pending, area itu menampilkan pesan "Tidak ada UMKM yang menunggu verifikasi".

**State khusus:** saat backend gratis sedang bangun (cold start), tampilkan kerangka loading dan teks "Menyiapkan data, mohon tunggu" agar tidak terlihat rusak.

### 9.3 Daftar UMKM dan detail verifikasi

**Tujuan:** tempat admin memverifikasi UMKM baru dan mengelola UMKM yang sudah ada. Terdiri dari dua tampilan: daftar dan detail.

**Tampilan daftar:**

1. Tabel UMKM dengan kolom nama toko, nama pemilik, kontak, tanggal daftar, dan status.
2. Pencarian berdasarkan nama toko atau pemilik (dengan jeda singkat sebelum mencari agar tidak membebani server).
3. Filter status (semua, pending, aktif, ditolak, nonaktif) dengan badge berwarna berbeda untuk tiap status.
4. Pengurutan berdasarkan tanggal daftar (default terbaru di atas).
5. Pagination 10 baris per halaman dengan penunjuk total data.
6. Menu aksi cepat pada tiap baris: Lihat detail, dan Aktifkan atau Nonaktifkan sesuai status.
7. Jumlah hasil sesuai filter dan tombol Reset filter.

**Tampilan detail:**

1. Profil toko: nama, deskripsi, alamat, kontak, tanggal daftar, serta NIB dan foto usaha bila diisi (opsional).
2. Data pemilik: nama dan email.
3. Ringkasan toko: jumlah produk dan jumlah pesanan (informasi hanya baca).
4. Tombol Setujui dan Tolak untuk status `pending`. Tombol Tolak membuka dialog dengan kolom alasan wajib dan penghitung karakter.
5. Tombol Nonaktifkan (untuk `aktif`) dan Aktifkan (untuk `nonaktif`), keduanya dengan dialog konfirmasi. Nonaktifkan mewajibkan alasan.
6. Riwayat status: daftar perubahan berisi status lama dan baru, alasan, admin pelaku, dan waktu.
7. Tombol Kembali yang mempertahankan filter dan halaman daftar sebelumnya.

**Perilaku:** tombol aksi hanya muncul sesuai status yang valid (misalnya Setujui tidak tampil untuk toko `aktif`). Setelah aksi sukses, halaman menampilkan status baru tanpa muat ulang. Jika terjadi konflik status (409), muncul pesan bahwa data sudah berubah lalu halaman dimuat ulang.

### 9.4 Kelola kategori

**Tujuan:** menjaga daftar kategori produk global tetap rapi dan konsisten.

**Komponen dan fitur:**

1. Tabel kategori dengan kolom nama, slug, jumlah produk yang memakai, status (aktif atau nonaktif), dan aksi.
2. Tombol Tambah kategori yang membuka form atau modal berisi satu kolom nama.
3. Validasi nama langsung: wajib, 2 sampai 40 karakter, dan tidak boleh duplikat. Pesan error muncul di bawah kolom.
4. Ubah nama kategori lewat modal yang sama (terisi nama lama).
5. Saklar aktif atau nonaktif pada tiap baris dengan konfirmasi singkat.
6. Hapus kategori dengan dialog konfirmasi. Tombol hapus dinonaktifkan dan diberi keterangan jika kategori masih dipakai produk.
7. Pencarian kategori berdasarkan nama.

**Perilaku:** setelah menambah, kategori baru langsung muncul di tabel dan tersedia untuk pemilik UMKM. Pesan konflik dari server (409) ditampilkan apa adanya di bawah kolom nama.

### 9.5 Monitoring pesanan

**Tujuan:** memantau aktivitas pesanan seluruh toko tanpa bisa mengubahnya.

**Komponen dan fitur:**

1. Tabel pesanan dengan kolom kode, toko, pelanggan, total (format Rupiah), status, dan tanggal.
2. Filter status (pending, diproses, selesai, dibatalkan) dengan badge berwarna.
3. Filter toko lewat pilihan dropdown yang bisa dicari.
4. Filter rentang tanggal (dari dan sampai) dengan pilihan cepat Hari ini, 7 hari, dan 30 hari.
5. Pencarian berdasarkan kode pesanan.
6. Ringkasan di atas tabel: jumlah pesanan dan total nilai sesuai filter yang aktif.
7. Panel detail pesanan (hanya baca): daftar item, jumlah, harga satuan, subtotal, total, dan riwayat perubahan status.
8. Pagination 10 baris per halaman dan tombol Reset filter.

**Perilaku:** filter bisa digabung, dan kombinasi filter tercermin di alamat halaman agar bisa dibagikan atau dimuat ulang tanpa kehilangan filter. Tidak ada tombol yang mengubah status pesanan di halaman ini.

### 9.6 Kelola pengguna

**Tujuan:** menangani akun bermasalah di seluruh role.

**Komponen dan fitur:**

1. Tabel pengguna dengan kolom nama, email, role, status akun, dan tanggal daftar.
2. Pencarian berdasarkan nama atau email.
3. Filter role (admin, pemilik UMKM, staf, pelanggan) dan filter status akun (aktif atau nonaktif).
4. Badge role dan status dengan warna berbeda agar mudah dipindai.
5. Tombol Nonaktifkan atau Aktifkan pada tiap baris dengan dialog konfirmasi.
6. Pengaman: tombol dinonaktifkan pada akun admin yang sedang login, dengan keterangan alasannya.
7. Untuk akun pemilik atau staf, tampil nama toko terkait agar admin tahu dampaknya.
8. Pagination 10 baris per halaman dan penunjuk total pengguna.

**Perilaku:** akun yang dinonaktifkan langsung tidak bisa login, dan token lama ditolak pada permintaan berikutnya karena status akun diperiksa saat otorisasi. Menonaktifkan pemilik tidak mengubah status tokonya; dialog konfirmasi menjelaskan hal ini dan menyediakan tautan pintas ke detail toko untuk menonaktifkannya bila diperlukan.

### 9.7 Log aktivitas (fitur Could)

**Tujuan:** akuntabilitas atas tindakan admin.

1. Tabel log dengan kolom waktu, admin, aksi, objek, dan alasan.
2. Filter jenis aksi (login, verifikasi, status UMKM, kategori, pengguna).
3. Filter rentang tanggal.
4. Pencarian berdasarkan nama admin atau ID objek.
5. Urutan terbaru di atas dan pagination.
6. Tautan dari kolom objek ke halaman detail UMKM atau pengguna terkait.

## 10. Kriteria penerimaan dan skenario uji

Fitur dianggap selesai jika seluruh skenario Must di bawah lulus pada **versi yang sudah di-hosting**, bukan hanya di komputer lokal.

| ID | Fitur | Skenario | Hasil yang diharapkan |
| --- | --- | --- | --- |
| T1 | A1 | Login admin dengan data benar | Masuk ke dashboard, token tersimpan |
| T2 | A1 | Login dengan password salah | Pesan "Email atau password salah", tidak masuk |
| T3 | A1 | Login dengan akun nonaktif | Pesan akun dinonaktifkan, tidak masuk |
| T4 | A1 | Token dihapus lalu membuka halaman admin | Dialihkan ke login |
| T5 | A1 | Token pemilik, staf, atau pelanggan dipakai ke endpoint admin | Respons 403 |
| T6 | A2 | Membuka dashboard dengan data seeding | Semua angka sama dengan hasil query database |
| T7 | A2 | Mengganti rentang dari 7 ke 30 hari | Grafik dan toko teratas ikut berubah |
| T8 | A3 | Menyetujui UMKM pending | Status menjadi aktif, toko tampil di storefront |
| T9 | A3 | Menolak UMKM tanpa alasan | Ditolak validasi (400), status tidak berubah |
| T10 | A3 | Menolak UMKM dengan alasan valid | Status ditolak, alasan terlihat di sisi pemilik |
| T11 | A3 | Menyetujui UMKM yang sudah aktif | Respons 409 |
| T12 | A4 | Mencari toko dengan kata kunci dan filter status | Hanya hasil yang cocok tampil |
| T13 | A4 | Menonaktifkan toko aktif | Toko hilang dari publik, pesanan baru ditolak, data tetap ada |
| T14 | A4 | Mengaktifkan kembali toko nonaktif | Toko tampil lagi di publik |
| T15 | A5 | Menambah kategori baru | Muncul di tabel dan di pilihan produk pemilik |
| T16 | A5 | Menambah kategori dengan nama yang sudah ada | Respons 409 dan pesan di bawah kolom |
| T17 | A5 | Menghapus kategori yang dipakai produk | Ditolak (409), disarankan menonaktifkan |
| T18 | A5 | Menghapus kategori yang tidak dipakai | Terhapus dari tabel |
| T19 | A6 | Menggabungkan filter status, toko, dan tanggal | Hanya pesanan yang memenuhi semua filter tampil |
| T20 | A6 | Mencari tombol ubah status di halaman pesanan | Tidak ada (hanya baca) |
| T21 | A7 | Menonaktifkan akun pelanggan | Akun tidak bisa login |
| T22 | A7 | Menonaktifkan akun admin sendiri | Ditolak dengan pesan alasan |
| T23 | Semua | Mengakses panel admin lewat layar tablet | Tata letak tetap terbaca dan bisa dipakai |
| T24 | A3 | Menyetujui UMKM tanpa NIB (pedagang kaki lima) | Disetujui tanpa error validasi NIB, status menjadi aktif |

## 11. Spesifikasi API

### 11.1 Konvensi

- Semua endpoint admin berada di bawah `/admin` dan memerlukan header `Authorization: Bearer <token>` dengan role `ADMIN`. Pengecualian: `POST /auth/login`.
- Format respons sukses: `{ "data": ..., "meta": ... }`. Daftar memakai `meta` berisi `page`, `limit`, `total`.
- Format respons error: `{ "statusCode": 400, "message": "...", "errors": [...] }`.
- Kode error: 400 data tidak valid, 401 belum login atau token tidak valid, 403 role tidak diizinkan atau akun nonaktif, 404 data tidak ditemukan, 409 konflik (status tidak valid, nama duplikat, kategori dipakai).
- Parameter daftar umum: `page` (default 1), `limit` (default 10, maksimal 50), `q` (pencarian).

### 11.2 Daftar endpoint

| Metode | Path | Fungsi | Request utama | Respons sukses | Error |
| --- | --- | --- | --- | --- | --- |
| POST | `/auth/login` | Login admin | body: email, password | 200: accessToken, user | 400, 401, 403 |
| GET | `/auth/me` | Data admin yang login | header token | 200: user | 401 |
| GET | `/admin/dashboard` | Statistik global | query: range (7 atau 30) | 200: jumlah UMKM per status, total pesanan, omzet, tren, toko teratas, UMKM pending | 401, 403 |
| GET | `/admin/shops` | Daftar UMKM | query: status, q, page, limit | 200: daftar dan meta | 401, 403 |
| GET | `/admin/shops/:id` | Detail UMKM | path: id | 200: profil, pemilik, ringkasan, riwayat status | 404 |
| PATCH | `/admin/shops/:id/approve` | Setujui UMKM | tidak ada | 200: toko berstatus aktif | 404, 409 |
| PATCH | `/admin/shops/:id/reject` | Tolak UMKM | body: reason (10 sampai 300 karakter) | 200: toko berstatus ditolak | 400, 404, 409 |
| PATCH | `/admin/shops/:id/status` | Aktifkan atau nonaktifkan | body: status (aktif atau nonaktif), reason (wajib jika nonaktif) | 200: toko dengan status baru | 400, 404, 409 |
| GET | `/admin/categories` | Daftar kategori | query: q | 200: daftar beserta jumlah produk | 401, 403 |
| POST | `/admin/categories` | Tambah kategori | body: name | 201: kategori baru | 400, 409 |
| PATCH | `/admin/categories/:id` | Ubah nama atau status | body: name atau isActive | 200: kategori | 400, 404, 409 |
| DELETE | `/admin/categories/:id` | Hapus kategori | tidak ada | 204 | 404, 409 |
| GET | `/admin/orders` | Daftar pesanan lintas toko | query: status, shopId, from, to, q, page, limit | 200: daftar, meta, ringkasan filter | 401, 403 |
| GET | `/admin/orders/:id` | Detail pesanan | path: id | 200: item dan riwayat status | 404 |
| GET | `/admin/users` | Daftar pengguna | query: role, isActive, q, page, limit | 200: daftar dan meta | 401, 403 |
| PATCH | `/admin/users/:id/status` | Aktifkan atau nonaktifkan akun | body: isActive | 200: pengguna | 403, 404, 409 |
| GET | `/admin/logs` | Log aktivitas (Could) | query: action, from, to, q, page, limit | 200: daftar dan meta | 401, 403 |

## 12. Model data yang dipakai admin

Berikut tabel dan kolom yang disentuh fitur admin (usulan awal untuk skema Prisma; dirapikan lebih lanjut saat membuat ERD).

| Tabel | Kolom utama | Dipakai untuk |
| --- | --- | --- |
| `users` | id, name, email, passwordHash, role (ADMIN, OWNER, STAFF, CUSTOMER), isActive, createdAt | Login, kelola pengguna |
| `shops` | id, ownerId, name, slug, description, phone, address, nib (opsional), photoUrl (opsional), status (pending, aktif, ditolak, nonaktif), statusReason, verifiedById, verifiedAt, createdAt | Verifikasi dan kelola UMKM |
| `shop_status_histories` | id, shopId, fromStatus, toStatus, reason, changedById, createdAt | Riwayat status di halaman detail |
| `categories` | id, name, slug, isActive, createdAt | Kelola kategori |
| `products` | id, shopId, categoryId, name, price, stock | Hitungan produk per kategori |
| `orders` | id, code, shopId, customerId, total, status (pending, diproses, selesai, dibatalkan), createdAt | Dashboard dan monitoring |
| `order_items` | id, orderId, productName, quantity, unitPrice | Detail pesanan |
| `admin_logs` | id, adminId, action, targetType, targetId, reason, createdAt | Log aktivitas (Could) |

**Indeks yang disarankan:** `shops(status)`, `shops(createdAt)`, `shops(nib)` unik jika diisi, `orders(createdAt)`, `orders(shopId, status)`, `users(email)` unik, dan `categories(slug)` unik. Indeks ini menjaga daftar dan dashboard tetap cepat di database gratis.

## 13. Kebutuhan non-fungsional

| Aspek | Kebutuhan |
| --- | --- |
| Keamanan | Password disimpan dengan hash bcrypt. Token JWT berlaku 8 jam agar sesi demo tidak terputus. Header keamanan lewat `helmet`. Rate limit pada login 10 percobaan per menit per alamat IP. CORS hanya untuk domain frontend. Semua input divalidasi DTO dengan opsi whitelist. Secret hanya di environment variable, tidak masuk repository. |
| Berkas | Foto usaha opsional disimpan di penyimpanan objek (misalnya Cloudinary), maksimal 2 MB, format JPG atau PNG. |
| Otorisasi | Pemeriksaan role dan status akun di backend pada setiap permintaan, tidak hanya menyembunyikan menu di frontend. |
| Performa | Dashboard dimuat kurang dari 3 detik saat backend aktif. Semua daftar memakai pagination, dan agregasi dashboard memakai query terindeks. |
| Ketersediaan | Backend gratis bisa tertidur. Sediakan endpoint `GET /health` untuk ping berkala dan state loading yang jelas di frontend. |
| Konsistensi data | Perubahan status UMKM dan pencatatan riwayat dalam satu transaksi database. |
| Kegunaan | Konfirmasi untuk aksi berisiko, pesan error berbahasa Indonesia yang jelas, dan jumlah klik sesuai target pada bagian 2. |
| Tampilan | Konsisten (warna, tipografi, spasi), responsif untuk desktop dan tablet, kontras teks yang cukup, dan label pada setiap kolom form. |
| Kompatibilitas | Chrome, Edge, dan Firefox versi terbaru. |
| Pemeliharaan | Struktur modul NestJS terpisah (auth, shops, categories, orders, users, analytics, logs), dan dokumentasi API dengan Swagger. |

## 14. Data seeding untuk demo

Juri harus bisa mencoba semua alur admin tanpa menyiapkan data sendiri. Seeding mencakup:

| Data | Jumlah | Keterangan |
| --- | --- | --- |
| Akun admin | 1 | Email dan password demo dicantumkan di README |
| UMKM berstatus pending | 2 | Untuk mencoba setujui dan tolak |
| UMKM berstatus aktif | 3 | Dengan produk dan pesanan |
| UMKM berstatus ditolak | 1 | Dengan alasan penolakan terisi |
| UMKM berstatus nonaktif | 1 | Untuk mencoba aktifkan kembali |
| Kategori | 6 | Termasuk 1 kategori tanpa produk (untuk uji hapus) dan 1 kategori yang dipakai (untuk uji penolakan hapus) |
| Pesanan | Sekitar 30 | Tersebar di 4 status dan 14 hari terakhir, agar grafik dan filter bermakna |
| Pengguna | Sekitar 10 | Campuran pemilik, staf, dan pelanggan |

Sertakan minimal satu UMKM pending tanpa NIB (pedagang kaki lima) dan satu dengan NIB agar kedua kondisi dapat diuji. Seeding dibuat idempoten (aman dijalankan ulang) dan dijalankan otomatis saat deploy awal.

## 15. Rencana pengerjaan, risiko, dan keputusan tim

### 15.1 Urutan pengerjaan yang disarankan

| Tahap | Pekerjaan | Bergantung pada |
| --- | --- | --- |
| 1 | Autentikasi, JWT, `RolesGuard`, dan seeding akun admin (A1) | Skema database |
| 2 | Verifikasi dan kelola UMKM beserta riwayat status (A3, A4) | Tahap 1, pendaftaran UMKM |
| 3 | Kelola kategori (A5) | Tahap 1 |
| 4 | Kelola pengguna (A7) | Tahap 1 |
| 5 | Monitoring pesanan (A6) | Modul pesanan |
| 6 | Dashboard (A2) | Data UMKM dan pesanan |
| 7 | Log aktivitas (A8, jika waktu ada) | Pencatat log dari tahap 2 sampai 4 |
| 8 | Uji skenario T1 sampai T24 pada versi hosting | Semua tahap |

Dashboard sengaja dikerjakan setelah modul pesanan tersedia karena angkanya bergantung pada data pesanan.

### 15.2 Risiko dan mitigasi

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Backend gratis tertidur saat juri membuka web | Halaman pertama lambat atau terlihat rusak | Ping berkala ke `/health`, state loading yang jelas, catatan di README |
| Dashboard lambat karena agregasi data | Nilai kinerja turun | Indeks pada kolom yang difilter, batasi rentang, dan pertimbangkan cache singkat |
| Konflik saat dua admin memproses UMKM yang sama | Status tidak konsisten | Cek status sebelum mengubah dan kembalikan 409 |
| Hak akses hanya dijaga di frontend | Celah keamanan | Guard di backend pada seluruh endpoint admin dan uji dengan token role lain |
| Cakupan fitur terlalu besar untuk waktu yang tersisa | Fitur Must tidak selesai | Kerjakan sesuai prioritas, tunda A8 dan filter tambahan terlebih dahulu |
| Data demo tidak mencakup semua status | Juri tidak bisa mencoba semua alur | Seeding sesuai bagian 14 |
| Layanan penyimpanan foto bermasalah | Foto usaha tidak tampil saat verifikasi | Foto bersifat opsional, tampilkan placeholder, dan batasi ukuran serta format berkas |

### 15.3 Keputusan tim

Pertanyaan terbuka sebelumnya sudah diputuskan agar spesifikasi dapat dilanjutkan.

1. **Data pendaftaran UMKM.** Data wajib: nama toko, nama pemilik, email, nomor HP, alamat, dan deskripsi. NIB dan foto usaha bersifat opsional karena tidak semua UMKM (misalnya pedagang kaki lima) memiliki NIB. Halaman detail verifikasi menampilkan NIB dan foto usaha bila diisi, dan admin tetap dapat menyetujui UMKM tanpa NIB berdasarkan data lain. Dokumen legal seperti KTP atau SIUP tidak diminta.
2. **Pengajuan ulang setelah ditolak.** Tidak dibatasi jumlahnya agar UMKM dapat memperbaiki data; setiap pengajuan ulang tercatat di riwayat status. Penyalahgunaan dicegah lewat pemantauan admin, bukan pembatasan otomatis.
3. **Log aktivitas (A8).** Pencatatan log diimplementasikan sejak awal melalui satu fungsi pencatat di service. Halaman log tetap berprioritas Could dan dikerjakan jika waktu tersisa; jika tidak, pencatatan tetap berjalan untuk pengembangan lanjutan.
4. **Token dan rate limit.** Token JWT berlaku 8 jam agar sesi demo tidak terputus. Rate limit login 10 percobaan per menit per alamat IP. Nilai ini dapat disesuaikan saat pengujian.
5. **Menonaktifkan pemilik vs toko.** Tetap terpisah: menonaktifkan akun pemilik tidak mengubah status toko. Dialog konfirmasi menjelaskan dampaknya dan menyediakan tautan pintas ke detail toko untuk menonaktifkannya bila perlu.
