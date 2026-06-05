🚀 Panduan Pengujian Aplikasi (Local Deployment via Docker)
Ikuti langkah-langkah di bawah ini secara berurutan untuk menjalankan dan menguji aplikasi Smart-MRI Router di lingkungan lokal (localhost):

1. Kloning Repositori Git
Buka terminal di komputer Anda, pilih direktori kerja, lalu jalankan perintah berikut untuk mengunduh seluruh source code proyek dari GitHub:

Bash
git clone https://github.com/amdihsann/MRI-Smart-Router.git
cd MRI-Smart-Router
2. Isolasi Lingkungan Python (Virtual Environment)
Masuk ke dalam direktori backend, lalu buat serta aktifkan Virtual Environment (venv) baru untuk mengisolasi pustaka (library) agar tidak bentrok dengan sistem global laptop Anda:

Bash
cd backend
python -m venv venv

# Aktivasi di Windows (CMD / PowerShell):
vnev\Scripts\activate

# Aktivasi di Mac / Linux:
source venv/bin/activate
3. Instalasi Dependensi Pustaka Python
Dalam kondisi virtual environment aktif, jalankan perintah pip berikut untuk menginstal seluruh pustaka Data Science dan Framework FastAPI yang tercantum di berkas kebutuhan:

Bash
pip install --no-cache-dir -r requirements.txt
cd ..
4. Konfigurasi Kunci Rahasia (.env Berkas)
Buat sebuah file baru bernama .env di dalam folder root utama proyek (sejajar dengan file docker-compose.yml). Silakan salin, tempel, dan isi variabel rahasia di bawah ini sesuai dengan kredensial Azure Maps dan Database Supabase Anda:

Cuplikan kode
# Azure Maps Configuration
NEXT_PUBLIC_AZURE_MAPS_KEY=isi_dengan_primary_key_azure_maps_anda

# Database Configuration (Supabase PostgreSQL)
DATABASE_URL=isi_dengan_string_koneksi_db_supabase_anda
5. Or some Orchestrations Menggunakan Docker Compose
Buka terminal terintegrasi di VS Code tepat pada direktori root utama proyek. Jalankan perintah Docker berikut untuk membangun kontainer backend dan frontend secara otomatis di latar belakang (detached mode):

Bash
docker compose up --build -d
Catatan Performa: Proses build pertama kali akan memakan waktu beberapa menit karena Docker sedang menyusun layering image Linux, Python Node, dan mengunduh dependensi internal.

6. Akses dan Pengujian Aplikasi di Browser
Setelah status kontainer di Docker Desktop menunjukkan warna hijau (Running), buka browser Anda dan akses tautan di bawah ini untuk menguji fungsionalitas visualisasi peta rute AI:

Frontend UI (Next.js): Buka http://localhost:3000

Backend API Documentation (FastAPI Swagger): Buka http://localhost:8000/docs (untuk memantau rute auto-seeding data rumah sakit Jakarta).
