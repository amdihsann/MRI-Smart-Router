"use client";

import { useState, useEffect } from "react";
import MetricsCard from "../components/MetricsCard";
import HospitalTable from "../components/HospitalTable";
import MriMap from "../components/MriMap";

// Alamat API Backend Docker
const BASE_URL = "http://localhost:8000/api/v1";

export default function Dashboard() {
  // --- STATE MANAGEMENT SIMULASI ---
  const [simulationStep, setSimulationStep] = useState(0); // Tahap 0, 1, 2, atau 3
  const [currentDate, setCurrentDate] = useState("2026-06-04"); // Hari Ini (Statis Awal)
  const [targetDate, setTargetDate] = useState("2026-06-05"); // Tanggal Besok untuk AI
  
  // --- STATE DATA ---
  const [aiPrediction, setAiPrediction] = useState(null);
  const [isRerouting, setIsRerouting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logRouting, setLogRouting] = useState([]);

  // --- DATA DEFAULT FRONTEND (TAHAP 0) ---
  // Ditampilkan di layar saat web pertama dibuka sebelum konek ke DB nyata
  const defaultFrontendHospitals = [
    { id_rs: "RS_001", nama_rs: "RSUPN Dr. Cipto Mangunkusumo", max_capacity: 70, current_occupancy: 75, status: "Unavailable", latitude: -6.2954, longitude: 106.8054 },
    { id_rs: "RS_002", nama_rs: "RSPAD Gatot Soebroto", max_capacity: 48, current_occupancy: 42, status: "Available", latitude: -6.2954, longitude: 106.8054 },
    { id_rs: "RS_003", nama_rs: "RS Islam Jakarta Cempaka Putih", max_capacity: 30, current_occupancy: 30, status: "Available", latitude: -6.2954, longitude: 106.8054 },
    { id_rs: "RS_004", nama_rs: "Siloam Hospitals Agora", max_capacity: 33, current_occupancy: 14, status: "Available", latitude: -6.2954, longitude: 106.8054 },
    { id_rs: "RS_005", nama_rs: "Primaya Hospital PGI Cikini", max_capacity: 25, current_occupancy: 15, status: "Available", latitude: -6.2954, longitude: 106.8054 },
    { id_rs: "RS_006", nama_rs: "RSU Murni Teguh Sudirman Jakarta", max_capacity: 28, current_occupancy: 30, status: "Unavailable", latitude: -6.2954, longitude: 106.8054 },
    { id_rs: "RS_007", nama_rs: "RSU Hermina Kemayoran", max_capacity: 23, current_occupancy: 18, status: "Available", latitude: -6.2954, longitude: 106.8054 },
    { id_rs: "RS_008", nama_rs: "RSU Husada Pusat", max_capacity: 23, current_occupancy: 17, status: "Available", latitude: -6.2954, longitude: 106.8054 },
    { id_rs: "RS_009", nama_rs: "RSU Kramat 128", max_capacity: 23, current_occupancy: 25, status: "Unavailable", latitude: -6.2954, longitude: 106.8054 },
    { id_rs: "RS_010", nama_rs: "RSU Mitra Kemayoran", max_capacity: 28, current_occupancy: 25, status: "Available", latitude: -6.2954, longitude: 106.8054 },
    { id_rs: "RS_011", nama_rs: "RS Abdi Waluyo", max_capacity: 30, current_occupancy: 15, status: "Available", latitude: -6.2954, longitude: 106.8054 },
    { id_rs: "RS_012", nama_rs: "RSUD Pasar Minggu", max_capacity: 40, current_occupancy: 40, status: "Available", latitude: -6.2954, longitude: 106.8054 },
    { id_rs: "RS_013", nama_rs: "MRCCC Siloam TB Simatupang", max_capacity: 48, current_occupancy: 48, status: "Available", latitude: -6.2954, longitude: 106.8054 },
    { id_rs: "RS_014", nama_rs: "Brawijaya Hospital ", max_capacity: 20, current_occupancy: 15, status: "Available", latitude: -6.2954, longitude: 106.8054 },
    { id_rs: "RS_015", nama_rs: "Siloam Hospitals Semanggi ", max_capacity: 53, current_occupancy: 57, status: "Unavailable", latitude: -6.2954, longitude: 106.8054 },
    { id_rs: "RS_016", nama_rs: "Mayapada Hospital Lebak BUlus", max_capacity: 40, current_occupancy: 18, status: "Available", latitude: -6.2954, longitude: 106.8054 },
    { id_rs: "RS_017", nama_rs: "RS Pondok Indah", max_capacity: 50, current_occupancy: 39, status: "Available", latitude: -6.2954, longitude: 106.8054 },
    { id_rs: "RS_018", nama_rs: "Rumah Sakit Jakarta", max_capacity: 45, current_occupancy: 35, status: "Available", latitude: -6.2954, longitude: 106.8054 },
    { id_rs: "RS_019", nama_rs: "RS Medistra", max_capacity: 38, current_occupancy: 21, status: "Available", latitude: -6.2954, longitude: 106.8054 },
    { id_rs: "RS_020", nama_rs: "RSUP Fatmawati (Hub)", max_capacity: 55, current_occupancy: 25, status: "Available", latitude: -6.2954, longitude: 106.8054 },
  ];

  const [hospitals, setHospitals] = useState(defaultFrontendHospitals);
  useEffect(() => {
    if (simulationStep === 0) {
      setHospitals(defaultFrontendHospitals);
      setAiPrediction(null);
      setIsRerouting(false);
      setLogRouting([]);
      setCurrentDate("2026-06-04");
    }
  }, [simulationStep]);

  // --- 1. FUNGSI PICU PREDIKSI AI ARIMA (TAHAP 1) ---
  const handleFetchPrediction = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/forecast?date=${targetDate}`);
      if (!res.ok) throw new Error("Gagal mengambil prediksi AI");
      const data = await res.json();
      
      setAiPrediction(data.predicted_total_patients);
      setSimulationStep(1); // Naik ke Tahap 1: AI Radar Aktif
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. FUNGSI TIME-TRAVEL / SWITCH TO REAL DB (TAHAP 2) ---
  const handleSetCurrentDay = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/hospital/realtime`, { cache: 'no-store' });
      if (!res.ok) throw new Error("Gagal mengambil data riil DB");

      const data = await res.json();
      
      setHospitals(data);
      setCurrentDate(targetDate); 
      setSimulationStep(2); 
    } catch (err) {
      alert("Error DB: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- 3. FUNGSI EKSEKUSI LOAD BALANCING (TAHAP 3) ---
  const handleLoadBalancing = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/load-balance`, { method: "POST" });
      if (!res.ok) throw new Error("Gagal eksekusi pengalihan rute");
      const data = await res.json();
      
      // Ambil ulang data RS terbaru dari DB karena occupancy sudah bergeser setelah rujukan
      const resRS = await fetch(`${BASE_URL}/hospital/realtime`);
      const updatedHospitals = await resRS.json();
      
      setHospitals(updatedHospitals);
      setLogRouting(data.logs_pencarian_spasial || []);
      setIsRerouting(true);
      setSimulationStep(3); // Naik ke Tahap 3: Rerouting Sukses Berjalan
      alert(data.message);
    } catch (err) {
      alert("Error Rerouting: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSimulation = async () => {
    setLoading(true); // Kunci loading di awal
    try {
      // 1. Tembak API reset ke PostgreSQL
      const resReset = await fetch(`${BASE_URL}/database/reset`, { method: "POST" });
      if (!resReset.ok) throw new Error("Gagal mereset data di server");

      // 2. AMBIL ULANG data yang sudah normal dari database
      const resHospitals = await fetch(`${BASE_URL}/hospital/realtime`, { cache: 'no-store' });
      const updatedData = await resHospitals.json();
      
      // 3. Paksa sinkronisasi ke komponen visual
      setHospitals(updatedData);
      setAiPrediction(null); // Bersihkan sisa ramalan AI sebelumnya
      setSimulationStep(0);  // Kembalikan ke titik awal awal mula
    } catch (err) {
      alert("Gagal mereset database: " + err.message);
    } finally {
      setLoading(false); // Buka kunci loading
    }
  };

  const handleSurgeSimulation = async () => {
    setLoading(true); // Kunci loading di awal
    try {
      // 1. Tembak API pemicu krisis ke PostgreSQL
      const resSurge = await fetch(`${BASE_URL}/database/simulate-surge`, { method: "POST" });
      if (!resSurge.ok) throw new Error("Gagal mengaktifkan krisis lonjakan");

      // 2. AMBIL ULANG data bergejolak dari database
      const resHospitals = await fetch(`${BASE_URL}/hospital/realtime`, { cache: 'no-store' });
      const updatedData = await resHospitals.json();
      
      // 3. Paksa sinkronisasi ke komponen visual
      setHospitals(updatedData);
      setSimulationStep(2); // LANGSUNG LOMPAT KE STEP 2: Siap Eksekusi Router!
    } catch (err) {
      alert("Gagal simulasi lonjakan: " + err.message);
    } finally {
      setLoading(false); // Buka kunci loading
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6 font-sans">
      {/* HEADER DASHBOARD */}
      <header className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Smart-MRI Router Center</h1>
          <p className="text-gray-500 text-sm">
            Simulasi Prediksi Bottleneck & Distribusi Beban Diagnostik Spasial ── Tanggal Aktif: <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{currentDate}</span>
          </p>
        </div>
        
        {/* PANEL UTAMA SIMULATOR KENDALAI */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xl flex flex-wrap gap-4 items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {/* Lampu indikator status simulasi */}
            <div className={`w-2 h-2 rounded-full ${simulationStep === 2 ? "bg-red-500 animate-ping" : "bg-emerald-500"}`}></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Control Hub</span>
              <span className="text-xs font-semibold text-slate-300">
                Status: {simulationStep === 2 ? "⚠️ Mode Krisis Aktif" : "🟢 Operasional Normal"}
              </span>
            </div>
          </div>

          <div className="flex gap-2.5">
            {/* TOMBOL 1: KEMBALIKAN KONDISI AMAN */}
            <button 
              onClick={handleResetSimulation}
              disabled={loading}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3.5 py-2 rounded-lg font-medium border border-slate-700/50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset Sim (Aman)
            </button>

            {/* TOMBOL 2: AKTIFKAN KRISIS / LONJAKAN PATIENTS */}
            <button 
              onClick={handleSurgeSimulation}
              disabled={loading || simulationStep === 2}
              className={`text-xs px-3.5 py-2 rounded-lg font-semibold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 ${
                simulationStep === 2 
                  ? "bg-red-950 text-red-400 border border-red-900" 
                  : "bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-900/20"
              }`}
            >
              ⚡ Suntik Krisis Overload
            </button>
          </div>
        </div>
      </header>

      {/* MODUL AI CONTROLLER (KOTAK UNTUK PILIH TANGGAL & PREDIKSI) */}
      <section className="mb-8 p-4 bg-white rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase">Target Tanggal Prediksi AI:</label>
          <input 
            type="date" 
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            disabled={simulationStep > 1}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
        </div>
        <div className="flex gap-2 md:col-span-2 pt-4 md:pt-0">
          <button
            onClick={handleFetchPrediction}
            disabled={simulationStep !== 0}
            className={`flex-1 font-semibold px-4 py-2 rounded-lg text-sm transition-all ${
              simulationStep === 0 ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm" : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {loading && simulationStep === 0 ? "Menghitung Tren..." : "1. Jalankan Radar Prediksi Pasien (AI) "}
          </button>
          <button
            onClick={handleSetCurrentDay}
            disabled={simulationStep !== 1}
            className={`flex-1 font-semibold px-4 py-2 rounded-lg text-sm transition-all ${
              simulationStep === 1 ? "bg-amber-500 hover:bg-amber-600 text-white shadow-sm animate-pulse" : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            2. Set Menjadi Hari Ini (Time-Travel)
          </button>
        </div>
      </section>

      {/* GRID KARTU METRIK */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricsCard 
          title="Total Fasilitas Terpantau" 
          value={`${hospitals.length} Rumah Sakit`} 
          status="normal" 
        />

        {(() => {
          const fatmawati = hospitals.find(rs => rs.id_rs === "RS_020");
          
          if (!fatmawati) {
            return (
              <MetricsCard 
                title="Status Kepadatan Hub Utama" 
                value="Memuat Data Fasilitas..." 
                status="normal" 
              />
            );
          }

          const occupancy = fatmawati.current_occupancy;
          const maxCapacity = fatmawati.max_capacity;
          const isOverload = occupancy > maxCapacity;
          const isFull = occupancy === maxCapacity;

          let displayValue = `Aman (${maxCapacity - occupancy} Slot Tersedia)`;
          let cardStatus = "success";

          if (isOverload) {
            displayValue = `Overload (+${occupancy - maxCapacity} Pasien)`;
            cardStatus = "danger";
          } else if (isFull) {
            displayValue = "Kapasitas Penuh (0 Slot)";
            cardStatus = "warning";
          }

          return (
            <MetricsCard 
              title="Status Kepadatan Hub Utama" 
              value={displayValue} 
              status={cardStatus} 
            />
          );
        })()}

        <MetricsCard 
          title="Radar Hasil Prediksi AI ARIMA" 
          value={aiPrediction !== null ? `${aiPrediction} Prediksi Pasien` : "Belum Ada Prediksi"} 
          status={aiPrediction === null ? "normal" : aiPrediction > 55 ? "warning" : "success"} 
        />
      </div>

      {/* KONTEN UTAMA MAPS & TABEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* KOLOM KIRI: PLACEHOLDER MAPS AZURE */}
        <div className="lg:col-span-7 bg-gray-900 text-white p-6 rounded-xl min-h-[450px] flex flex-col justify-between shadow-md relative overflow-hidden">
          <div className="z-10 mb-2">
            <h3 className="font-bold text-lg text-gray-100">Simulasi Spasial Jakarta</h3>
            <p className="text-xs text-gray-400 mt-1">Integrasi Geografis Azure Maps API Web SDK</p>
          </div>

          {/* RENDER KOMPONEN PETA DISINI */}
          <div className="flex-1 w-full my-2 rounded-lg overflow-hidden border border-gray-800">
            <MriMap hospitals={hospitals} simulationStep={simulationStep} logRouting={logRouting}/>
          </div>

          <div className="text-xs text-gray-500 z-10 font-mono flex justify-between items-center mt-2">
            <span>Status Koordinat: Azure Atlas Engine Active</span>
            {simulationStep === 3 && <span className="text-green-400 font-bold animate-pulse">● JALUR RUJUKAN AKTIF</span>}
          </div>
        </div>

        {/* KOLOM KANAN: TABEL KONTROL DATA REAL-TIME */}
        <div className="lg:col-span-5">
          <HospitalTable 
            hospitals={hospitals} 
            simulationStep={simulationStep}
            onTriggerLoadBalance={handleLoadBalancing} 
          />
        </div>
      </div>
    </main>
  );
}