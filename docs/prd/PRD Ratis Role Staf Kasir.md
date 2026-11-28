# PRD Ratis: Role Staf/Kasir

Tim Ratis | Techcomfest 2027, Web Application Competition | Sub-Tema 2 (SDG 8)

## 1. Ringkasan

Staf/kasir adalah pengguna yang membantu pemilik UMKM menjalankan operasional harian toko. Aksesnya terbatas pada tiga pekerjaan utama: memproses pesanan, menyesuaikan stok, dan melihat katalog produk. Staf **tidak** dapat mengelola toko, produk, keuangan, laporan, atau staf lain. Tujuannya agar operasional toko tetap berjalan saat pemilik sibuk, tanpa memberikan kendali penuh atas usaha.

PRD ini menetapkan kebutuhan role staf/kasir dari pembuatan akun oleh pemilik sampai staf memproses pesanan dan menyesuaikan stok. Verifikasi toko dan pengawasan platform tetap menjadi wewenang admin, sedangkan pembuatan dan pengelolaan akun staf menjadi wewenang pemilik. PRD ini fokus pada kebutuhan produk; flowchart dan desain UI role staf dibuat sebagai dokumen terpisah.

### 1.1 Latar belakang

Banyak UMKM tidak dikerjakan satu orang. Saat pemilik melayani pembeli, mengurus bahan, atau beristirahat, pesanan tetap masuk dan stok terus berubah. Jika semua pekerjaan harus menunggu pemilik, pesanan terlewat dan pelanggan kecewa. Menyerahkan akun pemilik kepada karyawan juga berisiko karena akun itu membuka seluruh data usaha, termasuk keuangan.

Ratis membutuhkan role staf/kasir dengan akses minimum yang cukup untuk bekerja: memproses pesanan, menyesuaikan stok, dan melihat produk. Dengan pemisahan ini, pemilik dapat mendelegasikan pekerjaan operasional tanpa membocorkan data keuangan atau pengaturan toko. Prinsipnya adalah **akses seperlunya**: staf mendapat alat untuk menyelesaikan tugas, bukan kendali atas usaha.

### 1.2 Posisi staf/kasir di ekosistem Ratis

| Role | Hubungan dengan staf/kasir |
| --- | --- |
| Admin | Menjaga platform. Staf tidak berhubungan langsung dengan admin; status toko yang ditetapkan admin ikut menentukan apakah staf dapat memproses pesanan. |
| Pemilik UMKM | Membuat, mengubah, menonaktifkan, dan mengaktifkan akun staf. Pemilik juga dapat mereset password staf. Staf hanya membantu operasional toko pemilik tersebut. |
| Staf/kasir | Memproses pesanan, menyesuaikan stok, melihat produk dan kategori, serta menerima notifikasi pesanan baru. Tidak dapat melihat keuangan, laporan, profil toko, atau mengelola staf. |
| Pelanggan | Membuat pesanan yang kemudian diproses staf. Staf dapat melihat kontak pelanggan hanya untuk pesanan di tokonya. |

Satu staf terhubung ke tepat satu toko pada versi lomba ini. Akun staf tidak dapat dibuat melalui registrasi publik maupun halaman admin; akun tersebut lahir dari pengelolaan staf oleh pemilik.

## 2. Tujuan dan metrik keberhasilan

Setiap tujuan staf punya ukuran yang dapat dicek saat pengujian dan saat juri mencoba aplikasi.

| Tujuan | Metrik | Target | Cara mengukur |
| --- | --- | --- | --- |
| Operasional harian cepat | Langkah memproses satu pesanan dari daftar | Maksimal 2 klik sampai status berubah | Uji manual alur pesanan |
| Menyelesaikan pesanan | Langkah menyelesaikan pesanan yang sudah diproses | Maksimal 2 klik sampai status selesai | Uji manual alur pesanan |
| Stok akurat | Kecocokan stok database dengan hasil alur uji | 100% | Bandingkan stok sebelum dan sesudah penyesuaian atau pembatalan |
| Dashboard cepat | Waktu muat dashboard saat backend aktif | Kurang dari 3 detik | Tab Network di browser |
| Data terisolasi | Akses data toko lain lewat token staf | 0 kejadian | Uji endpoint dengan dua akun staf dari toko berbeda |
| Akses terkendali | Akses staf ke fitur terlarang (keuangan, laporan, kelola produk, kelola staf) | Selalu ditolak dengan kode 403 | Uji dengan token staf |
| Notifikasi cepat | Waktu notifikasi pesanan baru muncul sejak pesanan dibuat | Kurang dari 30 detik saat aplikasi terbuka | Uji manual dengan dua browser |
| Nyaman di ponsel | Aksi utama dapat dilakukan pada layar 390 px | Semua aksi Must dapat dipakai | Uji manual di browser mobile |
| Onboarding singkat | Waktu dari login sampai pesanan pertama diproses | Kurang dari 1 menit | Uji manual dengan akun staf baru |

## 3. Pengguna dan hak akses

### 3.1 Persona

**Nama:** Mas Bagus. **Latar:** kasir di toko kopi rumahan, terbiasa memakai ponsel dan tablet, belum pernah memakai sistem pembukuan. **Perangkat:** ponsel sebagai perangkat utama saat melayani pembeli, tablet atau laptop saat toko ramai. **Kebutuhan:** melihat pesanan baru dengan cepat, mengubah status pesanan tanpa bertanya ke pemilik, dan mencatat stok dengan alasan yang jelas. **Frustrasi yang dihindari:** aplikasi lambat, menu yang membingungkan, harus menghubungi pemilik untuk tugas dasar, dan takut salah mengubah data toko.

Akun staf dibuat oleh pemilik melalui halaman staf di panel pemilik. Staf masuk melalui halaman login yang sama dengan pemilik, lalu diarahkan ke panel staf sesuai role akunnya. Tidak ada registrasi publik untuk staf.

### 3.2 Skenario penggunaan

1. **Pagi hari:** Mas Bagus login, melihat dashboard operasional, dan menemukan tiga pesanan `pending` yang perlu diproses.
2. **Memproses pesanan:** Mas Bagus membuka detail pesanan, menghubungi pelanggan, lalu menandai pesanan `diproses`.
3. **Menyelesaikan pesanan:** Setelah barang diserahkan dan pembayaran diterima di luar sistem, Mas Bagus menandai pesanan `selesai`.
4. **Membatalkan pesanan:** Pelanggan berubah pikiran. Mas Bagus membatalkan pesanan dan mengisi alasan, lalu stok kembali otomatis.
5. **Menambah stok:** Setelah belanja bahan, Mas Bagus menyesuaikan stok produk dan mengisi alasan agar riwayatnya jelas.
6. **Toko dinonaktifkan admin:** Mas Bagus tetap dapat login dan melihat data, tetapi tidak dapat memproses pesanan atau menyesuaikan stok sampai toko aktif kembali.
7. **Akun dinonaktifkan pemilik:** Mas Bagus tidak dapat login. Riwayat pesanan dan stok yang pernah ia proses tetap tersimpan.

### 3.3 Matriks hak akses

| Aksi | Staf/kasir | Pemilik UMKM | Admin | Pelanggan |
| --- | --- | --- | --- | --- |
| Registrasi akun | Tidak (dibuat pemilik) | Ya (registrasi toko) | Tidak | Ya (akun pelanggan) |
| Login dan logout | Ya | Ya | Ya | Ya |
| Melihat dashboard usaha | Ya (operasional, tanpa keuangan) | Ya (lengkap) | Tidak | Tidak |
| Melihat profil toko | Ya (hanya baca) | Ya (lihat dan ubah) | Hanya baca saat verifikasi | Tidak |
| Mengubah profil toko | Tidak | Ya | Tidak | Tidak |
| Mengajukan ulang setelah ditolak | Tidak | Ya | Tidak | Tidak |
| Melihat produk dan kategori | Ya | Ya | Tidak | Produk toko aktif |
| Menambah, mengubah, dan menghapus produk | Tidak | Ya | Tidak | Tidak |
| Menyesuaikan stok | Ya | Ya | Tidak | Tidak |
| Memproses pesanan | Ya | Ya | Hanya baca | Hanya pesanannya |
| Melihat keuangan dan laporan | Tidak | Ya | Tidak | Tidak |
| Mengekspor data | Tidak | Ya | Tidak | Tidak |
| Mengelola staf | Tidak | Ya | Tidak | Tidak |
| Melihat kontak pelanggan | Ya, untuk pesanan tokonya | Ya, untuk pesanan tokonya | Hanya nama | Data miliknya |
| Menerima notifikasi pesanan baru | Ya | Ya | Tidak | Tidak |
| Mengubah kata sandi sendiri | Ya (Could) | Ya | Ya | Ya |

## 4. Ruang lingkup, asumsi, dan dependensi

### 4.1 Termasuk dalam lingkup

- Login dan logout staf dengan sesi berbasis JWT, memakai halaman login yang sama dengan pemilik.
- Dashboard operasional toko: status toko, pesanan perlu diproses, pesanan hari ini, produk stok menipis, dan pesanan terbaru, tanpa angka keuangan.
- Melihat profil toko dan status verifikasi (hanya baca).
- Melihat daftar produk, detail produk, kategori, dan riwayat stok (hanya baca).
- Penyesuaian stok dengan alasan dan riwayat pergerakan stok.
- Manajemen pesanan: daftar, detail, proses, selesaikan, dan batalkan dengan alasan.
- Notifikasi dalam aplikasi untuk pesanan baru.
- Melihat profil akun sendiri dan mengganti kata sandi sendiri (Could).
- Riwayat status pesanan dan riwayat pergerakan stok yang mencatat staf sebagai pelaku.

### 4.2 Di luar lingkup

- Registrasi publik staf dan pemulihan kata sandi lewat email.
- Membuat, mengubah, menonaktifkan, atau mengaktifkan akun staf (wewenang pemilik).
- Mengubah profil toko, mengajukan ulang verifikasi, dan mengaktifkan toko.
- Menambah, mengubah, menghapus, atau menonaktifkan produk.
- Mengelola kategori produk (wewenang admin).
- Melihat keuangan, laporan penjualan, ekspor CSV, dan data omzet.
- Melihat dashboard global admin atau melakukan verifikasi UMKM.
- Pembuatan pesanan manual, mode kasir offline, dan POS mandiri.
- Checkout, keranjang, dan halaman pelanggan.
- Pembayaran online, payment gateway, penarikan dana, dan pengembalian dana.
- Pengiriman otomatis dan integrasi kurir.
- Varian produk seperti ukuran dan warna.
- Satu staf untuk banyak toko, banyak gudang, atau banyak cabang.
- Notifikasi email atau WhatsApp otomatis.
- Ulasan, promo, voucher, dan program loyalitas.
- Aplikasi mobile native.

### 4.3 Asumsi

- Modul autentikasi, RBAC, dan pengelolaan staf oleh pemilik sudah tersedia atau dikerjakan paralel.
- Modul produk, stok, pesanan, dan notifikasi sudah tersedia dari sisi pemilik dan pelanggan.
- Pesanan masuk ke toko dengan status `pending` dari checkout pelanggan.
- Satu staf terhubung ke satu toko, dan `shopId` selalu diambil dari token.
- Jumlah staf aktif maksimal 5 per toko (mengikuti PRD pemilik).
- Staf hanya dibuat saat toko `aktif`; staf tidak ada pada toko yang belum pernah aktif.
- Saat toko `nonaktif`, staf dapat login dan melihat data, tetapi tidak dapat memproses pesanan atau menyesuaikan stok.
- Pembayaran dilakukan di luar sistem; sistem hanya mencatat status pesanan.
- Stok dikelola di satu lokasi per toko.
- Jumlah data demo kecil, sehingga pagination sederhana sudah cukup.
- Staf memakai browser modern di ponsel, tablet, atau desktop.
- Token JWT berlaku 8 jam dan login dibatasi 10 percobaan per menit per alamat IP.
- Angka konfigurasi seperti ukuran halaman dan ambang stok menipis adalah usulan awal yang boleh disesuaikan tim.

### 4.4 Dependensi

| Dependensi | Dibutuhkan untuk | Catatan |
| --- | --- | --- |
| Modul autentikasi dan RBAC | Login staf dan pembatasan akses | Harus selesai paling awal |
| Modul manajemen staf pemilik | Pembuatan dan penonaktifan akun staf | Menentukan kapan staf dapat login |
| Modul verifikasi admin | Status toko yang menentukan mode baca-saja | Toko `nonaktif` menghentikan aksi tulis staf |
| Modul produk dan kategori | Daftar produk yang dilihat staf | Hanya baca |
| Modul stok | Penyesuaian stok dan riwayat pergerakan | Mencatat pelaku staf |
| Modul pesanan dan checkout pelanggan | Pesanan yang diproses staf | Pesanan baru berstatus `pending` |
| Modul notifikasi internal | Pemberitahuan pesanan baru | Tidak memakai email atau WhatsApp |
| Database dan seeding | Semua halaman dan data demo | Data harus mencakup semua status pesanan dan status toko |

## 5. Daftar fitur dan prioritas

Prioritas memakai skema MoSCoW: Must (wajib ada untuk lomba), Should (sangat diinginkan), Could (dikerjakan jika waktu tersisa).

| ID | Fitur | User story | Halaman | Prioritas |
| --- | --- | --- | --- | --- |
| S1 | Login dan logout | Sebagai staf, saya masuk dengan akun yang dibuat pemilik agar bisa mulai bekerja | Login | Must |
| S2 | Dashboard operasional | Sebagai staf, saya melihat pesanan yang perlu diproses dan stok menipis agar tahu prioritas hari ini | Dashboard | Must |
| S3 | Manajemen pesanan | Sebagai staf, saya memproses, menyelesaikan, dan membatalkan pesanan agar pelanggan mendapat barang | Pesanan | Must |
| S4 | Penyesuaian stok | Sebagai staf, saya menyesuaikan stok dengan alasan agar stok akurat | Produk dan stok | Must |
| S5 | Lihat produk dan kategori | Sebagai staf, saya melihat katalog dan kategori agar bisa menjawab pertanyaan pelanggan | Produk | Must |
| S6 | Notifikasi pesanan baru | Sebagai staf, saya mendapat notifikasi pesanan baru agar tidak melewatkannya | Notifikasi | Should |
| S7 | Profil akun dan ganti kata sandi | Sebagai staf, saya melihat profil dan mengganti kata sandi sendiri agar akun aman | Profil saya | Could |

## 6. Spesifikasi fungsional per fitur

### S1 Login dan logout

- **Deskripsi:** pintu masuk staf ke panel operasional. Staf memakai halaman login yang sama dengan pemilik; sistem mengarahkan ke panel sesuai role.
- **Input:** email (wajib, format valid) dan password (wajib, minimal 8 karakter).
- **Alur sukses:** backend mencocokkan hash password, memastikan role `STAFF`, akun aktif, dan staf terhubung ke toko, lalu mengirim token, data pengguna, dan ringkasan toko (nama serta status). Frontend menyimpan token dan mengarahkan ke dashboard staf.
- **Alur gagal:** kredensial salah selalu menghasilkan pesan umum "Email atau password salah" tanpa menyebut mana yang salah. Akun staf nonaktif mendapat pesan khusus. Percobaan berlebihan ditahan sementara dengan rate limit.
- **Logout:** token dihapus dari penyimpanan frontend dan pengguna diarahkan ke halaman login.
- **Kasus tepi:** token kedaluwarsa menghasilkan 401 dan staf diarahkan ke login dengan pesan sesi berakhir. Staf yang mencoba membuka halaman pemilik atau admin ditolak. Jika akun dinonaktifkan pemilik saat staf sedang login, permintaan berikutnya ditolak karena status akun diperiksa pada setiap permintaan. Staf dengan toko `nonaktif` tetap boleh login dan melihat data, tetapi panel menampilkan banner dan menonaktifkan aksi tulis.

### S2 Dashboard operasional

- **Deskripsi:** ringkasan pekerjaan operasional toko dalam satu layar, tanpa data keuangan.
- **Data yang ditampilkan:** status toko; jumlah pesanan `pending` dan `diproses`; jumlah pesanan masuk hari ini; jumlah pesanan selesai hari ini; jumlah produk dengan stok menipis; lima pesanan terbaru yang perlu ditangani; dan jumlah notifikasi belum dibaca.
- **Aturan hitung:** "Perlu diproses" mencakup pesanan `pending` dan `diproses`. "Stok menipis" berarti stok kurang dari atau sama dengan `minStock` produk. Semua tanggal memakai zona waktu WIB. Omzet, pemasukan, pengeluaran, dan laba **tidak** ditampilkan pada dashboard staf.
- **Interaksi:** kartu "Perlu diproses" membuka daftar pesanan dengan filter aktif. Kartu "Stok menipis" membuka daftar produk dengan filter stok menipis. Setiap pesanan terbaru memiliki pintasan ke detail.
- **Banner status toko:** saat toko `nonaktif`, banner menjelaskan bahwa toko dinonaktifkan admin dan staf hanya dapat melihat data. Saat toko `pending` atau `ditolak` (data lama yang tidak normal), banner menjelaskan bahwa operasional belum tersedia.
- **Kasus tepi:** belum ada data menampilkan angka 0 dan pesan kosong yang ramah, bukan error. Saat backend gratis sedang bangun, tampilkan kerangka loading dan teks "Menyiapkan data, mohon tunggu". Tombol Muat ulang menyegarkan data tanpa memuat ulang halaman.

### S3 Manajemen pesanan

- **Deskripsi:** antrean pesanan toko dan tempat staf mengubah status pesanan sesuai alur yang diizinkan.
- **Daftar pesanan:** kolom kode pesanan, waktu, nama pelanggan, jumlah item, total, status, dan aksi. Tersedia filter status, rentang tanggal, pencarian kode atau nama pelanggan, dan pagination 10 baris. Pesanan terbaru tampil di atas. Penanda "baru" muncul pada pesanan `pending` yang belum dibuka staf.
- **Detail pesanan:** nama, nomor HP, alamat, dan catatan pelanggan; daftar item berisi nama produk, jumlah, harga satuan, dan subtotal; total; riwayat perubahan status; serta tombol aksi sesuai status.
- **Transisi status:** `pending` menjadi `diproses`; `diproses` menjadi `selesai`; `pending` atau `diproses` menjadi `dibatalkan`. Staf tidak boleh melompati status, mengubah item, atau mengubah total.
- **Pembatalan:** wajib mengisi alasan 10 sampai 300 karakter. Stok dikembalikan tepat satu kali dan tidak ada pemasukan yang dicatat.
- **Penyelesaian:** saat status menjadi `selesai`, sistem mencatat waktu selesai dan membuat satu entri pemasukan otomatis sebesar total pesanan. Staf tidak dapat melihat entri keuangan tersebut.
- **Status toko:** saat toko `nonaktif`, tombol Proses, Selesaikan, dan Batalkan dinonaktifkan dengan keterangan bahwa penyelesaian pesanan lama dilakukan pemilik.
- **Kasus tepi:** aksi pada pesanan yang sudah `selesai` atau `dibatalkan` mendapat 409. Klik ganda ditahan oleh status loading dan pengecekan status di backend. Jika terjadi konflik status, detail dimuat ulang dengan pesan bahwa data sudah berubah. Staf hanya melihat kontak pelanggan lengkap untuk pesanan tokonya.

### S4 Penyesuaian stok

- **Deskripsi:** pencatatan perubahan stok oleh staf agar angka di sistem dapat dipertanggungjawabkan.
- **Penyesuaian manual:** staf memilih produk, memilih Tambah atau Kurangi, mengisi jumlah (bilangan bulat lebih dari 0), alasan (wajib, 5 sampai 200 karakter), dan catatan opsional. Sistem menolak jika hasil akhir stok negatif.
- **Riwayat stok:** staf dapat melihat riwayat pergerakan per produk berisi waktu, jenis (`stok_awal`, `penjualan`, `pembatalan`, `penyesuaian`), jumlah perubahan, stok sebelum, stok sesudah, alasan, pelaku, dan kode pesanan bila terkait. Riwayat dapat difilter berdasarkan jenis dan tanggal serta memakai pagination.
- **Efek pesanan:** stok dikurangi saat pesanan dibuat oleh pelanggan, bukan saat diproses. Jika pesanan dibatalkan, stok dikembalikan tepat satu kali. Jika pesanan selesai, stok tidak berubah lagi. Staf tidak dapat mengubah efek ini secara manual.
- **Ambang stok menipis:** setiap produk memiliki `minStock` dengan default 5. Produk di bawah ambang ditandai "Stok menipis" dan muncul di dashboard staf.
- **Status toko:** saat toko `nonaktif`, penyesuaian stok tidak diizinkan.
- **Kasus tepi:** penyesuaian dan pembuatan pesanan yang bersamaan memakai transaksi dan pengecekan stok agar tidak menghasilkan stok negatif. Pembatalan pesanan yang sudah dibatalkan tidak mengembalikan stok dua kali. Staf tidak dapat menyesuaikan stok produk toko lain.

### S5 Lihat produk dan kategori

- **Deskripsi:** katalog toko yang dapat dilihat staf tanpa hak mengubah.
- **Daftar produk:** kolom foto, nama, kategori, harga, stok, dan status. Tersedia pencarian nama, filter kategori, filter status aktif atau nonaktif, filter stok menipis, pengurutan terbaru, dan pagination 10 baris. Badge "Stok menipis" dan "Stok habis" ditampilkan agar mudah dipindai.
- **Detail produk:** nama, kategori, harga, stok, `minStock`, deskripsi, foto, dan riwayat stok. Tidak ada tombol tambah, ubah, hapus, atau aktifkan produk.
- **Kategori:** staf dapat melihat daftar kategori yang dipakai toko, termasuk kategori nonaktif yang masih terpasang pada produk lama.
- **Aturan:** harga produk boleh dilihat karena dibutuhkan saat melayani pesanan, tetapi staf tidak dapat melihat omzet, pemasukan, pengeluaran, atau laporan.
- **Kasus tepi:** produk nonaktif tetap terlihat di panel staf dengan badge agar staf tahu produk tersebut tidak tayang. Produk dengan stok 0 tetap tampil dan ditandai "Stok habis". Staf tidak dapat membuka produk toko lain.

### S6 Notifikasi pesanan baru

- **Deskripsi:** pemberitahuan internal agar staf tidak melewatkan pesanan masuk.
- **Pemicu:** pesanan baru berstatus `pending` untuk toko tempat staf terdaftar.
- **Tampilan:** ikon lonceng di header dengan jumlah belum dibaca, dropdown berisi lima notifikasi terbaru, halaman notifikasi berisi daftar lengkap, filter belum dibaca, dan tombol "Tandai semua dibaca". Setiap item menampilkan judul, pesan singkat, waktu, status baca, dan tautan ke detail pesanan.
- **Perilaku:** frontend memeriksa notifikasi baru secara berkala (misalnya setiap 30 detik) dan saat tab kembali aktif. Menandai satu notifikasi sebagai dibaca mengurangi badge.
- **Penerima:** semua staf aktif pada toko tersebut menerima notifikasi pesanan baru. Staf tidak menerima notifikasi keuangan, verifikasi toko, atau perubahan staf.
- **Kasus tepi:** jika pesanan terkait sudah tidak ada, tautan diarahkan ke daftar pesanan. Notifikasi lama tidak menghalangi operasional dan dapat ditandai dibaca sekaligus. Tidak ada email atau WhatsApp pada versi ini.

### S7 Profil akun dan ganti kata sandi (Could)

- **Deskripsi:** halaman tempat staf melihat identitas akun dan menjaga keamanan akunnya sendiri.
- **Data yang ditampilkan:** nama, email, role, nama toko, status akun, status toko, dan tanggal akun dibuat.
- **Ganti kata sandi:** staf mengisi password lama, password baru (minimal 8 karakter), dan konfirmasi password baru. Password lama harus cocok. Setelah berhasil, sesi lain tetap berlaku sampai token kedaluwarsa, dan staf mendapat pesan sukses.
- **Batasan:** staf tidak dapat mengubah nama, email, role, atau toko. Perubahan data akun dan reset password tetap menjadi wewenang pemilik.
- **Kasus tepi:** password lama salah mendapat 400 dengan pesan yang jelas. Password baru sama dengan password lama ditolak agar staf memilih password yang benar-benar baru.

## 7. Aturan bisnis dan status

### 7.1 Aturan bisnis

1. Akun staf hanya dibuat oleh pemilik. Tidak ada registrasi publik staf dan tidak ada pembuatan akun staf melalui halaman admin.
2. Satu staf terhubung ke tepat satu toko. `shopId` selalu diambil dari token, bukan dari input klien.
3. Jumlah staf aktif maksimal 5 per toko. Batas ini ditegakkan saat pemilik menambah atau mengaktifkan staf.
4. Staf hanya memiliki akses ke pesanan, penyesuaian stok, lihat produk dan kategori, lihat profil toko, serta notifikasi pesanan baru.
5. Staf tidak dapat mengakses keuangan, laporan, ekspor, pengaturan toko, pengelolaan produk, dan pengelolaan staf. Backend menolak dengan 403.
6. Staf hanya dapat melihat kontak pelanggan untuk pesanan tokonya. Data toko lain tidak dapat diakses.
7. Transisi status pesanan hanya yang tercantum di bagian 7.2. Transisi lain ditolak dengan 409. Status `selesai` dan `dibatalkan` bersifat final.
8. Pembatalan oleh staf wajib disertai alasan 10 sampai 300 karakter.
9. Stok dikurangi saat pesanan dibuat, dikembalikan tepat satu kali saat pesanan dibatalkan, dan tidak berubah saat pesanan selesai. Stok tidak boleh negatif.
10. Pesanan `selesai` membuat satu entri pemasukan otomatis. Pesanan `dibatalkan` tidak membuat pemasukan. Staf tidak dapat melihat atau mengubah entri tersebut.
11. Saat toko `nonaktif`, staf dapat login dan melihat data, tetapi tidak dapat memproses pesanan, membatalkan pesanan, atau menyesuaikan stok. Penyelesaian pesanan lama dilakukan pemilik.
12. Akun staf nonaktif tidak dapat login. Token lama ditolak pada permintaan berikutnya karena status akun diperiksa saat otorisasi.
13. Staf tidak dihapus permanen agar riwayat pesanan dan stok yang pernah ia proses tetap utuh. Pemilik hanya dapat menonaktifkan dan mengaktifkan kembali.
14. Setiap perubahan status pesanan mencatat pelaku (staf), waktu, dan alasan bila ada. Setiap penyesuaian stok mencatat pelaku staf.
15. Semua endpoint staf memerlukan role `STAFF`. Token pemilik, admin, atau pelanggan ditolak dengan 403.
16. Perubahan status pesanan, pengembalian stok saat pembatalan, dan penyesuaian stok memakai transaksi database.
17. Notifikasi hanya tersedia di dalam aplikasi. Token JWT berlaku 8 jam dan login dibatasi 10 percobaan per menit per alamat IP.
18. Password disimpan dengan hash bcrypt. Secret hanya disimpan di environment variable, tidak masuk repository.

### 7.2 Transisi status pesanan

| Dari | Ke | Pemicu | Syarat |
| --- | --- | --- | --- |
| (baru) | pending | Pelanggan menyelesaikan checkout | Stok cukup saat pesanan dibuat |
| pending | diproses | Pemilik atau staf | Tidak ada |
| pending | dibatalkan | Pemilik, staf, atau pelanggan | Alasan wajib untuk pemilik atau staf |
| diproses | selesai | Pemilik atau staf | Tidak ada |
| diproses | dibatalkan | Pemilik atau staf | Alasan wajib |

Transisi selain yang tercantum ditolak dengan kode 409. Status `selesai` dan `dibatalkan` bersifat final.

### 7.3 Status toko dari sudut pandang staf

| Status toko | Yang dapat dilakukan staf | Storefront | Pesanan baru | Aksi utama |
| --- | --- | --- | --- | --- |
| `aktif` | Semua fitur operasional staf | Tayang | Diterima | Proses pesanan dan jaga stok |
| `nonaktif` | Login, melihat dashboard, produk, pesanan, dan riwayat; tidak dapat mengubah status pesanan atau stok | Tidak tayang | Ditolak | Menunggu admin mengaktifkan kembali; penyelesaian pesanan lama oleh pemilik |
| `pending` | Akun staf tidak dibuat pada status ini; jika ada data lama, hanya baca | Tidak tayang | Tidak ada | Menunggu verifikasi admin |
| `ditolak` | Akun staf tidak dibuat pada status ini; jika ada data lama, hanya baca | Tidak tayang | Tidak ada | Menunggu pemilik memperbaiki dan mengajukan ulang |

### 7.4 Status akun staf

| Status akun | Dampak |
| --- | --- |
| `aktif` | Staf dapat login dan bekerja sesuai status toko. |
| `nonaktif` | Staf tidak dapat login. Token lama ditolak pada permintaan berikutnya. Riwayat pesanan dan stok tetap tersimpan. |

Staf nonaktif dapat diaktifkan kembali oleh pemilik selama jumlah staf aktif belum mencapai 5.

## 8. Alur utama

### 8.1 Login staf dan orientasi dashboard

1. Staf membuka halaman login yang sama dengan pemilik dan memasukkan email serta password.
2. Backend memverifikasi kredensial, role `STAFF`, status akun, dan relasi ke toko.
3. Frontend menyimpan token dan mengarahkan staf ke dashboard staf.
4. Dashboard menampilkan banner status toko, jumlah pesanan yang perlu diproses, pesanan hari ini, produk stok menipis, dan pesanan terbaru.
5. Staf memilih pesanan pertama atau membuka menu Pesanan.

### 8.2 Memproses pesanan sampai selesai

1. Pelanggan membuat pesanan; stok produk berkurang dan pesanan berstatus `pending`.
2. Staf menerima notifikasi dan membuka detail pesanan.
3. Staf menekan "Proses" sehingga status menjadi `diproses`.
4. Setelah barang diserahkan dan pembayaran diselesaikan di luar sistem, staf menekan "Selesaikan".
5. Status menjadi `selesai` dan satu entri pemasukan otomatis dibuat. Staf tidak melihat entri keuangan tersebut.

### 8.3 Membatalkan pesanan dan mengembalikan stok

1. Staf membuka pesanan berstatus `pending` atau `diproses`.
2. Staf menekan "Batalkan" dan mengisi alasan 10 sampai 300 karakter.
3. Sistem mengubah status menjadi `dibatalkan` dan mengembalikan stok tepat satu kali.
4. Tidak ada pemasukan yang dicatat. Riwayat status mencatat staf sebagai pelaku, alasan, dan waktu.

### 8.4 Menyesuaikan stok

1. Staf membuka halaman produk lalu memilih produk yang ingin disesuaikan.
2. Staf menekan "Sesuaikan Stok" dan memilih Tambah atau Kurangi.
3. Staf mengisi jumlah, alasan, dan catatan opsional, lalu menyimpan.
4. Sistem memeriksa hasil akhir tidak negatif, menyimpan perubahan, dan mencatat riwayat pergerakan stok dengan pelaku staf.
5. Angka stok pada daftar produk dan dashboard ikut diperbarui.

### 8.5 Toko dinonaktifkan saat staf bekerja

1. Admin menonaktifkan toko dengan alasan.
2. Staf yang sedang membuka panel menerima status toko terbaru pada pemuatan data berikutnya.
3. Banner "Toko dinonaktifkan" muncul dengan alasan dan penjelasan bahwa operasional dihentikan sementara.
4. Tombol Proses, Selesaikan, Batalkan, dan Sesuaikan Stok dinonaktifkan. Backend juga menolak permintaan tulis dengan 403 atau 409.
5. Setelah admin mengaktifkan kembali toko, staf dapat bekerja seperti biasa.

### 8.6 Akun staf dinonaktifkan pemilik

1. Pemilik menonaktifkan akun staf.
2. Staf yang sedang login mendapat 401 atau 403 pada permintaan berikutnya dan diarahkan ke halaman login dengan pesan akun dinonaktifkan.
3. Staf tidak dapat login lagi sampai pemilik mengaktifkan kembali.
4. Riwayat pesanan dan stok yang pernah diproses staf tetap tersimpan.

### 8.7 Menerima notifikasi pesanan baru

1. Pelanggan membuat pesanan baru.
2. Backend membuat notifikasi untuk pemilik dan semua staf aktif pada toko tersebut.
3. Frontend staf menampilkan badge belum dibaca pada ikon lonceng.
4. Staf membuka notifikasi atau langsung menuju detail pesanan.
5. Staf menandai notifikasi sebagai dibaca, sendiri atau sekaligus.

## 9. Spesifikasi halaman UI

Panel staf terdiri dari halaman login (bersama pemilik), dashboard, pesanan, produk dan stok, notifikasi, serta profil saya. Halaman profil saya dapat ditunda sesuai prioritas.

**Ketentuan umum semua halaman:**

- **Layout:** sidebar kiri berisi menu Dashboard, Pesanan, Produk, Stok, dan Notifikasi; header atas berisi nama toko, badge status toko, lonceng notifikasi, nama staf, dan tombol logout; area konten di kanan. Menu Keuangan, Laporan, Staf, dan Pengaturan Toko tidak ditampilkan.
- **Mobile:** sidebar berubah menjadi menu geser atau navigasi bawah. Tabel berubah menjadi kartu atau dapat digeser horizontal. Aksi utama tetap terjangkau dengan satu tangan.
- **Banner status:** toko `nonaktif` menampilkan banner di atas konten berisi alasan dan penjelasan bahwa panel berada dalam mode baca-saja.
- **State tampilan:** setiap halaman memiliki state loading (kerangka atau spinner), kosong (pesan dan ajakan aksi), dan error (pesan jelas dengan tombol Coba lagi).
- **Umpan balik:** setiap aksi ubah data menampilkan toast sukses atau gagal. Aksi berisiko (batalkan pesanan) selalu melewati dialog konfirmasi.
- **Format:** nominal ditampilkan sebagai Rupiah, tanggal dan waktu memakai WIB, dan label form selalu terlihat.
- **Proteksi rute:** halaman staf hanya dapat dibuka dengan token role `STAFF` yang valid. Tanpa token, pengguna dialihkan ke login. Staf yang membuka rute pemilik atau admin ditolak.

### 9.1 Login staf

**Tujuan:** pintu masuk aman ke panel operasional.

**Komponen dan fitur:**

1. Form email dan password dengan validasi format email dan kolom wajib.
2. Tombol tampilkan atau sembunyikan password.
3. Tombol Masuk berstatus loading dan nonaktif saat permintaan berjalan.
4. Pesan error di atas form: "Email atau password salah", "Akun dinonaktifkan", atau "Terlalu banyak percobaan, coba lagi nanti".
5. Redirect otomatis ke dashboard staf setelah login berhasil, dan ke login jika sesi berakhir.
6. Pengguna yang sudah login dan membuka halaman login langsung diarahkan ke panel sesuai role.
7. Identitas visual Ratis agar konsisten dengan aplikasi.

**Perilaku:** tekan Enter untuk mengirim form. Fokus awal pada kolom email. Pesan error hilang saat pengguna mulai mengetik ulang. Pemilik yang memakai halaman ini diarahkan ke panel pemilik; staf diarahkan ke panel staf.

### 9.2 Dashboard staf

**Tujuan:** memberi gambaran pekerjaan operasional hari ini dan mengarahkan staf ke pesanan yang mendesak.

**Komponen dan fitur:**

1. Banner status toko bila `nonaktif`, berisi alasan dan penjelasan mode baca-saja.
2. Kartu pesanan perlu diproses, pesanan masuk hari ini, pesanan selesai hari ini, dan produk stok menipis.
3. Daftar lima pesanan terbaru yang perlu ditangani dengan tombol pintas ke detail.
4. Pintasan ke halaman Pesanan dan Produk.
5. Indikator notifikasi belum dibaca pada ikon lonceng.
6. Waktu pembaruan data terakhir dan tombol Muat ulang.

**Perilaku:** kartu dapat diklik menuju daftar yang sudah terfilter. Tidak ada angka omzet, pemasukan, pengeluaran, atau laba di halaman ini.

**State khusus:** saat backend gratis sedang bangun, tampilkan kerangka loading dan teks "Menyiapkan data, mohon tunggu".

### 9.3 Pesanan

**Tujuan:** memproses pesanan pelanggan dengan cepat dan mencatat riwayatnya.

**Komponen dan fitur:**

1. Filter status (semua, pending, diproses, selesai, dibatalkan) dengan badge warna.
2. Pencarian kode pesanan atau nama pelanggan.
3. Filter rentang tanggal dengan pilihan cepat Hari ini, 7 hari, dan 30 hari.
4. Tabel atau kartu pesanan berisi kode, waktu, pelanggan, jumlah item, total, status, dan aksi.
5. Panel detail pesanan: kontak pelanggan, alamat, catatan, daftar item, total, dan riwayat status.
6. Tombol Proses untuk `pending`, tombol Selesaikan untuk `diproses`, dan tombol Batalkan untuk `pending` atau `diproses`.
7. Dialog pembatalan dengan kolom alasan wajib dan penghitung karakter 10 sampai 300.
8. Penanda pesanan baru yang belum dibuka.
9. Pagination 10 baris dan tombol Reset filter.

**Perilaku:** setelah aksi sukses, status pada daftar dan detail langsung berubah tanpa memuat ulang halaman. Jika terjadi konflik status (409), tampilkan pesan bahwa data sudah berubah lalu muat ulang detail. Tidak ada tombol untuk mengubah item atau total. Saat toko `nonaktif`, tombol aksi dinonaktifkan dengan keterangan.

### 9.4 Produk dan stok

**Tujuan:** melihat katalog dan menjaga stok tetap akurat tanpa hak mengubah produk.

**Tampilan daftar:**

1. Pencarian nama, filter kategori, filter status, dan filter stok menipis.
2. Tabel atau kartu berisi foto, nama, kategori, harga, stok, dan status.
3. Badge "Stok menipis" dan "Stok habis" agar mudah dipindai.
4. Pagination 10 baris dan penunjuk total produk.
5. Menu aksi: Lihat detail dan Sesuaikan Stok. Tidak ada tombol Tambah, Edit, Hapus, atau Nonaktifkan.

**Detail produk:**

1. Nama, kategori, harga, stok, `minStock`, deskripsi, dan foto.
2. Panel riwayat stok per produk berisi waktu, jenis, perubahan, stok sebelum dan sesudah, alasan, pelaku, dan kode pesanan.
3. Filter jenis dan tanggal pada riwayat stok.
4. Tombol Sesuaikan Stok yang membuka modal.

**Modal penyesuaian stok:**

1. Pilihan jenis Tambah atau Kurangi.
2. Jumlah, alasan wajib 5 sampai 200 karakter, dan catatan opsional.
3. Ringkasan stok sebelum dan sesudah agar staf dapat memeriksa hasilnya.
4. Tombol Simpan berstatus loading dan nonaktif saat permintaan berjalan.

**Perilaku:** setelah stok berubah, angka pada tabel dan dashboard ikut diperbarui. Saat toko `nonaktif`, tombol Sesuaikan Stok dinonaktifkan.

### 9.5 Notifikasi

**Tujuan:** memberi tahu staf tentang pesanan baru tanpa meninggalkan aplikasi.

**Komponen dan fitur:**

1. Ikon lonceng di header dengan badge jumlah belum dibaca.
2. Dropdown berisi lima notifikasi terbaru dan tautan "Lihat semua".
3. Halaman notifikasi berisi daftar lengkap, filter belum dibaca, dan tombol Tandai semua dibaca.
4. Setiap item menampilkan judul, pesan singkat, waktu, dan status baca.
5. Tautan ke detail pesanan terkait.

**Perilaku:** notifikasi baru muncul tanpa memuat ulang halaman. Menandai satu notifikasi sebagai dibaca mengurangi badge. Jika pesanan terkait sudah tidak ada, pengguna diarahkan ke daftar pesanan.

### 9.6 Profil saya (Could)

**Tujuan:** memberi staf kendali atas keamanan akunnya tanpa membuka pengaturan toko.

**Komponen dan fitur:**

1. Kartu identitas: nama, email, role, nama toko, status akun, status toko, dan tanggal akun dibuat.
2. Form ganti kata sandi: password lama, password baru, dan konfirmasi password baru.
3. Tombol tampilkan atau sembunyikan password.
4. Keterangan bahwa perubahan nama, email, dan reset password dilakukan oleh pemilik.
5. Tombol Logout.

**Perilaku:** setelah ganti password berhasil, form dikosongkan dan muncul toast sukses. Password lama yang salah ditampilkan sebagai error di bawah kolom.

## 10. Kriteria penerimaan dan skenario uji

Fitur dianggap selesai jika seluruh skenario Must di bawah lulus pada **versi yang sudah di-hosting**, bukan hanya di komputer lokal.

| ID | Fitur | Skenario | Hasil yang diharapkan |
| --- | --- | --- | --- |
| T1 | S1 | Login staf dengan data benar | Masuk ke dashboard staf, token tersimpan |
| T2 | S1 | Login dengan password salah | Pesan "Email atau password salah", tidak masuk |
| T3 | S1 | Login dengan akun staf nonaktif | Pesan akun dinonaktifkan, tidak masuk |
| T4 | S1 | Login dengan akun pemilik di halaman login | Diarahkan ke panel pemilik, bukan panel staf |
| T5 | S1 | Token staf dihapus lalu membuka halaman staf | Dialihkan ke login |
| T6 | S1 | Token pemilik, admin, atau pelanggan dipakai ke endpoint staf | Respons 403 |
| T7 | S2 | Membuka dashboard dengan data seeding | Angka pesanan dan stok sama dengan query database |
| T8 | S2 | Memeriksa dashboard staf | Tidak ada omzet, pemasukan, pengeluaran, atau laba |
| T9 | S3 | Memproses pesanan `pending` | Status menjadi `diproses` |
| T10 | S3 | Menyelesaikan pesanan `diproses` | Status menjadi `selesai`, pemasukan otomatis dibuat |
| T11 | S3 | Membatalkan pesanan tanpa alasan | Ditolak validasi (400), status tidak berubah |
| T12 | S3 | Membatalkan pesanan `pending` dengan alasan | Status `dibatalkan`, stok kembali tepat satu kali |
| T13 | S3 | Mengubah pesanan `selesai` menjadi `dibatalkan` | Ditolak (409), status tetap |
| T14 | S3 | Mencari dan memfilter pesanan | Hanya pesanan yang cocok tampil |
| T15 | S3 | Staf toko A membuka pesanan toko B | Respons 403 atau 404, data tidak bocor |
| T16 | S4 | Menyesuaikan stok dengan alasan valid | Stok berubah dan riwayat pergerakan tercatat atas nama staf |
| T17 | S4 | Mengurangi stok melebihi jumlah tersedia | Ditolak (400), stok tidak berubah |
| T18 | S4 | Menyesuaikan stok saat toko `nonaktif` | Ditolak (403 atau 409), stok tidak berubah |
| T19 | S4 | Membuka riwayat stok produk | Riwayat tampil dengan pelaku dan jenis pergerakan |
| T20 | S5 | Membuka daftar dan detail produk | Data tampil, tidak ada tombol tambah, ubah, atau hapus |
| T21 | S5 | Staf memanggil endpoint ubah produk atau kategori | Respons 403 |
| T22 | S5 | Staf memanggil endpoint keuangan, laporan, atau ekspor | Respons 403 |
| T23 | S5 | Staf memanggil endpoint kelola staf atau profil toko | Respons 403 |
| T24 | S1 | Toko dinonaktifkan saat staf login | Banner muncul, tombol aksi tulis nonaktif |
| T25 | S6 | Membuat pesanan baru | Notifikasi pesanan baru muncul untuk staf aktif toko tersebut |
| T26 | S6 | Menandai notifikasi sebagai dibaca | Badge belum dibaca berkurang |
| T27 | S7 | Mengganti kata sandi dengan password lama benar | Password baru berlaku untuk login berikutnya |
| T28 | S7 | Mengganti kata sandi dengan password lama salah | Ditolak (400), password tidak berubah |
| T29 | Semua | Mengakses panel staf lewat layar ponsel 390 px | Aksi Must tetap dapat dilakukan |
| T30 | Semua | Staf membuka rute pemilik atau admin secara langsung | Dialihkan atau ditolak, data tidak tampil |

## 11. Spesifikasi API

### 11.1 Konvensi

- Endpoint staf berada di bawah `/staff` dan memerlukan header `Authorization: Bearer <token>` dengan role `STAFF`. Endpoint auth bersama berada di `/auth`: `POST /auth/login` (publik) dan `GET /auth/me` (perlu token).
- Endpoint pemilik (`/owner`) dan admin (`/admin`) tidak dapat diakses token staf dan mengembalikan 403.
- Format respons sukses: `{ "data": ..., "meta": ... }`. Daftar memakai `meta` berisi `page`, `limit`, `total`.
- Format respons error: `{ "statusCode": 400, "message": "...", "errors": [...] }`.
- Kode error: 400 data tidak valid, 401 belum login atau token tidak valid, 403 role tidak diizinkan, akun nonaktif, atau toko nonaktif untuk aksi tulis, 404 data tidak ditemukan atau di luar cakupan toko, 409 konflik status atau data duplikat.
- Parameter daftar umum: `page` (default 1), `limit` (default 10, maksimal 50), `q` (pencarian).
- `shopId` tidak pernah diterima dari klien. Backend mengambil `shopId` dari token agar staf tidak dapat mengakses toko lain.
- Semua nominal memakai bilangan bulat rupiah. Semua tanggal pada filter dan respons memakai WIB.

### 11.2 Daftar endpoint

| Metode | Path | Fungsi | Request utama | Respons sukses | Error |
| --- | --- | --- | --- | --- | --- |
| POST | `/auth/login` | Login staf atau pemilik | body: email, password | 200: accessToken, user, shop | 400, 401, 403 |
| GET | `/auth/me` | Data pengguna yang login | header token | 200: user, shop | 401 |
| GET | `/staff/dashboard` | Statistik operasional | tidak ada | 200: status toko, pesanan per status, pesanan hari ini, stok menipis, pesanan terbaru | 401, 403 |
| GET | `/staff/shop` | Profil dan status toko | tidak ada | 200: profil, status, riwayat | 401, 403 |
| GET | `/staff/categories` | Kategori yang dipakai toko | tidak ada | 200: daftar kategori | 401, 403 |
| GET | `/staff/products` | Daftar produk | query: q, categoryId, isActive, lowStock, page, limit | 200: daftar dan meta | 401, 403 |
| GET | `/staff/products/:id` | Detail produk | path: id | 200: produk | 403, 404 |
| GET | `/staff/products/:id/stock-movements` | Riwayat stok produk | query: type, from, to, page, limit | 200: daftar dan meta | 403, 404 |
| POST | `/staff/products/:id/stock-adjustments` | Sesuaikan stok | body: quantityDelta, reason, note | 201: stok dan riwayat | 400, 403, 404, 409 |
| GET | `/staff/orders` | Daftar pesanan toko | query: status, q, from, to, page, limit | 200: daftar dan meta | 401, 403 |
| GET | `/staff/orders/:id` | Detail pesanan | path: id | 200: pesanan, item, riwayat | 403, 404 |
| PATCH | `/staff/orders/:id/status` | Ubah status pesanan | body: status, reason | 200: pesanan terbaru | 400, 403, 404, 409 |
| GET | `/staff/notifications` | Daftar notifikasi | query: unreadOnly, page, limit | 200: daftar dan meta | 401, 403 |
| PATCH | `/staff/notifications/:id/read` | Tandai satu notifikasi dibaca | path: id | 200: notifikasi | 403, 404 |
| PATCH | `/staff/notifications/read-all` | Tandai semua dibaca | tidak ada | 200: jumlah diperbarui | 401, 403 |
| GET | `/staff/profile` | Profil akun sendiri (Could) | tidak ada | 200: user, shop | 401, 403 |
| PATCH | `/staff/profile/password` | Ganti kata sandi sendiri (Could) | body: currentPassword, newPassword | 200: pesan sukses | 400, 401, 403 |

## 12. Model data yang dipakai staf

Berikut tabel dan kolom yang disentuh fitur staf (usulan awal untuk skema Prisma; dirapikan lebih lanjut saat membuat ERD). Model ini melengkapi model pada PRD admin dan PRD pemilik.

| Tabel | Kolom utama | Dipakai untuk |
| --- | --- | --- |
| `users` | id, name, email, passwordHash, role (STAFF), isActive, shopId (nullable, untuk staf), createdAt | Login dan profil staf |
| `shops` | id, ownerId, name, slug, status (pending, aktif, ditolak, nonaktif), statusReason, updatedAt | Status toko dan banner |
| `categories` | id, name, slug, isActive | Daftar kategori produk |
| `products` | id, shopId, categoryId, name, description, price, stock, minStock, imageUrl (opsional), isActive, createdAt, updatedAt | Lihat produk dan penyesuaian stok |
| `stock_movements` | id, shopId, productId, type (stok_awal, penjualan, pembatalan, penyesuaian), quantityDelta, stockBefore, stockAfter, reason, orderId (nullable), actorId, createdAt | Riwayat stok dan pelaku penyesuaian |
| `orders` | id, code, shopId, customerId, customerName, customerPhone, customerAddress, note, total, status (pending, diproses, selesai, dibatalkan), cancellationReason, createdAt, completedAt, cancelledAt | Daftar dan detail pesanan |
| `order_items` | id, orderId, productId, productName, quantity, unitPrice, subtotal | Detail item pesanan |
| `order_status_histories` | id, orderId, fromStatus, toStatus, reason, changedById, createdAt | Riwayat status pesanan dan pelaku staf |
| `notifications` | id, userId, shopId, type, title, message, data (JSON), isRead, createdAt | Notifikasi pesanan baru |

**Catatan model:**

- `users.shopId` hanya diisi untuk staf. Pemilik terhubung melalui `shops.ownerId`. Pada skema saat ini kolom staf bernama `staffShopId`.
- `orders` menyimpan snapshot nama, nomor HP, dan alamat pelanggan saat pesanan dibuat agar riwayat tetap utuh.
- `stock_movements` bersifat append-only dan tidak diedit setelah dibuat. Penyesuaian staf tercatat dengan `actorId`.
- `order_status_histories` mencatat `changedById` sehingga aksi staf dapat diaudit.
- `notifications.data` menyimpan tautan atau ID objek terkait untuk navigasi.

**Indeks yang disarankan:** `users(email)` unik, `users(shopId)`, `products(shopId, isActive)`, `products(shopId, stock)`, `stock_movements(productId, createdAt)`, `orders(shopId, status, createdAt)`, `orders(shopId, createdAt)`, `order_items(orderId)`, `order_status_histories(orderId, createdAt)`, dan `notifications(userId, isRead, createdAt)`. Indeks ini menjaga daftar dan dashboard tetap cepat di database gratis.

## 13. Kebutuhan non-fungsional

| Aspek | Kebutuhan |
| --- | --- |
| Keamanan | Password disimpan dengan hash bcrypt. Token JWT berlaku 8 jam. Header keamanan lewat `helmet`. Rate limit login 10 percobaan per menit per alamat IP. CORS hanya untuk domain frontend. Semua input divalidasi DTO dengan opsi whitelist. Secret hanya di environment variable. |
| Isolasi data | Setiap query memakai `shopId` dari token, bukan dari parameter klien. Staf tidak dapat membaca atau mengubah data toko lain. ID pesanan atau produk toko lain menghasilkan 403 atau 404. |
| Otorisasi | Pemeriksaan role `STAFF` dan status akun dilakukan di backend pada setiap permintaan, tidak hanya menyembunyikan menu di frontend. Aksi tulis juga memeriksa status toko. |
| Konsistensi data | Perubahan status pesanan, pengembalian stok saat pembatalan, dan penyesuaian stok memakai transaksi database. |
| Performa | Dashboard dimuat kurang dari 3 detik saat backend aktif. Semua daftar memakai pagination dan query terindeks. Polling notifikasi tidak boleh membebani server. |
| Ketersediaan | Backend gratis bisa tertidur. Sediakan endpoint `GET /health` untuk ping berkala dan state loading yang jelas di frontend. |
| Kegunaan | Konfirmasi untuk aksi berisiko, pesan error berbahasa Indonesia yang jelas, dan jumlah klik sesuai target pada bagian 2. |
| Tampilan | Konsisten dengan panel pemilik (warna, tipografi, spasi), responsif untuk ponsel, tablet, dan desktop, kontras teks yang cukup, serta label pada setiap kolom form. |
| Kompatibilitas | Chrome, Edge, Firefox, dan Safari versi terbaru, termasuk browser ponsel Android dan iOS. |
| Privasi | Kontak pelanggan hanya terlihat oleh pemilik dan staf toko terkait. Staf tidak dapat melihat data keuangan atau data pelanggan di luar pesanan tokonya. |
| Pemeliharaan | Struktur modul NestJS terpisah (auth, staff/dashboard, products, stock, orders, notifications), dokumentasi API dengan Swagger, dan seeding yang idempoten. |

## 14. Data seeding untuk demo

Juri harus bisa mencoba semua alur staf tanpa menyiapkan data sendiri. Seeding mencakup:

| Data | Jumlah | Keterangan |
| --- | --- | --- |
| Akun staf aktif | 2 | Satu di toko aktif dengan pesanan dan stok, satu lagi untuk uji multi-staf |
| Akun staf nonaktif | 1 | Untuk mencoba login ditolak dengan pesan akun dinonaktifkan |
| Akun staf pada toko nonaktif | 1 | Untuk mencoba banner dan mode baca-saja |
| Kategori | 6 | Mengikuti seeding admin |
| Produk | Sekitar 20 | Tersebar di toko aktif dan nonaktif, termasuk stok menipis dan stok habis |
| Pesanan | Sekitar 30 | Tersebar di empat status dan 14 hari terakhir |
| Riwayat stok | Sekitar 40 | Stok awal, penjualan, pembatalan, dan penyesuaian oleh pemilik atau staf |
| Notifikasi | Sekitar 8 | Campuran belum dibaca dan sudah dibaca |

Sertakan minimal satu pesanan `pending`, satu `diproses`, satu `selesai`, dan satu `dibatalkan` pada toko tempat staf bertugas. Sertakan satu produk dengan stok menipis dan satu produk dengan stok habis agar dashboard staf bermakna. Kredensial akun demo dicantumkan di README. Seeding dibuat idempoten dan dijalankan otomatis saat deploy awal.

## 15. Rencana pengerjaan, risiko, dan keputusan tim

### 15.1 Urutan pengerjaan yang disarankan

| Tahap | Pekerjaan | Bergantung pada |
| --- | --- | --- |
| 1 | Autentikasi, RBAC role `STAFF`, dan pengarahan panel berdasarkan role (S1) | Skema database dan modul auth |
| 2 | Dashboard operasional staf (S2) | Modul pesanan dan produk |
| 3 | Manajemen pesanan dan transisi status (S3) | Modul pesanan pelanggan |
| 4 | Lihat produk, kategori, dan riwayat stok (S5) | Modul produk |
| 5 | Penyesuaian stok (S4) | Tahap 4 |
| 6 | Notifikasi pesanan baru (S6) | Tahap 3 |
| 7 | Profil dan ganti kata sandi (S7, jika waktu ada) | Tahap 1 |
| 8 | Uji skenario T1 sampai T30 pada versi hosting | Semua tahap |

Dashboard sengaja dikerjakan setelah modul pesanan dan produk tersedia karena angkanya bergantung pada data tersebut. Notifikasi menyusul setelah alur pesanan stabil.

### 15.2 Risiko dan mitigasi

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Staf mendapat akses lebih dari yang seharusnya | Data keuangan atau pengaturan toko bocor | Guard role di backend per endpoint, menu terbatas di frontend, dan uji endpoint terlarang dengan token staf |
| Data toko bocor ke staf toko lain | Masalah keamanan dan kepercayaan | Selalu ambil `shopId` dari token, uji IDOR dengan dua akun staf |
| Stok tidak sinkron karena pesanan dan penyesuaian bersamaan | Stok negatif atau salah | Transaksi database, pengecekan stok, dan uji alur bersamaan |
| Pembatalan mengembalikan stok dua kali | Stok tidak akurat | Cek status pesanan dalam transaksi dan tolak aksi ulang dengan 409 |
| Staf tetap bisa menulis saat toko `nonaktif` | Data berubah saat operasional dihentikan | Pemeriksaan status toko di backend pada setiap aksi tulis, bukan hanya di frontend |
| Akun staf nonaktif masih memakai token lama | Akses tidak sah | Periksa status akun pada setiap permintaan, bukan hanya saat login |
| Notifikasi terlalu sering atau berulang | Staf terganggu | Buat satu notifikasi per pesanan baru, tanpa pengulangan |
| Backend gratis tertidur saat juri membuka web | Halaman pertama lambat | Ping berkala ke `/health`, state loading yang jelas, catatan di README |
| Tampilan hanya nyaman di desktop | Staf tidak bisa memakai dari ponsel | Desain responsif dan uji aksi Must pada layar 390 px |
| Data demo tidak mencakup semua status | Juri tidak bisa mencoba alur | Seeding sesuai bagian 14 |

### 15.3 Keputusan tim

1. **Staf tidak memiliki registrasi publik.** Akun staf hanya dibuat pemilik agar tidak ada orang luar yang mendaftar sebagai staf toko.
2. **Panel staf terpisah dari panel pemilik.** Login memakai halaman yang sama, tetapi pengarahan tujuan ditentukan oleh role agar staf tidak melihat menu terlarang.
3. **Staf tidak dapat melihat keuangan.** Staf membantu operasional, bukan mengambil keputusan usaha. Omzet, laba, laporan, dan ekspor tidak ditampilkan.
4. **Staf dapat melihat harga produk.** Harga dibutuhkan saat melayani pesanan dan bukan laporan keuangan. Data omzet dan laba tetap tertutup.
5. **Staf dapat memproses, menyelesaikan, dan membatalkan pesanan.** Tugas kasir mencakup seluruh transisi status yang diizinkan, dengan alasan wajib saat membatalkan.
6. **Staf hanya dapat menyesuaikan stok, bukan mengelola produk.** Produk, harga, kategori, dan status produk tetap wewenang pemilik dan admin.
7. **Staf tidak dihapus permanen.** Pemilik hanya menonaktifkan akun agar riwayat pesanan dan stok yang pernah diproses tetap utuh.
8. **Batas 5 staf aktif per toko.** Batas ini menjaga agar pengelolaan tetap sederhana dan sesuai PRD pemilik.
9. **Saat toko `nonaktif`, staf hanya baca.** Penyelesaian pesanan lama dilakukan pemilik agar tanggung jawab tetap jelas.
10. **Notifikasi hanya di dalam aplikasi.** Tidak ada email atau WhatsApp pada versi ini; frontend memakai polling sederhana.
11. **Ganti kata sandi sendiri bersifat Could.** Pemilik tetap dapat mereset password staf kapan saja.
12. **Token dan rate limit mengikuti admin dan pemilik.** Token JWT berlaku 8 jam dan login dibatasi 10 percobaan per menit per alamat IP.
13. **Aksi staf tercatat di riwayat.** Riwayat status pesanan dan riwayat stok menyimpan pelaku agar operasional dapat diaudit.
14. **Endpoint staf dipisah dari endpoint pemilik.** Pemisahan ini membuat pembatasan role lebih jelas dan lebih mudah diuji.
