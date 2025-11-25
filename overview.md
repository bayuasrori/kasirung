Overview Simklinik
==================

Rangkuman modul yang ada
------------------------
- Pasien: registrasi dan data master pasien (`/simklinik/pasien`).
- Tenaga medis: mapping user -> tenaga medis, peran dokter/perawat/bidan/spesialis (`/simklinik/tenaga-medis`).
- Layanan medis: daftar layanan & tarif (`/simklinik/layanan`).
- Janji temu: penjadwalan kunjungan rawat jalan, status scheduled/confirmed/completed/cancelled (`/simklinik/janji-temu`).
- Rekam medis (rawat jalan): konsultasi dengan vital sign, catatan SOAP, resep; dibuat dari janji temu atau manual (`/simklinik/rekam-medis`).
- Rawat inap: master kamar/bed, admission pasien, discharge, status bed (`/simklinik/rawat-inap`).
- Rekam medis inap: konsultasi yang terhubung ke admission (bisa lebih dari satu per pasien per admission) (`/simklinik/rekam-medis-inap`).
- Tagihan/billing: invoicing, pembayaran (belum dipetakan penuh ke alur klinik).
- Inventory: stok medis/obat (terpisah).

Alur saat ini (implisit di kode)
--------------------------------
1) Pasien daftar di master pasien.
2) Janji temu dibuat untuk pasien + tenaga medis + layanan → status dikonfirmasi.
3) Rekam medis jalan dibuat dari janji temu (atau manual) → status ongoing → update SOAP/vital → selesai (completed).
4) Rawat inap: buat kamar/bed → admit pasien ke bed → admission status admitted, bed jadi occupied.
5) Rekam medis inap: dari halaman rekam medis inap, klik “Buat Catatan” pada admission aktif → buat konsultasi terkait admission (status ongoing) → isi catatan → selesai.
6) Discharge: melalui layanan rawat inap (belum dihubungkan langsung dari rekam medis).

Masalah yang muncul
-------------------
- Konsultasi rawat inap gagal bila `appointment_id` wajib; perlu schema nullable (ditangani lewat migration).
- Tombol “Buat Catatan” bisa gagal bila user tidak terdaftar sebagai tenaga medis; UI kini memunculkan select tenaga medis dan menolak jika tidak terdaftar.
- Rekam medis jalan dan inap sudah dipisah: rekam-medis (jalan) dan rekam-medis-inap (admission).
- Billing/penagihan belum terintegrasi otomatis dari konsultasi/admission.

Saran alur yang lebih simple dan konsisten
------------------------------------------
1) Rawat Jalan (Outpatient)
   - Registrasi pasien.
   - Buat janji temu (patient + staff + layanan + waktu) → konfirmasi.
   - Mulai konsultasi langsung dari janji temu (satu janji temu = satu konsultasi).
   - Isi vital & catatan SOAP, tambah resep.
   - Selesaikan konsultasi → generate tagihan/invoice dari layanan + resep.
   - Pembayaran → close invoice.

2) Rawat Inap
   - Pastikan pasien terdaftar.
   - Admin bed: buat kamar & bed; pilih bed available → Admit pasien (buat admission dengan bed & admitBy).
   - Pencatatan medis: dari admission aktif, klik “Buat Catatan” → konsultasi terhubung ke admission (tanpa appointment).
   - Bisa buat beberapa konsultasi per admission (misal visit harian).
   - Setiap konsultasi: SOAP, vital, resep.
   - Discharge: dari modul rawat inap, discharge admission → bed status cleaning → konsultasi tidak bisa ongoing lagi.
   - Tagihan: hitung harian bed rate + tindakan/obat dari konsultasi admission → invoice → bayar → close.

3) Hak Akses Tenaga Medis
   - Semua pencatatan (jalan/inap) wajib memilih tenaga medis; default pakai staff yang login (user->medical_staff). Jika tidak ada mapping, blok dengan pesan jelas dan tautan ke halaman tenaga medis untuk mendaftarkan user tersebut.

4) Navigasi/Entry Points
   - “Rekam Medis” = hanya rawat jalan (berbasis janji temu).
   - “Rekam Medis Inap” = hanya konsultasi admission.
   - “Rawat Inap” = manajemen kamar/bed/admission (bukan pencatatan).
   - “Janji Temu” = sumber utama memulai konsultasi rawat jalan.

5) Validasi Teknis
   - Schema: `consultations.appointment_id` nullable, `admission_id` nullable; minimal salah satu wajib di service layer.
   - Saat membuat konsultasi admission: enforce `appointmentId || admissionId` dan `staffId`.
   - Tombol “Buat Catatan” kirim admissionId + patientId + staffId (default staff login; wajib mapping tenaga medis).

Langkah perbaikan cepat
-----------------------
- Terapkan migration 0006 & 0007 (admission_id + appointment_id nullable).
- Di action “create” rekam-medis-inap: wajibkan staff = user login atau pilih dari dropdown; blok jika tidak terdaftar.
- Tambah tombol “Discharge” di rawat-inap untuk menutup admission dan mengubah bed status cleaning (sudah ditambahkan).
- Integrasikan invoice rawat inap: bed rate harian + tindakan/obat dari konsultasi admission.
