# 🚀 Panduan Pengujian Aplikasi (Local Deployment via Docker)

Ikuti langkah-langkah di bawah ini secara berurutan untuk menjalankan dan menguji aplikasi Smart-MRI Router di lingkungan lokal (`localhost`):

### 1. Kloning Repositori Git
Buka terminal di komputer Anda, tentukan direktori kerja, lalu jalankan perintah berikut untuk mengunduh seluruh *source code*:

```bash
git clone https://github.com/amdihsann/MRI-Smart-Router.git
cd MRI-Smart-Router
```

### 2. Konfigurasi Kunci Rahasia (Berkas `.env`)
Buat sebuah file baru bernama `.env` di dalam folder *root* utama proyek (sejajar dengan file `docker-compose.yml`). Salin dan isi variabel rahasia di bawah ini sesuai dengan kredensial Azure Maps dan Database Supabase Anda:

```env
AZURE_MAPS_KEY=87bLyGbhIr31B79mANLFDEz4ZmsyATWo8AVKS3P64zmQuBT4FvZEJQQJ99CFAC8vTInQoa48AAAgAZMPz9LX
DB_USER=mri_admin
DB_PASSWORD=mri_password_secure
DB_NAME=smart_mri_db
DB_PORT=5432
```

### 3. Orkestrasi Menggunakan Docker Compose
Buka terminal terintegrasi di VS Code tepat pada direktori *root* utama proyek. Jalankan perintah Docker berikut untuk membangun kontainer *backend* dan *frontend* secara otomatis di latar belakang (*detached mode*):

```bash
docker compose up --build -d
```

> ⚠️ **Catatan Performa:** Pastikan aplikasi Docker Desktop Anda sudah menyala di latar belakang sebelum mengeksekusi perintah ini. Proses *build* awal memakan waktu sekitar 3-5 menit untuk *layering* imej Linux.

### 6. Akses dan Pengujian Aplikasi di Browser
Setelah status seluruh kontainer di Docker Desktop menunjukkan warna hijau (*Running*), buka browser Anda dan akses tautan berikut:

* **Frontend UI (Next.js 16 + Tailwind v4):** [http://localhost:3000](http://localhost:3000)
* **Backend API Docs (FastAPI Swagger UI):** [http://localhost:8000/docs](http://localhost:8000/docs)

*(Pada startup pertama, backend akan mendeteksi DB kosong dan otomatis melakukan auto-seeding 40 data RS dan 39 antrean awal dari file CSV).*

---

## Fitur Utama & Logika Optimasi

* **Time-Series Queue Forecasting:** Memanfaatkan model ARIMA (`arima_model.joblib`) untuk memprediksi pola kepadatan mesin MRI berdasarkan data historis kumulatif.
* **Auto-Seeding Engine:** Skrip otomatis pada `main.py` yang memastikan database PostgreSQL langsung terisi dataset spasial rumah sakit saat server pertama kali diinisialisasi.
* **CORS Rewrites Proxy:** Mengamankan komunikasi asinkronus antara jaringan Vercel Serverless dan Hugging Face Spaces port 7860 tanpa memicu pemblokiran kebijakan browser.
