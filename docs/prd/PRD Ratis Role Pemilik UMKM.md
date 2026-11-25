# PRD Ratis: Role Pemilik UMKM

Tim Ratis | Techcomfest 2027, Web Application Competition | Sub-Tema 2 (SDG 8)

## 1. Ringkasan

Pemilik UMKM adalah pengguna utama Ratis. Ia mengelola seluruh usaha dalam satu tempat: profil toko, produk, stok, pesanan, keuangan, dan staf. Tujuan role ini adalah membuat pemilik usaha kecil dapat berjualan online sekaligus mencatat operasional harian tanpa berpindah-pindah aplikasi.

PRD ini menetapkan kebutuhan role pemilik UMKM dari pendaftaran sampai toko beroperasi. Verifikasi dan pengawasan platform tetap menjadi wewenang admin. PRD ini fokus pada kebutuhan produk; flowchart dan desain UI role pemilik dibuat sebagai dokumen terpisah.

### 1.1 Latar belakang

Banyak pelaku UMKM mencatat pesanan lewat chat, menghitung stok di buku, dan mencampur uang usaha dengan uang pribadi. Akibatnya, stok sering tidak sinkron, pesanan terlewat, dan pemilik tidak tahu apakah usahanya benar-benar untung. Ratis menyatukan etalase online, pengelolaan operasional, dan pembukuan sederhana agar pemilik dapat bekerja lebih rapi dan mengambil keputusan berdasarkan data.

Pemilik UMKM adalah pihak yang paling sering memakai aplikasi. Karena itu, alur utamanya harus singkat, bahasanya jelas, dan tetap nyaman dipakai dari ponsel. Fitur yang terlalu rumit atau meminta data yang tidak dimiliki UMKM kecil akan membuat aplikasi ditinggalkan.

### 1.2 Posisi pemilik UMKM di ekosistem Ratis

| Role | Hubungan dengan pemilik UMKM |
| --- | --- |
| Admin | Memverifikasi toko, mengaktifkan atau menonaktifkan toko, dan mengelola kategori global. Admin tidak mengubah data operasional toko. |
| Pemilik UMKM | Mendaftarkan toko, mengelola produk, stok, pesanan, keuangan, dan staf. Pemilik hanya melihat data tokonya sendiri. |
| Staf/kasir | Dibuat oleh pemilik dengan akses terbatas untuk memproses pesanan, menyesuaikan stok, dan melihat produk. Staf tidak dapat melihat keuangan atau mengubah profil toko. |
| Pelanggan | Melihat storefront toko yang aktif, memesan produk, dan membayar di luar sistem. Pemilik melihat data kontak pelanggan hanya untuk pesanan di tokonya. |

Satu pemilik memiliki satu toko pada versi lomba ini. Akun pemilik tidak dapat dibuat melalui halaman admin; akun tersebut lahir dari registrasi pemilik.

## 2. Tujuan dan metrik keberhasilan

Setiap tujuan pemilik punya ukuran yang dapat dicek saat pengujian dan saat juri mencoba aplikasi.

| Tujuan | Metrik | Target | Cara mengukur |
| --- | --- | --- | --- |
| Onboarding cepat | Waktu dari registrasi sampai produk pertama siap | Kurang dari 10 menit | Uji manual dengan akun baru |
| Status verifikasi jelas | Waktu pemilik memahami status dan alasan penolakan | Kurang dari 1 menit | Uji manual pada toko ditolak |
| Operasional harian cepat | Langkah memproses satu pesanan dari daftar | Maksimal 2 klik sampai status berubah | Uji manual alur pesanan |
| Stok akurat | Kecocokan stok database dengan hasil alur uji | 100% | Bandingkan stok sebelum dan sesudah pesanan atau pembatalan |
| Keuangan otomatis | Kecocokan pemasukan otomatis dengan total pesanan selesai | 100% | Bandingkan dengan query database |
| Dashboard cepat | Waktu muat dashboard saat backend aktif | Kurang dari 3 detik | Tab Network di browser |
| Data terisolasi | Akses data toko lain lewat token pemilik | 0 kejadian | Uji endpoint dengan dua akun pemilik |
| Staf terkendali | Akses staf ke fitur terlarang | Selalu ditolak dengan kode 403 | Uji dengan token staf |
| Nyaman di ponsel | Aksi utama dapat dilakukan pada layar 390 px | Semua aksi Must dapat dipakai | Uji manual di browser mobile |

## 3. Pengguna dan hak akses

### 3.1 Persona

**Nama:** Bu Sari. **Latar:** pemilik usaha kue rumahan, terbiasa memakai ponsel untuk berjualan lewat chat dan media sosial, tetapi belum pernah memakai sistem pembukuan. **Perangkat:** ponsel sebagai perangkat utama, laptop untuk mengecek laporan. **Kebutuhan:** mencatat pesanan dan stok dengan cepat, tahu uang masuk dan keluar, serta tidak harus memahami istilah akuntansi. **Frustrasi yang dihindari:** form panjang, angka yang tidak cocok, pesanan terlewat, dan aplikasi yang hanya nyaman dipakai di desktop.

Akun pemilik dibuat melalui registrasi publik. Setelah mendaftar, pemilik langsung dapat masuk ke dashboard untuk menyiapkan toko, tetapi storefront baru tayang setelah admin menyetujui.

### 3.2 Skenario penggunaan

1. **Mendaftar dan menunggu verifikasi:** Bu Sari membuat akun, mengisi profil toko, lalu menyiapkan produk sambil menunggu admin menyetujui tokonya.
2. **Pagi hari:** Bu Sari membuka dashboard, melihat pesanan yang perlu diproses, produk yang stoknya menipis, dan omzet hari ini.
3. **Memproses pesanan:** Bu Sari membuka pesanan baru, menghubungi pelanggan, menandai pesanan sedang diproses, lalu menyelesaikannya setelah barang diserahkan.
4. **Menambah stok:** Setelah belanja bahan, Bu Sari menyesuaikan stok produk dan mengisi alasan penyesuaian agar riwayatnya jelas.
5. **Mencatat pengeluaran:** Bu Sari mencatat pembelian bahan dan biaya operasional, lalu melihat laba bulan ini.
6. **Mengelola staf:** Bu Sari menambahkan kasir dengan akses terbatas agar pesanan tetap diproses saat ia sibuk.
7. **Toko ditolak:** Bu Sari membaca alasan penolakan, memperbaiki profil, lalu mengajukan ulang tanpa batas jumlah.

### 3.3 Matriks hak akses

| Aksi | Pemilik UMKM | Staf/kasir | Admin | Pelanggan |
| --- | --- | --- | --- | --- |
| Registrasi toko | Ya | Tidak | Tidak | Tidak |
| Login dan logout | Ya | Ya | Ya | Ya |
| Melihat dashboard usaha | Ya (lengkap) | Ya (tanpa keuangan) | Tidak | Tidak |
| Melihat dan mengubah profil toko | Ya | Tidak | Hanya baca saat verifikasi | Tidak |
| Mengajukan ulang setelah ditolak | Ya | Tidak | Tidak | Tidak |
| Menambah, mengubah, dan menghapus produk | Ya | Hanya melihat | Tidak | Tidak |
| Menyesuaikan stok | Ya | Ya | Tidak | Tidak |
| Memproses pesanan | Ya | Ya | Hanya baca | Hanya pesanannya |
| Melihat keuangan dan laporan | Ya | Tidak | Tidak | Tidak |
| Mengelola staf | Ya | Tidak | Tidak | Tidak |
| Melihat kontak pelanggan | Ya, untuk pesanan tokonya | Ya, untuk pesanan tokonya | Hanya nama | Data miliknya |
| Menerima notifikasi usaha | Ya | Ya, untuk pesanan baru | Tidak | Tidak |

## 4. Ruang lingkup, asumsi, dan dependensi

### 4.1 Termasuk dalam lingkup

- Registrasi pemilik dan pengajuan toko berstatus `pending`.
- Login dan logout pemilik dengan sesi berbasis JWT.
- Dashboard usaha: status toko, omzet, pesanan, stok menipis, tren, dan produk terlaris.
- Profil toko: melihat status, mengubah data sesuai status, dan mengajukan ulang setelah ditolak.
- Manajemen produk: tambah, ubah, nonaktifkan, hapus, cari, dan filter.
- Manajemen stok: penyesuaian stok dengan alasan dan riwayat pergerakan stok.
- Manajemen pesanan: daftar, detail, proses, selesaikan, dan batalkan dengan alasan.
- Pencatatan keuangan: pemasukan otomatis dari pesanan selesai dan pengeluaran manual.
- Manajemen staf: tambah, ubah, nonaktifkan, dan aktifkan staf dengan akses terbatas.
- Notifikasi dalam aplikasi untuk pesanan baru, perubahan status toko, dan stok menipis.
- Laporan penjualan (Should) dan ekspor CSV (Could).
- Pratinjau storefront milik sendiri (Could).
- Riwayat status toko, riwayat status pesanan, dan riwayat pergerakan stok.

### 4.2 Di luar lingkup

- Verifikasi, penolakan, aktivasi, dan penonaktifan toko; semuanya wewenang admin.
- Pembayaran online, payment gateway, penarikan dana, pengembalian dana, dan komisi platform.
- Checkout, keranjang, dan halaman pelanggan; dibahas di PRD pelanggan.
- Pengiriman otomatis dan integrasi kurir.
- Satu pemilik dengan banyak toko, banyak gudang, atau banyak cabang.
- Varian produk seperti ukuran dan warna.
- Pembuatan pesanan manual oleh pemilik atau mode kasir offline.
- Notifikasi email atau WhatsApp otomatis, verifikasi email, dan pemulihan kata sandi lewat email.
- Akuntansi lanjutan seperti jurnal, pajak, neraca, dan penggajian.
- Ulasan, promo, voucher, dan program loyalitas.
- Impor data massal; versi ini hanya menyediakan ekspor CSV.
- Aplikasi mobile native.
- Antarmuka lengkap role staf, pelanggan, dan admin; masing-masing memiliki PRD sendiri.

### 4.3 Asumsi

- Modul autentikasi, RBAC, dan verifikasi admin sudah tersedia atau dikerjakan paralel.
- Modul pelanggan yang membuat pesanan sudah tersedia; pesanan masuk ke toko dengan status `pending`.
- Satu pemilik memiliki satu toko pada versi lomba ini.
- Pembayaran dilakukan di luar sistem, misalnya tunai atau transfer langsung. Sistem hanya mencatat status pesanan.
- Stok dikelola di satu lokasi per toko.
- Kategori produk bersifat global dan dikelola admin.
- Jumlah data demo kecil, sehingga pagination sederhana sudah cukup.
- NIB dan foto usaha bersifat opsional karena tidak semua UMKM memilikinya.
- Pemilik memakai browser modern di ponsel, tablet, atau desktop.
- Token JWT berlaku 8 jam dan login dibatasi 10 percobaan per menit per alamat IP.
- Angka konfigurasi seperti ukuran halaman, batas staf, dan ambang stok menipis adalah usulan awal yang boleh disesuaikan tim.

### 4.4 Dependensi

| Dependensi | Dibutuhkan untuk | Catatan |
| --- | --- | --- |
| Modul autentikasi dan RBAC | Registrasi, login, dan seluruh fitur pemilik | Harus selesai paling awal |
| Modul verifikasi admin | Perubahan status toko dan alasan penolakan | Menentukan kapan toko tayang |
| Modul kategori global | Pilihan kategori saat membuat produk | Dikelola admin |
| Modul pelanggan dan checkout | Pesanan masuk dan pengurangan stok | Dikerjakan bersama role pelanggan |
| Penyimpanan berkas (mis. Cloudinary) | Foto usaha dan foto produk opsional | Dapat ditunda jika waktu terbatas |
| Database dan seeding | Semua halaman dan data demo | Data harus mencakup semua status toko |
| Modul notifikasi internal | Pemberitahuan pesanan dan status toko | Tidak memakai email atau WhatsApp |

## 5. Daftar fitur dan prioritas

Prioritas memakai skema MoSCoW: Must (wajib ada untuk lomba), Should (sangat diinginkan), Could (dikerjakan jika waktu tersisa).

| ID | Fitur | User story | Halaman | Prioritas |
| --- | --- | --- | --- | --- |
| O1 | Registrasi dan pengajuan toko | Sebagai calon pemilik, saya mendaftarkan akun dan toko agar bisa mulai berjualan | Registrasi | Must |
| O2 | Login dan logout | Sebagai pemilik, saya masuk dan keluar agar data usaha aman | Login | Must |
| O3 | Dashboard usaha | Sebagai pemilik, saya melihat ringkasan usaha agar tahu kondisi hari ini | Dashboard | Must |
| O4 | Profil toko dan pengajuan ulang | Sebagai pemilik, saya melihat status verifikasi, memperbaiki profil, dan mengajukan ulang | Profil toko | Must |
| O5 | Manajemen produk | Sebagai pemilik, saya mengelola produk agar katalog siap dijual | Produk | Must |
| O6 | Manajemen stok | Sebagai pemilik, saya menyesuaikan stok dan melihat riwayatnya agar stok akurat | Produk dan stok | Must |
| O7 | Manajemen pesanan | Sebagai pemilik, saya memproses pesanan agar pelanggan mendapat barang | Pesanan | Must |
| O8 | Pencatatan keuangan | Sebagai pemilik, saya melihat pemasukan otomatis dan mencatat pengeluaran agar tahu laba | Keuangan | Must |
| O9 | Manajemen staf | Sebagai pemilik, saya menambah staf dengan akses terbatas agar operasional terbantu | Staf | Should |
| O10 | Notifikasi dalam aplikasi | Sebagai pemilik, saya mendapat notifikasi agar tidak melewatkan pesanan dan perubahan status | Notifikasi | Should |
| O11 | Laporan penjualan | Sebagai pemilik, saya melihat laporan penjualan agar bisa mengevaluasi usaha | Laporan | Should |
| O12 | Ekspor CSV | Sebagai pemilik, saya mengekspor data agar bisa diolah di spreadsheet | Laporan | Could |
| O13 | Pratinjau storefront | Sebagai pemilik, saya melihat pratinjau toko agar yakin tampilannya sebelum aktif | Pratinjau toko | Could |

## 6. Spesifikasi fungsional per fitur

### O1 Registrasi dan pengajuan toko

- **Deskripsi:** pendaftaran publik yang membuat akun pemilik dan toko baru berstatus `pending` dalam satu proses.
- **Input akun:** nama pemilik (wajib, 2 sampai 100 karakter), email (wajib, format valid, unik), nomor HP (wajib, 10 sampai 15 digit, boleh diawali `+62`), password (wajib, minimal 8 karakter), dan konfirmasi password.
- **Input toko:** nama toko (wajib, 3 sampai 100 karakter), deskripsi (wajib, 20 sampai 500 karakter), alamat (wajib, 10 sampai 300 karakter), NIB (opsional, tepat 13 digit jika diisi), dan foto usaha (opsional, JPG atau PNG, maksimal 2 MB).
- **Alur sukses:** sistem memvalidasi input, memastikan email belum dipakai, membuat hash password, lalu menyimpan akun, toko, dan riwayat status awal dalam satu transaksi database. Setelah berhasil, pemilik otomatis masuk dan diarahkan ke dashboard dengan banner "Menunggu verifikasi admin".
- **Alur gagal:** input tidak valid mendapat 400 dengan pesan per kolom. Email yang sudah terdaftar mendapat 409. Jika unggah foto gagal, pendaftaran tidak disimpan setengah jadi; pengguna dapat mencoba lagi tanpa foto.
- **Kasus tepi:** NIB dan foto boleh kosong. Nama toko boleh sama dengan toko lain, tetapi `slug` dibuat unik dengan akhiran angka. Satu email hanya boleh memiliki satu toko. Tidak ada verifikasi email pada versi ini.

### O2 Login dan logout

- **Deskripsi:** pintu masuk pemilik ke panel usaha. Autentikasi memakai email dan password dan menghasilkan token JWT.
- **Input:** email (wajib, format valid) dan password (wajib, minimal 8 karakter).
- **Alur sukses:** backend mencocokkan hash password, memastikan role `OWNER` dan akun aktif, lalu mengirim token, data pengguna, dan ringkasan toko (nama serta status). Frontend menyimpan token dan mengarahkan ke dashboard.
- **Alur gagal:** kredensial salah selalu menghasilkan pesan umum "Email atau password salah". Akun nonaktif mendapat pesan khusus. Percobaan berlebihan ditahan sementara dengan rate limit.
- **Logout:** token dihapus dari penyimpanan frontend dan pengguna diarahkan ke halaman login.
- **Kasus tepi:** pemilik dengan toko `pending`, `ditolak`, atau `nonaktif` tetap boleh login dan melihat dashboard dengan banner status. Token kedaluwarsa menghasilkan 401 dan pengguna diarahkan ke login. Akun staf memakai halaman login yang sama, tetapi diarahkan ke panel staf; detail panel staf ada di PRD terpisah.

### O3 Dashboard usaha

- **Deskripsi:** ringkasan kondisi usaha dalam satu layar, sekaligus pintu masuk ke pekerjaan yang mendesak.
- **Data yang ditampilkan:** status toko; omzet hari ini; omzet bulan ini; jumlah pesanan yang perlu diproses; jumlah produk aktif; jumlah produk dengan stok menipis; grafik omzet atau pesanan 7 atau 30 hari terakhir; lima produk terlaris; dan lima pesanan terbaru.
- **Aturan hitung:** omzet hanya menghitung pesanan berstatus `selesai`. Pesanan `dibatalkan` tidak dihitung. "Perlu diproses" mencakup pesanan `pending` dan `diproses`. "Stok menipis" berarti stok kurang dari atau sama dengan `minStock` produk. Produk terlaris dihitung dari jumlah item pada pesanan selesai. Semua tanggal memakai zona waktu WIB.
- **Interaksi:** mengganti rentang waktu memuat ulang grafik dan daftar produk terlaris. Kartu "Perlu diproses" membuka daftar pesanan dengan filter aktif. Kartu "Stok menipis" membuka daftar produk dengan filter stok menipis.
- **Mode onboarding:** saat toko `pending` atau `ditolak`, dashboard menampilkan status verifikasi, alasan penolakan bila ada, checklist persiapan toko, dan pintasan ke profil serta produk. Angka penjualan ditampilkan 0 dengan pesan yang ramah.
- **Kasus tepi:** belum ada data menampilkan angka 0 dan pesan kosong, bukan error. Saat backend gratis sedang bangun, tampilkan kerangka loading dan teks "Menyiapkan data, mohon tunggu". Tombol Muat ulang menyegarkan data tanpa memuat ulang halaman.

### O4 Profil toko dan pengajuan ulang

- **Deskripsi:** halaman tempat pemilik melihat identitas toko, status verifikasi, alasan dari admin, dan riwayat status.
- **Data yang ditampilkan:** nama toko, `slug`, deskripsi, nomor HP, alamat, NIB (opsional), foto usaha (opsional), status toko, alasan status, admin pemverifikasi bila relevan, tanggal verifikasi, dan riwayat status.
- **Aturan perubahan:** saat `pending`, profil hanya dapat dibaca agar data yang ditinjau admin tidak berubah. Saat `ditolak`, pemilik dapat memperbaiki profil lalu mengajukan ulang. Saat `aktif`, pemilik dapat mengubah profil dan status tetap `aktif` tanpa verifikasi ulang. Saat `nonaktif`, profil hanya dapat dibaca; pemilik tidak dapat mengaktifkan tokonya sendiri.
- **Alur pengajuan ulang:** pemilik membuka halaman profil, memperbaiki data yang diminta, menekan "Ajukan Ulang", lalu mengonfirmasi. Status berubah menjadi `pending`, riwayat penolakan tetap tersimpan, dan toko masuk kembali ke daftar verifikasi admin.
- **Validasi:** sama dengan validasi pendaftaran. NIB boleh kosong. Foto pengganti harus JPG atau PNG maksimal 2 MB.
- **Kasus tepi:** pengajuan ulang tidak dibatasi jumlahnya. Jika admin sudah mengubah status saat pemilik menyimpan, backend mengembalikan 409 dan halaman memuat status terbaru. `slug` bersifat tetap agar tautan toko tidak berubah saat nama toko diedit. Perubahan nama toko pada status `aktif` langsung terlihat di storefront.

### O5 Manajemen produk

- **Deskripsi:** pengelolaan katalog produk milik toko.
- **Daftar produk:** kolom foto, nama, kategori, harga, stok, status, dan aksi. Tersedia pencarian nama, filter kategori, filter status aktif atau nonaktif, filter stok menipis, pengurutan terbaru, dan pagination 10 baris.
- **Tambah dan ubah:** nama produk (wajib, 3 sampai 100 karakter), kategori (wajib, hanya kategori aktif), harga (wajib, bilangan bulat rupiah lebih dari 0), stok awal saat membuat (wajib, minimal 0), `minStock` (opsional, default 5), deskripsi (opsional, maksimal 500 karakter), dan foto produk (opsional, JPG atau PNG, maksimal 2 MB).
- **Aturan stok:** stok tidak diubah melalui form produk setelah produk dibuat; perubahan stok memakai penyesuaian stok di O6 agar tercatat. Harga baru hanya berlaku untuk pesanan baru; item pesanan lama memakai harga saat pesanan dibuat.
- **Nonaktifkan:** produk nonaktif tidak tampil di storefront dan tidak dapat dipesan, tetapi tetap terlihat di panel pemilik dan tidak mengubah pesanan lama. Produk dapat diaktifkan kembali kapan saja.
- **Hapus:** produk hanya boleh dihapus permanen jika belum pernah dipakai di pesanan. Jika sudah memiliki riwayat pesanan, sistem menolak dengan 409 dan menyarankan menonaktifkan produk. Riwayat stok produk yang dihapus ikut terhapus karena produk belum pernah dipakai di pesanan.
- **Status toko:** produk dapat dikelola saat toko `pending`, `ditolak`, dan `aktif`. Saat toko `nonaktif`, halaman produk hanya dapat dibaca.
- **Kasus tepi:** kategori yang dinonaktifkan admin tidak muncul untuk produk baru, tetapi produk lama tetap menampilkan nama kategori tersebut. Produk dengan stok 0 boleh tetap aktif dan ditandai "Stok habis" di storefront. Nama produk boleh sama; pembeda utama adalah ID produk.

### O6 Manajemen stok

- **Deskripsi:** pencatatan setiap perubahan stok agar angka di sistem dapat dipertanggungjawabkan.
- **Penyesuaian manual:** pemilik atau staf memilih produk, memilih Tambah atau Kurangi, mengisi jumlah (bilangan bulat lebih dari 0), alasan (wajib, 5 sampai 200 karakter), dan catatan opsional. Sistem menolak jika hasil akhir stok negatif.
- **Riwayat stok:** setiap pergerakan mencatat waktu, jenis (`stok_awal`, `penjualan`, `pembatalan`, `penyesuaian`), jumlah perubahan, stok sebelum, stok sesudah, alasan, pelaku, dan kode pesanan bila terkait. Riwayat dapat difilter berdasarkan jenis dan tanggal serta memakai pagination.
- **Efek pesanan:** stok dikurangi saat pesanan dibuat oleh pelanggan, bukan saat pesanan diproses. Jika pesanan dibatalkan, stok dikembalikan tepat satu kali. Jika pesanan selesai, stok tidak berubah lagi.
- **Ambang stok menipis:** setiap produk memiliki `minStock` dengan default 5. Notifikasi stok menipis dibuat sekali saat stok melewati ambang ke bawah, dan dapat muncul lagi setelah stok naik di atas ambang lalu turun kembali.
- **Kasus tepi:** penyesuaian dan pembuatan pesanan yang bersamaan memakai transaksi dan pengecekan stok agar tidak menghasilkan stok negatif. Pembatalan pesanan yang sudah dibatalkan tidak mengembalikan stok dua kali. Saat toko `nonaktif`, penyesuaian stok tidak diizinkan.

### O7 Manajemen pesanan

- **Deskripsi:** antrean pesanan toko dan tempat pemilik atau staf mengubah status pesanan.
- **Daftar pesanan:** kolom kode pesanan, waktu, nama pelanggan, jumlah item, total, status, dan aksi. Tersedia filter status, rentang tanggal, pencarian kode atau nama pelanggan, dan pagination 10 baris. Pesanan terbaru tampil di atas.
- **Detail pesanan:** nama, nomor HP, alamat, dan catatan pelanggan; daftar item berisi nama produk, jumlah, harga satuan, dan subtotal; total; riwayat perubahan status; serta tombol aksi sesuai status.
- **Transisi status:** `pending` menjadi `diproses`; `diproses` menjadi `selesai`; `pending` atau `diproses` menjadi `dibatalkan`. Pemilik atau staf tidak boleh melompati status, mengubah item, atau mengubah total.
- **Pembatalan:** wajib mengisi alasan 10 sampai 300 karakter. Stok dikembalikan dan tidak ada pemasukan yang dicatat. Pembatalan oleh pelanggan mengikuti PRD pelanggan; pemilik menerima notifikasi dan melihat alasan yang tersedia.
- **Penyelesaian:** saat status menjadi `selesai`, sistem mencatat waktu selesai dan membuat satu entri pemasukan otomatis sebesar total pesanan.
- **Kasus tepi:** aksi pada pesanan yang sudah `selesai` atau `dibatalkan` mendapat 409. Klik ganda ditahan oleh status loading dan pengecekan status di backend. Setelah pesanan selesai, pembatalan dan pengembalian dana tidak tersedia. Pemilik dan staf melihat kontak pelanggan lengkap hanya untuk pesanan tokonya.

### O8 Pencatatan keuangan

- **Deskripsi:** pembukuan sederhana berbasis kas untuk melihat pemasukan, pengeluaran, dan laba usaha.
- **Ringkasan:** total pemasukan, total pengeluaran, dan laba bersih untuk periode yang dipilih, dengan pilihan cepat Hari ini, 7 hari, 30 hari, dan rentang tanggal khusus.
- **Pemasukan otomatis:** dibuat saat pesanan berubah menjadi `selesai`. Nominalnya sama dengan total pesanan, kategori "Penjualan", deskripsi berisi kode pesanan, dan sumbernya `ORDER`. Entri ini tidak dapat diedit atau dihapus.
- **Pengeluaran manual:** pemilik mengisi tanggal (tidak boleh di masa depan), kategori (Bahan Baku, Operasional, Gaji, Sewa, Transportasi, atau Lainnya), deskripsi (3 sampai 200 karakter), dan nominal (bilangan bulat rupiah lebih dari 0). Pengeluaran manual dapat diedit dan dihapus.
- **Daftar transaksi:** kolom tanggal, jenis, kategori, deskripsi, nominal, sumber, dan aksi. Tersedia filter jenis, rentang tanggal, pencarian deskripsi, dan pagination.
- **Aturan hitung:** pembukuan memakai basis kas. Pemasukan diakui saat pesanan selesai, pengeluaran diakui pada tanggal yang diisi. Semua nominal dalam rupiah tanpa desimal dan tanggal memakai WIB.
- **Kasus tepi:** laba negatif ditampilkan dengan warna peringatan, bukan error. Periode tanpa data menampilkan 0 dan pesan kosong. Penghapusan pengeluaran langsung memperbarui ringkasan. Tidak ada pemasukan manual pada versi ini; pemasukan hanya berasal dari pesanan.

### O9 Manajemen staf

- **Deskripsi:** pemilik dapat menambah staf/kasir dengan akses terbatas untuk membantu operasional.
- **Daftar staf:** nama, email, status akun, tanggal dibuat, dan aksi. Menampilkan jumlah staf aktif dari batas maksimal 5.
- **Tambah staf:** nama (2 sampai 100 karakter), email (wajib, unik), password (minimal 8 karakter), dan konfirmasi password. Sistem membuat akun role `STAFF` yang terhubung ke toko pemilik.
- **Ubah staf:** pemilik dapat mengubah nama dan mereset password staf. Email staf tidak dapat diubah pada versi ini.
- **Nonaktifkan dan aktifkan:** staf nonaktif tidak dapat login, tetapi riwayat pesanan dan stok yang pernah ia proses tetap tersimpan. Staf tidak dihapus permanen agar jejak operasional tidak hilang. Mengaktifkan kembali hanya boleh jika jumlah staf aktif masih di bawah 5.
- **Hak akses staf:** memproses pesanan, menyesuaikan stok, melihat produk dan kategori, serta menerima notifikasi pesanan baru. Staf tidak dapat melihat keuangan, laporan, ekspor, profil toko, atau mengelola produk dan staf.
- **Status toko:** staf hanya dapat dibuat dan dikelola saat toko `aktif`. Saat toko `nonaktif`, staf dapat login dan melihat data, tetapi tidak dapat memproses pesanan; penyelesaian pesanan yang sudah ada dilakukan oleh pemilik.
- **Kasus tepi:** email duplikat mendapat 409. Penambahan staf saat jumlah aktif sudah 5 mendapat 409. Staf yang mencoba endpoint pemilik mendapat 403. Staf yang mencoba endpoint keuangan mendapat 403.

### O10 Notifikasi dalam aplikasi

- **Deskripsi:** pemberitahuan internal agar pemilik tidak melewatkan kejadian penting.
- **Pemicu:** pesanan baru, pesanan dibatalkan pelanggan, stok menipis, toko disetujui, toko ditolak, dan toko dinonaktifkan.
- **Tampilan:** ikon lonceng di header dengan jumlah belum dibaca, daftar notifikasi, penanda sudah dibaca, dan tombol "Tandai semua dibaca". Setiap notifikasi memiliki tautan ke halaman terkait.
- **Perilaku:** frontend memeriksa notifikasi baru secara berkala (misalnya setiap 30 detik) dan saat tab kembali aktif. Tidak ada email atau WhatsApp pada versi ini.
- **Penerima:** pemilik menerima semua notifikasi usaha. Staf menerima notifikasi pesanan baru untuk tokonya.
- **Kasus tepi:** notifikasi stok menipis tidak dibuat berulang selama stok masih di bawah ambang. Jika data terkait sudah tidak ada, tautan diarahkan ke halaman daftar yang sesuai. Notifikasi lama tidak menghalangi operasional dan dapat ditandai dibaca sekaligus.

### O11 Laporan penjualan (Should)

- **Deskripsi:** laporan untuk mengevaluasi performa toko pada periode tertentu.
- **Filter:** 7 hari, 30 hari, atau rentang tanggal khusus. Rentang maksimal 90 hari agar query tetap ringan.
- **Data yang ditampilkan:** jumlah pesanan, jumlah pesanan selesai, omzet dari pesanan selesai, rata-rata nilai pesanan selesai, grafik penjualan harian, lima produk terlaris, dan komposisi status pesanan.
- **Aturan:** omzet hanya dari pesanan `selesai`; pesanan `dibatalkan` tidak dihitung. Produk terlaris dihitung berdasarkan jumlah item terjual. Semua tanggal memakai WIB.
- **Interaksi:** mengubah filter memuat ulang kartu dan grafik. Tombol "Ekspor CSV" membuka O12. Halaman ini hanya dapat diakses pemilik.
- **Kasus tepi:** periode tanpa penjualan menampilkan 0 dan pesan kosong. Rentang tanggal terbalik atau lebih dari 90 hari ditolak dengan 400. Jika data sangat besar, tampilkan peringatan untuk mempersempit rentang.

### O12 Ekspor CSV (Could)

- **Deskripsi:** mengunduh data penjualan atau keuangan dalam format CSV untuk diolah di spreadsheet.
- **Jenis ekspor:** pesanan penjualan dan entri keuangan.
- **Kolom pesanan:** kode pesanan, tanggal, nama pelanggan, status, jumlah item, dan total. Nomor HP dan alamat tidak disertakan agar data pribadi tidak menyebar.
- **Kolom keuangan:** tanggal, jenis, kategori, deskripsi, nominal, dan sumber.
- **Format:** CSV UTF-8 dengan BOM agar karakter Indonesia tampil benar di Excel, pemisah koma, nominal berupa angka tanpa format Rupiah.
- **Batasan:** maksimal 90 hari dan 5.000 baris per ekspor. Jika melebihi, pengguna diminta mempersempit rentang.
- **Kasus tepi:** periode tanpa data menghasilkan file dengan baris header saja. Rentang tidak valid mendapat 400. Ekspor hanya untuk pemilik; staf mendapat 403.

### O13 Pratinjau storefront (Could)

- **Deskripsi:** pemilik dapat melihat tampilan tokonya seperti yang akan dilihat pelanggan, bahkan sebelum toko aktif.
- **Akses:** tombol "Pratinjau Toko" di dashboard dan profil toko. Hanya pemilik yang dapat membuka pratinjau tokonya sendiri.
- **Tampilan:** banner "Pratinjau — toko belum tayang" beserta status toko, katalog produk aktif, harga, dan label stok. Checkout dinonaktifkan.
- **Aturan:** pratinjau memakai data toko sendiri dan tidak dapat dibagikan sebagai tautan publik. Storefront publik tetap hanya menampilkan toko `aktif`.
- **Kasus tepi:** toko tanpa produk menampilkan pesan kosong yang ramah. Produk nonaktif dan stok habis tetap mengikuti aturan tampilan storefront.

## 7. Aturan bisnis dan status

### 7.1 Aturan bisnis

1. Satu pemilik hanya memiliki satu toko. Email pemilik unik dan tidak dapat dipakai akun lain.
2. Status toko hanya dapat diubah admin. Pemilik tidak dapat menyetujui, menolak, atau mengaktifkan tokonya sendiri.
3. Status toko ada empat: `pending`, `aktif`, `ditolak`, dan `nonaktif`. Toko baru otomatis `pending`.
4. Saat `pending`, profil toko hanya dapat dibaca. Saat `ditolak`, profil dapat diperbaiki dan diajukan ulang tanpa batas. Saat `aktif`, profil dapat diubah tanpa verifikasi ulang. Saat `nonaktif`, profil hanya dapat dibaca.
5. Produk dapat dikelola saat toko `pending`, `ditolak`, dan `aktif`. Saat `nonaktif`, data hanya dapat dibaca.
6. Storefront publik dan penerimaan pesanan baru hanya tersedia saat toko `aktif`.
7. NIB dan foto usaha bersifat opsional. UMKM tanpa NIB tetap dapat mendaftar dan diverifikasi.
8. Stok dikurangi saat pesanan dibuat, bukan saat diproses. Stok dikembalikan tepat satu kali saat pesanan dibatalkan. Stok tidak boleh negatif.
9. Pesanan `selesai` membuat satu entri pemasukan otomatis. Pesanan `dibatalkan` tidak membuat pemasukan.
10. Setelah pesanan `selesai`, pembatalan dan pengembalian dana tidak tersedia.
11. Transisi status pesanan hanya yang tercantum di bagian 7.2. Transisi lain ditolak dengan 409.
12. Pembatalan oleh pemilik atau staf wajib disertai alasan 10 sampai 300 karakter.
13. Produk hanya boleh dihapus permanen jika belum pernah dipakai di pesanan. Jika sudah, produk hanya boleh dinonaktifkan.
14. Item pesanan menyimpan nama dan harga produk saat pesanan dibuat. Perubahan harga produk tidak mengubah pesanan lama.
15. Jumlah staf aktif maksimal 5. Staf hanya memiliki akses pesanan, penyesuaian stok, dan lihat produk.
16. Keuangan memakai basis kas, nominal rupiah tanpa desimal, dan tanggal WIB. Pemasukan otomatis tidak dapat diubah; pengeluaran manual dapat diubah atau dihapus.
17. Pemilik dan staf hanya dapat melihat kontak pelanggan untuk pesanan tokonya. Admin hanya melihat nama pelanggan.
18. Semua endpoint pemilik memerlukan role `OWNER`. Semua endpoint staf memerlukan role `STAFF`. `shopId` selalu diambil dari token, bukan dari input klien.
19. Registrasi, pengajuan ulang, perubahan status pesanan, penyesuaian stok, pembuatan pemasukan, dan penambahan staf memakai transaksi database.
20. Notifikasi hanya tersedia di dalam aplikasi. Token JWT berlaku 8 jam dan login dibatasi 10 percobaan per menit per alamat IP.

### 7.2 Transisi status pesanan

| Dari | Ke | Pemicu | Syarat |
| --- | --- | --- | --- |
| (baru) | pending | Pelanggan menyelesaikan checkout | Stok cukup saat pesanan dibuat |
| pending | diproses | Pemilik atau staf | Tidak ada |
| pending | dibatalkan | Pemilik, staf, atau pelanggan | Alasan wajib untuk pemilik atau staf |
| diproses | selesai | Pemilik atau staf | Tidak ada |
| diproses | dibatalkan | Pemilik atau staf | Alasan wajib |

Transisi selain yang tercantum ditolak dengan kode 409. Status `selesai` dan `dibatalkan` bersifat final.

### 7.3 Status toko dari sudut pandang pemilik

| Status toko | Yang dapat dilakukan pemilik | Storefront | Pesanan baru | Aksi utama |
| --- | --- | --- | --- | --- |
| `pending` | Login, melihat dashboard, mengelola produk, melihat profil dan status | Tidak tayang | Tidak ada | Menunggu verifikasi admin |
| `ditolak` | Login, mengelola produk, memperbaiki profil, mengajukan ulang | Tidak tayang | Tidak ada | Perbaiki data dan ajukan ulang |
| `aktif` | Semua fitur operasional | Tayang | Diterima | Jalankan operasional harian |
| `nonaktif` | Login, melihat data, menyelesaikan pesanan yang sudah ada | Tidak tayang | Ditolak | Menunggu admin mengaktifkan kembali |

## 8. Alur utama

### 8.1 Registrasi dan verifikasi toko

1. Pemilik membuka halaman registrasi dan mengisi data akun serta data toko.
2. Sistem membuat akun role `OWNER` dan toko berstatus `pending`.
3. Pemilik otomatis masuk dan melihat dashboard mode onboarding.
4. Admin meninjau toko dan memutuskan setuju atau tolak.
5. Jika disetujui, status toko menjadi `aktif` dan storefront tayang. Jika ditolak, alasan terlihat di profil toko.

### 8.2 Menyiapkan produk sebelum toko aktif

1. Pemilik membuka halaman produk saat toko masih `pending` atau `ditolak`.
2. Pemilik menambah produk, memilih kategori, mengisi harga, stok awal, dan ambang stok menipis.
3. Produk tersimpan dan terlihat di panel pemilik, tetapi belum tayang di storefront publik.
4. Setelah toko aktif, produk aktif langsung dapat dilihat dan dipesan pelanggan.

### 8.3 Memproses pesanan sampai selesai

1. Pelanggan membuat pesanan; stok produk berkurang dan pesanan berstatus `pending`.
2. Pemilik atau staf menerima notifikasi dan membuka detail pesanan.
3. Pemilik atau staf menekan "Proses" sehingga status menjadi `diproses`.
4. Setelah barang diserahkan dan pembayaran diselesaikan di luar sistem, pemilik atau staf menekan "Selesaikan".
5. Status menjadi `selesai` dan satu entri pemasukan otomatis dibuat.

### 8.4 Membatalkan pesanan dan mengembalikan stok

1. Pemilik atau staf membuka pesanan berstatus `pending` atau `diproses`.
2. Pemilik atau staf menekan "Batalkan" dan mengisi alasan 10 sampai 300 karakter.
3. Sistem mengubah status menjadi `dibatalkan` dan mengembalikan stok tepat satu kali.
4. Tidak ada pemasukan yang dicatat. Riwayat status mencatat pelaku, alasan, dan waktu.

### 8.5 Mencatat pengeluaran dan melihat laba

1. Pemilik membuka halaman keuangan.
2. Pemilik menekan "Tambah Pengeluaran" dan mengisi tanggal, kategori, deskripsi, serta nominal.
3. Sistem menyimpan pengeluaran dan memperbarui total pengeluaran serta laba bersih.
4. Pemilik dapat mengedit atau menghapus pengeluaran manual; pemasukan dari pesanan tetap tidak berubah.

### 8.6 Menambah staf dan membatasi akses

1. Pemilik membuka halaman staf saat toko aktif.
2. Pemilik menekan "Tambah Staf" dan mengisi nama, email, serta password.
3. Sistem membuat akun role `STAFF` yang terhubung ke toko.
4. Staf dapat login untuk memproses pesanan dan menyesuaikan stok, tetapi tidak dapat membuka keuangan atau pengaturan toko.

### 8.7 Pengajuan ulang setelah ditolak

1. Pemilik melihat status `ditolak` dan alasan penolakan di dashboard serta profil toko.
2. Pemilik memperbaiki data yang diminta.
3. Pemilik menekan "Ajukan Ulang" dan mengonfirmasi.
4. Status kembali `pending`, riwayat penolakan tetap tersimpan, dan toko masuk lagi ke daftar verifikasi admin.

## 9. Spesifikasi halaman UI

Panel pemilik terdiri dari halaman registrasi, login, dashboard, profil toko, produk dan stok, pesanan, keuangan, staf, notifikasi, laporan, dan pratinjau toko. Halaman laporan dan pratinjau dapat ditunda sesuai prioritas.

**Ketentuan umum semua halaman:**

- **Layout:** sidebar kiri berisi menu Dashboard, Produk, Pesanan, Keuangan, Staf, dan Laporan; header atas berisi nama toko, badge status, lonceng notifikasi, nama pemilik, dan tombol logout; area konten di kanan.
- **Mobile:** sidebar berubah menjadi menu geser atau navigasi bawah. Tabel berubah menjadi kartu atau dapat digeser horizontal. Aksi utama tetap terjangkau dengan satu tangan.
- **Banner status:** toko `pending`, `ditolak`, atau `nonaktif` menampilkan banner di atas konten dengan alasan dan tindakan yang relevan.
- **State tampilan:** setiap halaman memiliki state loading (kerangka atau spinner), kosong (pesan dan ajakan aksi), dan error (pesan jelas dengan tombol Coba lagi).
- **Umpan balik:** setiap aksi ubah data menampilkan toast sukses atau gagal. Aksi berisiko (batalkan pesanan, hapus produk, nonaktifkan staf) selalu melewati dialog konfirmasi.
- **Format:** nominal ditampilkan sebagai Rupiah, tanggal dan waktu memakai WIB, dan label form selalu terlihat.
- **Proteksi rute:** halaman pemilik hanya dapat dibuka dengan token role `OWNER` yang valid. Tanpa token, pengguna dialihkan ke login.

### 9.1 Registrasi pemilik

**Tujuan:** memungkinkan calon pemilik membuat akun dan mengajukan toko tanpa bantuan admin.

**Komponen dan fitur:**

1. Form terbagi menjadi dua bagian: Data Akun dan Data Toko.
2. Data Akun: nama pemilik, email, nomor HP, password, dan konfirmasi password.
3. Data Toko: nama toko, deskripsi, alamat, NIB opsional, dan unggah foto usaha opsional dengan pratinjau.
4. Validasi langsung di bawah kolom, termasuk kekuatan password dan kecocokan konfirmasi.
5. Tombol tampilkan atau sembunyikan password.
6. Tombol "Daftar" berstatus loading dan nonaktif saat permintaan berjalan.
7. Tautan ke halaman login untuk pengguna yang sudah punya akun.
8. Setelah berhasil, pengguna diarahkan ke dashboard mode onboarding dengan pesan bahwa toko menunggu verifikasi.

**Perilaku:** jika email sudah terdaftar, pesan 409 ditampilkan di bawah kolom email. Jika unggah foto gagal, pengguna dapat mengirim ulang tanpa foto.

### 9.2 Login pemilik

**Tujuan:** pintu masuk aman ke panel usaha.

**Komponen dan fitur:**

1. Form email dan password dengan validasi format email dan kolom wajib.
2. Tombol tampilkan atau sembunyikan password.
3. Tombol Masuk berstatus loading dan nonaktif saat permintaan berjalan.
4. Pesan error di atas form: "Email atau password salah", "Akun dinonaktifkan", atau "Terlalu banyak percobaan, coba lagi nanti".
5. Redirect ke dashboard setelah login berhasil, dan ke login jika sesi berakhir.
6. Pengguna yang sudah login dan membuka halaman login langsung diarahkan ke dashboard.
7. Identitas visual Ratis agar konsisten dengan aplikasi.

**Perilaku:** tekan Enter untuk mengirim form. Fokus awal pada kolom email. Pesan error hilang saat pengguna mulai mengetik ulang. Pemilik dengan toko `pending`, `ditolak`, atau `nonaktif` tetap diarahkan ke dashboard dengan banner status.

### 9.3 Dashboard

**Tujuan:** memberi gambaran kondisi usaha dalam sekali lihat dan mengarahkan pemilik ke pekerjaan mendesak.

**Komponen dan fitur:**

1. Banner status toko bila tidak `aktif`, berisi alasan dan tombol tindakan yang sesuai.
2. Kartu omzet hari ini, omzet bulan ini, pesanan perlu diproses, produk aktif, dan stok menipis.
3. Grafik tren omzet atau pesanan dengan pilihan 7 atau 30 hari.
4. Daftar lima produk terlaris pada rentang terpilih.
5. Daftar lima pesanan terbaru dengan tombol pintas ke detail.
6. Tombol "Tambah Produk" dan "Lihat Pesanan" sebagai aksi cepat.
7. Waktu pembaruan data terakhir dan tombol Muat ulang.

**Perilaku:** mengganti rentang hanya memuat ulang grafik dan daftar produk terlaris. Kartu dapat diklik menuju daftar yang sudah terfilter. Saat toko `pending` atau `ditolak`, tampilkan checklist persiapan dan sembunyikan angka penjualan yang belum relevan.

**State khusus:** saat backend gratis sedang bangun, tampilkan kerangka loading dan teks "Menyiapkan data, mohon tunggu".

### 9.4 Profil toko

**Tujuan:** tempat pemilik melihat identitas toko, status verifikasi, dan alasan dari admin.

**Komponen dan fitur:**

1. Kartu status toko dengan badge warna, alasan status, dan tanggal perubahan.
2. Data toko: nama, `slug`, deskripsi, nomor HP, alamat, NIB, dan foto usaha.
3. Tombol Edit untuk status `aktif` dan `ditolak`; tombol Ajukan Ulang untuk status `ditolak`.
4. Form edit dengan validasi yang sama seperti registrasi dan pratinjau foto.
5. Riwayat status toko berbentuk timeline berisi status lama, status baru, alasan, pelaku, dan waktu.
6. Tombol Pratinjau Toko bila fitur O13 dikerjakan.
7. Keterangan bahwa perubahan pada toko aktif tidak memerlukan verifikasi ulang.

**Perilaku:** saat `pending` atau `nonaktif`, form edit tidak tersedia dan alasannya dijelaskan. Setelah pengajuan ulang sukses, halaman menampilkan status `pending` dan tombol edit dinonaktifkan.

### 9.5 Produk dan stok

**Tujuan:** mengelola katalog dan menjaga stok tetap akurat.

**Tampilan daftar:**

1. Tombol Tambah Produk di atas tabel.
2. Pencarian nama, filter kategori, filter status, dan filter stok menipis.
3. Tabel atau kartu berisi foto, nama, kategori, harga, stok, status, dan aksi.
4. Badge "Stok menipis" dan "Stok habis" agar mudah dipindai.
5. Pagination 10 baris dan penunjuk total produk.
6. Menu aksi: Lihat detail, Edit, Nonaktifkan atau Aktifkan, Hapus, dan Sesuaikan Stok.

**Form produk:**

1. Nama, kategori, harga, stok awal, `minStock`, deskripsi, dan foto.
2. Validasi harga lebih dari 0, stok tidak negatif, dan kategori harus aktif.
3. Saat mengedit, kolom stok tidak ditampilkan; arahkan pengguna ke penyesuaian stok.
4. Dialog konfirmasi untuk menonaktifkan atau menghapus produk.

**Stok:**

1. Modal penyesuaian berisi jenis Tambah atau Kurangi, jumlah, alasan, dan catatan opsional.
2. Panel riwayat stok per produk berisi waktu, jenis, perubahan, stok sebelum dan sesudah, alasan, pelaku, dan kode pesanan.
3. Filter jenis dan tanggal pada riwayat stok.

**Perilaku:** setelah stok berubah, angka pada tabel dan dashboard ikut diperbarui. Jika produk sudah pernah dipesan, tombol hapus dinonaktifkan dengan keterangan agar produk dinonaktifkan.

### 9.6 Pesanan

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

**Perilaku:** setelah aksi sukses, status pada daftar dan detail langsung berubah tanpa memuat ulang halaman. Jika terjadi konflik status (409), tampilkan pesan bahwa data sudah berubah lalu muat ulang detail. Tidak ada tombol untuk mengubah item atau total.

### 9.7 Keuangan

**Tujuan:** menampilkan pemasukan, pengeluaran, dan laba usaha secara sederhana.

**Komponen dan fitur:**

1. Tiga kartu ringkasan: pemasukan, pengeluaran, dan laba bersih.
2. Filter periode: Hari ini, 7 hari, 30 hari, dan rentang tanggal khusus.
3. Tabel transaksi berisi tanggal, jenis, kategori, deskripsi, nominal, sumber, dan aksi.
4. Badge "Otomatis" untuk pemasukan dari pesanan dan "Manual" untuk pengeluaran.
5. Tombol Tambah Pengeluaran yang membuka modal berisi tanggal, kategori, deskripsi, dan nominal.
6. Tombol Edit dan Hapus hanya untuk pengeluaran manual.
7. Pencarian deskripsi dan pagination 10 baris.

**Perilaku:** entri otomatis tidak memiliki tombol edit atau hapus dan menampilkan keterangan bahwa datanya berasal dari pesanan selesai. Setelah pengeluaran ditambah, diedit, atau dihapus, kartu ringkasan langsung diperbarui.

### 9.8 Staf

**Tujuan:** mengelola akses staf tanpa memberikan seluruh kendali toko.

**Komponen dan fitur:**

1. Indikator jumlah staf aktif dari maksimal 5.
2. Tabel staf berisi nama, email, status, tanggal dibuat, dan aksi.
3. Tombol Tambah Staf yang membuka modal nama, email, password, dan konfirmasi password.
4. Tombol Ubah untuk mengganti nama atau mereset password.
5. Tombol Nonaktifkan atau Aktifkan dengan dialog konfirmasi.
6. Penjelasan singkat hak akses staf di atas tabel.
7. State read-only saat toko `nonaktif`.

**Perilaku:** tombol Tambah Staf dinonaktifkan saat jumlah staf aktif sudah 5, dengan keterangan batas. Email duplikat ditampilkan sebagai error di bawah kolom email. Staf tidak memiliki tombol hapus permanen.

### 9.9 Notifikasi

**Tujuan:** memberi tahu pemilik tentang kejadian penting tanpa meninggalkan aplikasi.

**Komponen dan fitur:**

1. Ikon lonceng di header dengan badge jumlah belum dibaca.
2. Dropdown berisi lima notifikasi terbaru dan tautan "Lihat semua".
3. Halaman notifikasi berisi daftar lengkap, filter belum dibaca, dan tombol Tandai semua dibaca.
4. Setiap item menampilkan judul, pesan singkat, waktu, dan status baca.
5. Tautan ke pesanan, produk, atau profil toko terkait.

**Perilaku:** notifikasi baru muncul tanpa memuat ulang halaman. Menandai satu notifikasi sebagai dibaca mengurangi badge. Jika data terkait sudah tidak ada, pengguna diarahkan ke daftar yang sesuai.

### 9.10 Laporan dan ekspor

**Tujuan:** membantu pemilik mengevaluasi penjualan dan mengunduh data.

**Komponen dan fitur:**

1. Filter periode 7 hari, 30 hari, dan rentang tanggal khusus.
2. Kartu jumlah pesanan, pesanan selesai, omzet, dan rata-rata nilai pesanan.
3. Grafik penjualan harian.
4. Daftar produk terlaris dan komposisi status pesanan.
5. Tombol Ekspor CSV dengan pilihan jenis data dan periode.
6. Pesan batas 90 hari dan 5.000 baris.

**Perilaku:** tombol ekspor berstatus loading saat file dibuat. Jika tidak ada data, file tetap dapat diunduh dengan header saja. Staf tidak dapat membuka halaman ini.

### 9.11 Pratinjau storefront

**Tujuan:** memberi gambaran nyata tampilan toko sebelum atau sesudah aktif.

**Komponen dan fitur:**

1. Banner "Pratinjau — toko belum tayang" untuk toko yang belum aktif.
2. Tampilan storefront memakai komponen yang sama dengan halaman publik.
3. Katalog hanya menampilkan produk aktif.
4. Label stok habis dan tombol checkout dinonaktifkan.
5. Tombol Kembali ke dashboard.

**Perilaku:** pratinjau tidak dapat dibagikan sebagai tautan publik. Storefront publik tetap hanya dapat diakses untuk toko `aktif`.

## 10. Kriteria penerimaan dan skenario uji

Fitur dianggap selesai jika seluruh skenario Must di bawah lulus pada **versi yang sudah di-hosting**, bukan hanya di komputer lokal.

| ID | Fitur | Skenario | Hasil yang diharapkan |
| --- | --- | --- | --- |
| T1 | O1 | Registrasi dengan data valid | Toko berstatus `pending`, pemilik otomatis masuk ke dashboard |
| T2 | O1 | Registrasi dengan email yang sudah terdaftar | Respons 409, akun baru tidak dibuat |
| T3 | O1 | Registrasi dengan NIB kosong | Berhasil, NIB tersimpan kosong |
| T4 | O1 | Registrasi dengan NIB bukan 13 digit | Ditolak validasi (400), data tidak tersimpan |
| T5 | O2 | Login pemilik dengan data benar | Masuk ke dashboard, token tersimpan |
| T6 | O2 | Login dengan password salah | Pesan "Email atau password salah", tidak masuk |
| T7 | O2 | Login dengan akun nonaktif | Pesan akun dinonaktifkan, tidak masuk |
| T8 | O2 | Token pemilik dipakai ke endpoint admin | Respons 403 |
| T9 | O2 | Token pemilik toko A membuka data toko B | Respons 403 atau 404, data toko B tidak bocor |
| T10 | O3 | Membuka dashboard dengan data seeding | Semua angka sama dengan hasil query database |
| T11 | O3 | Mengganti rentang dari 7 ke 30 hari | Grafik dan produk terlaris ikut berubah |
| T12 | O4 | Mengubah profil saat toko `pending` | Ditolak (409), data tidak berubah |
| T13 | O4 | Memperbaiki profil dan mengajukan ulang saat `ditolak` | Status kembali `pending`, riwayat penolakan tetap ada |
| T14 | O4 | Mengubah profil saat toko `aktif` | Tersimpan, status tetap `aktif` |
| T15 | O5 | Menambah produk dengan data valid | Produk muncul di daftar dan siap tampil saat toko aktif |
| T16 | O5 | Menambah produk dengan harga 0 atau stok negatif | Ditolak validasi (400) |
| T17 | O5 | Menonaktifkan produk | Produk hilang dari storefront, pesanan lama tetap utuh |
| T18 | O5 | Menghapus produk yang sudah pernah dipesan | Ditolak (409), disarankan menonaktifkan |
| T19 | O5 | Menghapus produk yang belum pernah dipesan | Produk terhapus dari daftar |
| T20 | O6 | Menyesuaikan stok dengan alasan | Stok berubah dan riwayat pergerakan tercatat |
| T21 | O6 | Mengurangi stok melebihi jumlah tersedia | Ditolak (400), stok tidak berubah |
| T22 | O6 | Membuat pesanan dari sisi pelanggan | Stok berkurang sesuai jumlah item |
| T23 | O6 | Membatalkan pesanan | Stok kembali tepat satu kali |
| T24 | O7 | Memproses pesanan `pending` | Status menjadi `diproses` |
| T25 | O7 | Menyelesaikan pesanan `diproses` | Status menjadi `selesai`, pemasukan otomatis dibuat |
| T26 | O7 | Membatalkan pesanan tanpa alasan | Ditolak validasi (400), status tidak berubah |
| T27 | O7 | Mengubah pesanan `selesai` menjadi `dibatalkan` | Ditolak (409), status tetap |
| T28 | O8 | Membandingkan ringkasan keuangan dengan database | Pemasukan sama dengan total pesanan selesai, pengeluaran sama dengan entri manual |
| T29 | O8 | Mencoba mengedit pemasukan otomatis | Tidak ada tombol edit dan endpoint menolak (403 atau 409) |
| T30 | O8 | Menambah, mengedit, dan menghapus pengeluaran | Ringkasan laba langsung berubah |
| T31 | O9 | Menambah staf saat jumlah aktif sudah 5 | Ditolak (409) |
| T32 | O9 | Staf membuka halaman keuangan atau profil toko | Respons 403, halaman tidak tampil |
| T33 | O9 | Staf nonaktif mencoba login | Ditolak dengan pesan akun dinonaktifkan |
| T34 | O10 | Membuat pesanan baru | Notifikasi pesanan baru muncul untuk pemilik dan staf |
| T35 | O10 | Menandai notifikasi sebagai dibaca | Badge belum dibaca berkurang |
| T36 | O11 | Membuka laporan dengan data seeding | Angka laporan sama dengan query pesanan selesai |
| T37 | O12 | Mengekspor CSV pesanan | File terunduh, header dan isi sesuai, tanpa nomor HP dan alamat |
| T38 | O13 | Membuka pratinjau toko `pending` | Pratinjau tampil dengan banner, checkout nonaktif |
| T39 | Semua | Mengakses panel pemilik lewat layar ponsel | Aksi Must tetap dapat dilakukan |
| T40 | Semua | Mengakses data toko lain dengan mengganti ID di URL | Respons 403 atau 404, data tidak tampil |

## 11. Spesifikasi API

### 11.1 Konvensi

- Endpoint pemilik berada di bawah `/owner` dan memerlukan header `Authorization: Bearer <token>` dengan role `OWNER`. Endpoint auth bersama berada di `/auth`: `POST /auth/register-owner` (publik), `POST /auth/login` (publik), dan `GET /auth/me` (perlu token).
- Endpoint staf berada di bawah `/staff` dan memerlukan role `STAFF`. Detail endpoint staf dibahas di PRD staf.
- Format respons sukses: `{ "data": ..., "meta": ... }`. Daftar memakai `meta` berisi `page`, `limit`, `total`.
- Khusus `GET /owner/reports/export`, respons berupa berkas CSV, bukan JSON.
- Format respons error: `{ "statusCode": 400, "message": "...", "errors": [...] }`.
- Kode error: 400 data tidak valid, 401 belum login atau token tidak valid, 403 role tidak diizinkan atau akun nonaktif, 404 data tidak ditemukan atau di luar cakupan toko, 409 konflik status atau data duplikat, 413 berkas terlalu besar.
- Parameter daftar umum: `page` (default 1), `limit` (default 10, maksimal 50), `q` (pencarian).
- `shopId` tidak pernah diterima dari klien. Backend mengambil `shopId` dari token agar pemilik tidak dapat mengakses toko lain.
- Semua nominal memakai bilangan bulat rupiah. Semua tanggal pada filter dan respons memakai WIB.

### 11.2 Daftar endpoint

| Metode | Path | Fungsi | Request utama | Respons sukses | Error |
| --- | --- | --- | --- | --- | --- |
| POST | `/auth/register-owner` | Registrasi pemilik dan toko | body: data akun dan toko | 201: user, shop, accessToken | 400, 409, 413 |
| POST | `/auth/login` | Login pemilik atau staf | body: email, password | 200: accessToken, user, shop | 400, 401, 403 |
| GET | `/auth/me` | Data pengguna yang login | header token | 200: user, shop | 401 |
| GET | `/owner/dashboard` | Statistik usaha | query: range (7 atau 30) | 200: status, omzet, pesanan, stok, tren, produk terlaris, pesanan terbaru | 401, 403 |
| GET | `/owner/shop` | Profil dan status toko | tidak ada | 200: profil, status, riwayat | 401, 403 |
| PATCH | `/owner/shop` | Ubah profil toko | body: name, description, phone, address, nib, photoUrl | 200: profil terbaru | 400, 403, 409 |
| POST | `/owner/shop/resubmit` | Ajukan ulang setelah ditolak | tidak ada | 200: toko berstatus `pending` | 400, 403, 409 |
| GET | `/owner/categories` | Kategori aktif untuk produk | tidak ada | 200: daftar kategori | 401, 403 |
| GET | `/owner/products` | Daftar produk | query: q, categoryId, isActive, lowStock, page, limit | 200: daftar dan meta | 401, 403 |
| POST | `/owner/products` | Tambah produk | body: name, categoryId, price, stock, minStock, description, imageUrl | 201: produk | 400, 403, 409 |
| GET | `/owner/products/:id` | Detail produk | path: id | 200: produk | 404 |
| PATCH | `/owner/products/:id` | Ubah produk | body: name, categoryId, price, minStock, description, imageUrl | 200: produk | 400, 404, 409 |
| DELETE | `/owner/products/:id` | Hapus produk | path: id | 204 | 404, 409 |
| PATCH | `/owner/products/:id/status` | Aktifkan atau nonaktifkan produk | body: isActive | 200: produk | 404, 409 |
| POST | `/owner/products/:id/stock-adjustments` | Sesuaikan stok | body: quantityDelta, reason, note | 201: stok dan riwayat | 400, 404, 409 |
| GET | `/owner/products/:id/stock-movements` | Riwayat stok produk | query: type, from, to, page, limit | 200: daftar dan meta | 404 |
| GET | `/owner/orders` | Daftar pesanan toko | query: status, q, from, to, page, limit | 200: daftar dan meta | 401, 403 |
| GET | `/owner/orders/:id` | Detail pesanan | path: id | 200: pesanan, item, riwayat | 404 |
| PATCH | `/owner/orders/:id/status` | Ubah status pesanan | body: status, reason | 200: pesanan terbaru | 400, 404, 409 |
| GET | `/owner/finance/summary` | Ringkasan keuangan | query: from, to | 200: pemasukan, pengeluaran, laba | 400, 403 |
| GET | `/owner/finance/entries` | Daftar transaksi keuangan | query: type, from, to, q, page, limit | 200: daftar dan meta | 400, 403 |
| POST | `/owner/finance/expenses` | Tambah pengeluaran | body: occurredAt, category, description, amount | 201: entri pengeluaran | 400, 403 |
| PATCH | `/owner/finance/expenses/:id` | Ubah pengeluaran | body: occurredAt, category, description, amount | 200: entri pengeluaran | 400, 403, 404 |
| DELETE | `/owner/finance/expenses/:id` | Hapus pengeluaran | path: id | 204 | 403, 404, 409 |
| GET | `/owner/staff` | Daftar staf | query: isActive, q, page, limit | 200: daftar, meta, jumlah aktif | 403 |
| POST | `/owner/staff` | Tambah staf | body: name, email, password | 201: staf | 400, 403, 409 |
| PATCH | `/owner/staff/:id` | Ubah nama atau reset password | body: name, password | 200: staf | 400, 403, 404 |
| PATCH | `/owner/staff/:id/status` | Aktifkan atau nonaktifkan staf | body: isActive | 200: staf | 403, 404, 409 |
| GET | `/owner/notifications` | Daftar notifikasi | query: unreadOnly, page, limit | 200: daftar dan meta | 401 |
| PATCH | `/owner/notifications/:id/read` | Tandai satu notifikasi dibaca | path: id | 200: notifikasi | 404 |
| PATCH | `/owner/notifications/read-all` | Tandai semua dibaca | tidak ada | 200: jumlah diperbarui | 401 |
| GET | `/owner/reports/sales` | Laporan penjualan | query: from, to | 200: ringkasan, grafik, produk terlaris | 400, 403 |
| GET | `/owner/reports/export` | Ekspor CSV (Could) | query: type, from, to | 200: text/csv | 400, 403 |
| GET | `/owner/storefront-preview` | Pratinjau storefront (Could) | tidak ada | 200: toko dan produk aktif | 403 |

## 12. Model data yang dipakai pemilik

Berikut tabel dan kolom yang disentuh fitur pemilik (usulan awal untuk skema Prisma; dirapikan lebih lanjut saat membuat ERD). Model ini melengkapi model pada PRD admin.

| Tabel | Kolom utama | Dipakai untuk |
| --- | --- | --- |
| `users` | id, name, email, passwordHash, role (OWNER, STAFF; role lain mengikuti PRD admin), isActive, shopId (nullable, untuk staf), createdAt | Registrasi, login, dan manajemen staf |
| `shops` | id, ownerId, name, slug, description, phone, address, nib (opsional), photoUrl (opsional), status (pending, aktif, ditolak, nonaktif), statusReason, verifiedById, verifiedAt, createdAt, updatedAt | Profil dan status toko |
| `shop_status_histories` | id, shopId, fromStatus, toStatus, reason, changedById, createdAt | Riwayat status toko |
| `categories` | id, name, slug, isActive, createdAt | Pilihan kategori produk |
| `products` | id, shopId, categoryId, name, description, price, stock, minStock, imageUrl (opsional), isActive, createdAt, updatedAt | Manajemen produk |
| `stock_movements` | id, shopId, productId, type (stok_awal, penjualan, pembatalan, penyesuaian), quantityDelta, stockBefore, stockAfter, reason, orderId (nullable), actorId, createdAt | Riwayat stok |
| `orders` | id, code, shopId, customerId, customerName, customerPhone, customerAddress, note, total, status (pending, diproses, selesai, dibatalkan), cancellationReason, createdAt, completedAt, cancelledAt | Pesanan toko |
| `order_items` | id, orderId, productId, productName, quantity, unitPrice, subtotal | Detail pesanan |
| `order_status_histories` | id, orderId, fromStatus, toStatus, reason, changedById, createdAt | Riwayat status pesanan |
| `finance_entries` | id, shopId, type (INCOME, EXPENSE), source (ORDER, MANUAL), orderId (nullable), category, description, amount, occurredAt, createdById, createdAt, updatedAt | Pemasukan dan pengeluaran |
| `notifications` | id, userId, shopId, type, title, message, data (JSON), isRead, createdAt | Notifikasi dalam aplikasi |

**Catatan model:**

- `shops.ownerId` unik untuk menegakkan satu pemilik satu toko.
- `users.shopId` hanya diisi untuk staf; pemilik terhubung melalui `shops.ownerId`.
- `orders` menyimpan snapshot nama, nomor HP, dan alamat pelanggan saat pesanan dibuat agar riwayat tetap utuh.
- `finance_entries.orderId` unik untuk entri pemasukan otomatis, sehingga satu pesanan hanya menghasilkan satu pemasukan.
- `stock_movements` bersifat append-only dan tidak diedit setelah dibuat; data hanya ikut terhapus bila produk dihapus dan belum pernah dipakai di pesanan.
- `notifications.data` menyimpan tautan atau ID objek terkait untuk navigasi.

**Indeks yang disarankan:** `shops(ownerId)` unik, `shops(slug)` unik, `users(email)` unik, `users(shopId)`, `products(shopId, isActive)`, `products(shopId, stock)`, `orders(shopId, status, createdAt)`, `orders(shopId, createdAt)`, `order_items(orderId)`, `stock_movements(productId, createdAt)`, `finance_entries(shopId, occurredAt)`, `finance_entries(orderId)` unik, `notifications(userId, isRead, createdAt)`, dan `categories(isActive)`. Indeks ini menjaga daftar dan dashboard tetap cepat di database gratis.

## 13. Kebutuhan non-fungsional

| Aspek | Kebutuhan |
| --- | --- |
| Keamanan | Password disimpan dengan hash bcrypt. Token JWT berlaku 8 jam. Header keamanan lewat `helmet`. Rate limit login 10 percobaan per menit per alamat IP. CORS hanya untuk domain frontend. Semua input divalidasi DTO dengan opsi whitelist. Secret hanya di environment variable. |
| Isolasi data | Setiap query memakai `shopId` dari token, bukan dari parameter klien. Pemilik tidak dapat membaca atau mengubah data toko lain. Staf tidak dapat membuka endpoint keuangan, laporan, atau pengaturan toko. |
| Otorisasi | Pemeriksaan role dan status akun dilakukan di backend pada setiap permintaan, tidak hanya menyembunyikan menu di frontend. Aksi tulis juga memeriksa status toko. |
| Konsistensi data | Registrasi, pengajuan ulang, perubahan status pesanan, pengurangan dan pengembalian stok, pembuatan pemasukan, serta penambahan staf memakai transaksi database. |
| Performa | Dashboard dimuat kurang dari 3 detik saat backend aktif. Semua daftar memakai pagination dan query terindeks. Grafik dibatasi maksimal 90 hari. |
| Ketersediaan | Backend gratis bisa tertidur. Sediakan endpoint `GET /health` untuk ping berkala dan state loading yang jelas di frontend. |
| Berkas | Foto usaha dan foto produk opsional disimpan di penyimpanan objek (misalnya Cloudinary), maksimal 2 MB, format JPG atau PNG. Tampilkan placeholder jika foto tidak ada. |
| Kegunaan | Konfirmasi untuk aksi berisiko, pesan error berbahasa Indonesia yang jelas, dan jumlah klik sesuai target pada bagian 2. |
| Tampilan | Konsisten (warna, tipografi, spasi), responsif untuk ponsel, tablet, dan desktop, kontras teks yang cukup, serta label pada setiap kolom form. |
| Kompatibilitas | Chrome, Edge, Firefox, dan Safari versi terbaru, termasuk browser ponsel Android dan iOS. |
| Privasi | Kontak pelanggan hanya terlihat oleh pemilik dan staf toko terkait. Admin hanya melihat nama. Ekspor penjualan tidak menyertakan nomor HP dan alamat. |
| Pemeliharaan | Struktur modul NestJS terpisah (auth, shops, products, stock, orders, finance, staff, notifications, reports), dokumentasi API dengan Swagger, dan seeding yang idempoten. |

## 14. Data seeding untuk demo

Juri harus bisa mencoba semua alur pemilik tanpa menyiapkan data sendiri. Seeding mencakup:

| Data | Jumlah | Keterangan |
| --- | --- | --- |
| Akun pemilik aktif | 1 | Toko aktif dengan produk, pesanan, keuangan, dan staf |
| Akun pemilik pending | 1 | Toko pending dengan beberapa produk yang sudah disiapkan |
| Akun pemilik ditolak | 1 | Toko ditolak dengan alasan yang jelas |
| Akun pemilik nonaktif | 1 | Toko nonaktif dengan alasan dan pesanan lama |
| Akun staf | 2 | Untuk toko aktif, satu aktif dan satu nonaktif |
| Kategori | 6 | Mengikuti seeding admin |
| Produk | Sekitar 20 | Tersebar di toko aktif, pending, ditolak, dan nonaktif |
| Pesanan | Sekitar 30 | Tersebar di empat status dan 14 hari terakhir |
| Entri keuangan | Sekitar 20 | Pemasukan otomatis dari pesanan selesai dan pengeluaran manual |
| Riwayat stok | Sekitar 40 | Stok awal, penjualan, pembatalan, dan penyesuaian |
| Notifikasi | Sekitar 8 | Campuran belum dibaca dan sudah dibaca |

Sertakan minimal satu produk dengan stok menipis, satu produk dengan stok habis, satu produk yang belum pernah dipesan untuk uji hapus, dan satu produk yang sudah pernah dipesan untuk uji penolakan hapus. Sertakan pula satu pesanan `pending`, satu `diproses`, satu `selesai`, dan satu `dibatalkan`. Kredensial akun demo dicantumkan di README. Seeding dibuat idempoten dan dijalankan otomatis saat deploy awal.

## 15. Rencana pengerjaan, risiko, dan keputusan tim

### 15.1 Urutan pengerjaan yang disarankan

| Tahap | Pekerjaan | Bergantung pada |
| --- | --- | --- |
| 1 | Autentikasi, registrasi pemilik, dan profil toko (O1, O2, O4) | Skema database dan modul auth |
| 2 | Kategori dan manajemen produk (O5) | Tahap 1 dan kategori admin |
| 3 | Manajemen stok dan riwayatnya (O6) | Tahap 2 |
| 4 | Manajemen pesanan dan transisi status (O7) | Modul checkout pelanggan |
| 5 | Keuangan otomatis dan pengeluaran manual (O8) | Tahap 4 |
| 6 | Dashboard usaha (O3) | Tahap 4 dan 5 |
| 7 | Manajemen staf (O9) | Tahap 1 |
| 8 | Notifikasi dalam aplikasi (O10) | Tahap 4 dan status toko |
| 9 | Laporan dan ekspor CSV (O11, O12) | Tahap 4 dan 5 |
| 10 | Pratinjau storefront (O13, jika waktu ada) | Storefront publik |
| 11 | Uji skenario T1 sampai T40 pada versi hosting | Semua tahap |

Dashboard dan laporan sengaja dikerjakan setelah pesanan dan keuangan tersedia karena angkanya bergantung pada data tersebut.

### 15.2 Risiko dan mitigasi

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Cakupan fitur terlalu besar | Fitur Must tidak selesai | Kerjakan sesuai MoSCoW, tunda O11, O12, dan O13 lebih dulu |
| Stok tidak sinkron karena pesanan dan penyesuaian bersamaan | Stok negatif atau salah | Transaksi database, pengecekan stok, dan uji alur bersamaan |
| Pembatalan mengembalikan stok dua kali | Stok tidak akurat | Cek status pesanan dalam transaksi dan tolak aksi ulang dengan 409 |
| Data toko bocor ke pemilik lain | Masalah keamanan dan kepercayaan | Selalu ambil `shopId` dari token, uji IDOR dengan dua akun |
| Pemasukan otomatis ganda | Laporan keuangan salah | Transaksi penyelesaian pesanan dan indeks unik pada `orderId` |
| Hak akses staf hanya dijaga di frontend | Celah keamanan | Guard role di backend dan uji endpoint terlarang dengan token staf |
| Backend gratis tertidur saat juri membuka web | Halaman pertama lambat | Ping berkala ke `/health`, state loading yang jelas, catatan di README |
| Tampilan hanya nyaman di desktop | Pemilik tidak bisa memakai dari ponsel | Desain responsif dan uji aksi Must pada layar 390 px |
| Layanan penyimpanan foto bermasalah | Foto usaha atau produk tidak tampil | Foto opsional, placeholder, dan batas ukuran serta format |
| Data demo tidak mencakup semua status | Juri tidak bisa mencoba alur | Seeding sesuai bagian 14 |

### 15.3 Keputusan tim

1. **Satu pemilik satu toko.** Versi lomba tidak mendukung banyak toko per akun agar model data, navigasi, dan hak akses tetap sederhana.
2. **NIB dan foto usaha opsional.** UMKM tanpa NIB tetap dapat mendaftar dan diverifikasi. Dokumen legal lain tidak diminta.
3. **Profil saat pending dan nonaktif hanya baca.** Data yang sedang ditinjau admin tidak berubah di tengah proses, dan toko yang dinonaktifkan tidak dapat mengubah identitasnya sampai admin mengaktifkan kembali.
4. **Pengajuan ulang tidak dibatasi.** Pemilik dapat memperbaiki data dan mengajukan ulang tanpa batas; setiap pengajuan tercatat di riwayat status.
5. **Perubahan profil toko aktif tidak memerlukan verifikasi ulang.** Perubahan langsung berlaku agar pemilik tidak terganggu, sementara admin tetap dapat menonaktifkan toko bila ada masalah.
6. **Produk dapat disiapkan sebelum toko aktif.** Pemilik dapat mengelola produk saat `pending` dan `ditolak` agar tokonya siap jual saat disetujui.
7. **Stok dikurangi saat pesanan dibuat.** Pengurangan terjadi di checkout pelanggan, bukan saat pesanan diproses. Pembatalan mengembalikan stok tepat satu kali.
8. **Pemasukan dicatat saat pesanan selesai.** Pembukuan memakai basis kas. Pembatalan tidak membuat pemasukan, dan tidak ada pengembalian dana setelah pesanan selesai.
9. **Produk dengan riwayat pesanan tidak boleh dihapus permanen.** Produk hanya dinonaktifkan agar riwayat pesanan dan laporan tetap utuh.
10. **Staf dibatasi 5 akun aktif dan tidak dapat melihat keuangan.** Staf membantu pesanan dan stok, bukan mengambil keputusan usaha.
11. **Keuangan hanya memiliki pemasukan otomatis dan pengeluaran manual.** Tidak ada pemasukan manual agar angka omzet selalu dapat dilacak ke pesanan.
12. **Notifikasi hanya di dalam aplikasi.** Tidak ada email atau WhatsApp pada versi ini; frontend memakai polling sederhana.
13. **Kontak pelanggan hanya untuk toko terkait.** Pemilik dan staf memerlukan kontak untuk memproses pesanan, sedangkan admin dibatasi pada nama.
14. **Token dan rate limit mengikuti admin.** Token JWT berlaku 8 jam dan login dibatasi 10 percobaan per menit per alamat IP.
