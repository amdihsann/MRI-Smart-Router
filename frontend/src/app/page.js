"use client";

import { useState, useEffect } from "react";
import MetricsCard from "../components/MetricsCard";
import HospitalTable from "../components/HospitalTable";
import MriMap from "../components/MriMap";

const BASE_URL = "/api/v1";

export default function Dashboard() {
  const formatDateToString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [simulationStep, setSimulationStep] = useState(0); 
  const [currentDate, setCurrentDate] = useState(formatDateToString(new Date())); 
  const [targetDate, setTargetDate] = useState(""); 
  
  const [aiPrediction, setAiPrediction] = useState(null);
  const [isRerouting, setIsRerouting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logRouting, setLogRouting] = useState([]);

  const defaultFrontendHospitals = [
    { id_rs: "RS_001", nama_rs: "RSUPN Dr. Cipto Mangunkusumo", max_capacity: 70, current_occupancy: 75, status: "Unavailable", latitude: -6.1973802065906, longitude: 106.84697145077402 },
    { id_rs: "RS_002", nama_rs: "RSPAD Gatot Soebroto", max_capacity: 48, current_occupancy: 42, status: "Available", latitude: -6.176082030841929, longitude: 106.83757546061449 },
    { id_rs: "RS_003", nama_rs: "RS Islam Jakarta Cempaka Putih", max_capacity: 30, current_occupancy: 30, status: "Unavailable", latitude: -6.170490652313448, longitude: 106.8708608858527 },
    { id_rs: "RS_004", nama_rs: "Siloam Hospitals Agora", max_capacity: 33, current_occupancy: 14, status: "Available", latitude: -6.167298492702347, longitude: 106.87564235077373 },
    { id_rs: "RS_005", nama_rs: "Primaya Hospital PGI Cikini", max_capacity: 25, current_occupancy: 15, status: "Available", latitude: -6.191965520153109, longitude: 106.8419372323214 },
    { id_rs: "RS_006", nama_rs: "RSU Murni Teguh Sudirman Jakarta", max_capacity: 28, current_occupancy: 30, status: "Unavailable", latitude: -6.2094651325469865, longitude: 106.81955622604063 },
    { id_rs: "RS_007", nama_rs: "RSU Hermina Kemayoran", max_capacity: 23, current_occupancy: 18, status: "Available", latitude: -6.154473013835796, longitude: 106.84587483710757 },
    { id_rs: "RS_008", nama_rs: "RSU Husada Pusat", max_capacity: 23, current_occupancy: 17, status: "Available", latitude: -6.147363189565821, longitude: 106.82952089535323 },
    { id_rs: "RS_009", nama_rs: "RSU Mitra Kemayoran", max_capacity: 28, current_occupancy: 25, status: "Available", latitude: -6.151877489227251, longitude: 106.85863289535317  },
    { id_rs: "RS_010", nama_rs: "RS Abdi Waluyo", max_capacity: 30, current_occupancy: 15, status: "Available", latitude: -6.189702332038332, longitude: 106.82905851069701 },
    { id_rs: "RS_011", nama_rs: "RSUD Pasar Minggu", max_capacity: 40, current_occupancy: 40, status: "Available", latitude: -6.293907338687236, longitude: 106.82000588556399  },
    { id_rs: "RS_012", nama_rs: "MRCCC Siloam TB Simatupang", max_capacity: 48, current_occupancy: 48, status: "Available", latitude: -6.2920856022185925, longitude: 106.78444289535454 },
    { id_rs: "RS_013", nama_rs: "Brawijaya Hospital ", max_capacity: 20, current_occupancy: 15, status: "Available", latitude: -6.253052228677263, longitude: 106.84105925117493 },
    { id_rs: "RS_014", nama_rs: "Siloam Hospitals Semanggi ", max_capacity: 53, current_occupancy: 57, status: "Unavailable", latitude: -6.219040865287346, longitude: 106.81718640884637 },
    { id_rs: "RS_015", nama_rs: "Mayapada Hospital Lebak Bulus", max_capacity: 40, current_occupancy: 18, status: "Available", latitude: -6.298004630650176, longitude: 106.78617800104975 },
    { id_rs: "RS_016", nama_rs: "RS Pondok Indah", max_capacity: 50, current_occupancy: 39, status: "Available", latitude: -6.283071079975209, longitude: 106.78130467983006 },
    { id_rs: "RS_017", nama_rs: "RS Medistra", max_capacity: 38, current_occupancy: 21, status: "Available", latitude: -6.239487057609986, longitude: 106.83393798371252 },
    { id_rs: "RS_018", nama_rs: "RSUP Fatmawati (Hub)", max_capacity: 55, current_occupancy: 25, status: "Available", latitude: -6.294942942287722, longitude: 106.79638132762203 },
    { id_rs: "RS_019", nama_rs: "Mandaya Royal Hospital Puri", max_capacity: 45, current_occupancy: 55, status: "Unavailable", latitude: -6.198492627676309, longitude: 106.70471954138377 },
    { id_rs: "RS_020", nama_rs: "RSJPD Harapan Kita ", max_capacity: 43, current_occupancy: 35, status: "Available", latitude: -6.185569536505513, longitude: 106.7981728329094 },
    { id_rs: "RS_021", nama_rs: "Pusat Kanker Nasional Rumah Sakit Dharmais", max_capacity: 58, current_occupancy: 56, status: "Available", latitude: -6.186743369204405, longitude: 106.7979999968332 },
    { id_rs: "RS_022", nama_rs: "RS EMC Grha Kedoya", max_capacity: 35, current_occupancy: 20, status: "Available", latitude: -6.167915792543221, longitude: 106.76508822233835 },
    { id_rs: "RS_023", nama_rs: "Siloam Hospitals Kebon Jeruk", max_capacity: 45, current_occupancy: 37, status: "Available", latitude: -6.190716741645077, longitude: 106.76369824837651 },
    { id_rs: "RS_024", nama_rs: "RS Pondok Indah Puri Indah", max_capacity: 35, current_occupancy: 15, status: "Available", latitude: -6.186027798354312, longitude: 106.7352341781593 },
    { id_rs: "RS_025", nama_rs: "RSU Hermina Daan Mogot", max_capacity: 25, current_occupancy: 15, status: "Available", latitude: -6.152819789453265, longitude: 106.7122142646665 },
    { id_rs: "RS_026", nama_rs: "Tzu Chi Hospital PIK", max_capacity: 83, current_occupancy: 67, status: "Available", latitude: -6.105975546227382, longitude: 106.7392173223378 },
    { id_rs: "RS_027", nama_rs: "Rumah Sakit Gading Pluit", max_capacity: 40, current_occupancy: 38, status: "Available", latitude: -6.16592994758835, longitude: 106.915920626481 },
    { id_rs: "RS_028", nama_rs: "RS Pantai Indah Kapuk", max_capacity: 35, current_occupancy: 35, status: "Unavailable", latitude: -6.1114215688386775, longitude: 106.7530506646662 },
    { id_rs: "RS_029", nama_rs: "RS Satya Negara (Kranial Bedah Saraf Kritis)", max_capacity: 30, current_occupancy: 35, status: "Unavailable", latitude: -6.13873201682825, longitude: 106.86132037815887 },
    { id_rs: "RS_030", nama_rs: "RSU Atma Jaya", max_capacity: 30, current_occupancy: 35, status: "Unavailable", latitude: -6.125641347799702, longitude: 106.79305268000978 },
    { id_rs: "RS_031", nama_rs: "RS Penyakit Infeksi Prof. Dr. Sulianti Saroso", max_capacity: 20, current_occupancy: 31, status: "Unavailable", latitude: -6.130132649052144, longitude: 106.86214962789087 },
    { id_rs: "RS_032", nama_rs: "Mitra Keluarga Kelapa Gading", max_capacity: 40, current_occupancy: 36, status: "Available", latitude: -6.1517901880539, longitude: 106.8970858511741 },
    { id_rs: "RS_033", nama_rs: "Primaya Hospital Kelapa Gading", max_capacity: 35, current_occupancy: 35, status: "Unavailable", latitude: -6.163882325725953, longitude: 106.92938546466657 },
    { id_rs: "RS_034", nama_rs: "RS Islam Jakarta Sukapura", max_capacity: 25, current_occupancy: 21, status: "Available", latitude: -6.139593182514165, longitude: 106.92074046466647 },
    { id_rs: "RS_035", nama_rs: "RSUD Koja", max_capacity: 35, current_occupancy: 32, status: "Available", latitude: -6.108673954493158, longitude: 106.90014948946121 },
    { id_rs: "RS_036", nama_rs: "RS Pusat Otak Nasional", max_capacity: 65, current_occupancy: 57, status: "Available", latitude: -6.245989277116205, longitude: 106.87059514138423 },
    { id_rs: "RS_037", nama_rs: "RSUP Persahabatan", max_capacity: 50, current_occupancy: 47, status: "Available", latitude: -6.2038265037316425, longitude: 106.883780464667 },
    { id_rs: "RS_038", nama_rs: "Premier Jatinegara Hospital ", max_capacity: 48, current_occupancy: 39, status: "Available", latitude: -6.221581605783546, longitude: 106.86864330484138 },
    { id_rs: "RS_039", nama_rs: "RS EMC Pulomas", max_capacity: 40, current_occupancy: 43, status: "Unavailable", latitude: -6.180319534023158, longitude: 106.88384876447063 },
    { id_rs: "RS_040", nama_rs: "Columbia Asia Hospital Pulomas", max_capacity: 35, current_occupancy: 35, status: "Unavailable", latitude: -6.181879565548446, longitude: 106.89122768186114 },
    
  ];

  const [hospitals, setHospitals] = useState(defaultFrontendHospitals);
  useEffect(() => {
    if (simulationStep === 0) {
      setHospitals(defaultFrontendHospitals);
      setAiPrediction(null);
      setIsRerouting(false);
      setLogRouting([]);
      setCurrentDate(formatDateToString(new Date()));
    }
  }, [simulationStep]);

  // --- 1. FUNGSI PICU PREDIKSI AI ARIMA (TAHAP 1) ---
  const handleFetchPrediction = async () => {
    if (!targetDate) {
      alert("Silakan pilih tanggal target pada kalender terlebih dahulu");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/forecast?date=${targetDate}`);
      if (!res.ok) throw new Error("Gagal mengambil prediksi AI");
      const data = await res.json();
      
      setAiPrediction(data.predicted_total_patients);
      setSimulationStep(1);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

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

  const handleLoadBalancing = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/load-balance`, { method: "POST" });
      if (!res.ok) throw new Error("Gagal eksekusi pengalihan rute");

      const data = await res.json();
      
      const resRS = await fetch(`${BASE_URL}/hospital/realtime`, { cache: 'no-store' });
      const updatedHospitals = await resRS.json();
      
      setHospitals(updatedHospitals);

      setLogRouting(data.pasien_dialihkan || []);

      setIsRerouting(true);
      setSimulationStep(3); 
      alert(data.message);
    } catch (err) {
      alert("Error Rerouting: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSimulation = async () => {
    setLoading(true);
    try {
      const resReset = await fetch(`${BASE_URL}/database/reset`, { method: "POST" });
      if (!resReset.ok) throw new Error("Gagal mereset data di server");

      const resHospitals = await fetch(`${BASE_URL}/hospital/realtime`, { cache: 'no-store' });
      const updatedData = await resHospitals.json();
      
      setHospitals(defaultFrontendHospitals);
      setAiPrediction(null); 
      setSimulationStep(0); 
    } catch (err) {
      alert("Gagal mereset database: " + err.message);
    } finally {
      setLoading(false); // Buka kunci loading
    }
  };

  const handleSurgeSimulation = async () => {
    setLoading(true); 
    try {
      const resSurge = await fetch(`${BASE_URL}/database/simulate-surge`, { method: "POST" });
      if (!resSurge.ok) throw new Error("Gagal mengaktifkan krisis lonjakan");

      const resHospitals = await fetch(`${BASE_URL}/hospital/realtime`, { cache: 'no-store' });
      const updatedData = await resHospitals.json();
      
      setHospitals(defaultFrontendHospitals);
      setSimulationStep(0); 
    } catch (err) {
      alert("Gagal simulasi lonjakan: " + err.message);
    } finally {
      setLoading(false); 
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
              Krisis Overload
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
          const fatmawati = hospitals.find(rs => rs.id_rs === "RS_018");
          
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