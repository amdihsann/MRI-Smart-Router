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
    { id_rs: "RS_009", nama_rs: "RSU Mitra Kemayoran", max_capacity: 28, current_occupancy: 25, status: "Available", latitude: -6.151877489227251, longitude: 106.85863289535317 },
    { id_rs: "RS_010", nama_rs: "RS Abdi Waluyo", max_capacity: 30, current_occupancy: 15, status: "Available", latitude: -6.189702332038332, longitude: 106.82905851069701 },
    { id_rs: "RS_011", nama_rs: "RSUD Pasar Minggu", max_capacity: 40, current_occupancy: 40, status: "Available", latitude: -6.293907338687236, longitude: 106.82000588556399 },
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
      setLoading(false);
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

  /* ─── derived display values (read-only, no new state) ─── */
  const isCrisis = simulationStep === 2;
  const fatmawati = hospitals.find(rs => rs.id_rs === "RS_018");
  const hubOccupancy = fatmawati?.current_occupancy ?? 0;
  const hubCapacity  = fatmawati?.max_capacity ?? 1;
  const hubFillPct   = Math.min(Math.round((hubOccupancy / hubCapacity) * 100), 100);

  const stepLabels = ["Idle", "Prediksi Siap", "Krisis Terdeteksi", "Router Aktif"];

  return (
    <div className={`min-h-screen font-sans transition-colors duration-700 ${isCrisis ? "bg-[#0d0404]" : "bg-zinc-950"}`}>

      {/* ══════════════════════════════════════════
          TOP HUD BAR
      ══════════════════════════════════════════ */}
      <header className={`sticky top-0 z-50 border-b px-6 py-0 backdrop-blur-md transition-colors duration-500 ${
        isCrisis
          ? "border-rose-900/50 bg-[#0d0404]/90"
          : "border-white/[0.06] bg-zinc-950/90"
      }`}>
        <div className="flex h-12 items-center justify-between">

          {/* Left — brand */}
          <div className="flex items-center gap-3">
            <div className={`h-4 w-0.5 rounded-full ${isCrisis ? "bg-rose-500" : "bg-teal-400"}`} />
            <span className="text-[13px] font-semibold tracking-tight text-zinc-100">
              Smart-MRI Router
            </span>
            <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
              isCrisis
                ? "bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/20"
                : "bg-teal-500/10 text-teal-400 ring-1 ring-teal-500/15"
            }`}>
              {isCrisis ? "CRISIS MODE" : "COMMAND CENTER"}
            </span>
          </div>

          {/* Center — step pipeline */}
          <div className="hidden items-center gap-1 md:flex">
            {stepLabels.map((label, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className={`flex h-5 items-center gap-1.5 rounded px-2 text-[10px] font-semibold transition-all duration-300 ${
                  simulationStep === i
                    ? isCrisis
                      ? "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/25"
                      : "bg-teal-500/15 text-teal-300 ring-1 ring-teal-500/20"
                    : simulationStep > i
                    ? "text-zinc-400"
                    : "text-zinc-700"
                }`}>
                  {simulationStep > i && <span className="text-teal-500">✓</span>}
                  {simulationStep === i && (
                    <span className={`h-1 w-1 rounded-full ${isCrisis ? "animate-pulse bg-rose-400" : "animate-pulse bg-teal-400"}`} />
                  )}
                  {label}
                </div>
                {i < 3 && <span className="text-zinc-800">›</span>}
              </div>
            ))}
          </div>

          {/* Right — controls */}
          <div className="flex items-center gap-2">
            <span className="hidden text-[11px] tabular-nums text-zinc-600 sm:block">
              {currentDate}
            </span>
            <div className="h-4 w-px bg-white/8" />
            <button
              onClick={handleResetSimulation}
              disabled={loading}
              className="rounded px-3 py-1.5 text-[11px] font-medium text-zinc-400 ring-1 ring-white/10 transition hover:bg-white/5 hover:text-zinc-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Reset
            </button>
            <button
              onClick={handleSurgeSimulation}
              disabled={loading || simulationStep === 2}
              className={`rounded px-3 py-1.5 text-[11px] font-semibold transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 ${
                isCrisis
                  ? "cursor-not-allowed bg-rose-950 text-rose-600 ring-1 ring-rose-900"
                  : "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20 hover:bg-amber-500/20"
              }`}
            >
              {isCrisis ? "CRISIS ACTIVE" : "Simulate Surge"}
            </button>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════
          MAIN BENTO GRID
      ══════════════════════════════════════════ */}
      <main className="grid grid-cols-12 gap-3 p-4">

        {/* ── COLUMN LEFT: metrics + AI pipeline (col 1–4) ── */}
        <aside className="col-span-12 flex flex-col gap-3 lg:col-span-4 xl:col-span-3">

          {/* Metric: Facilities */}
          <MetricsCard
            title="Fasilitas Terpantau"
            value={`${hospitals.length}`}
            unit="Rumah Sakit"
            status="normal"
          />

          {/* Metric: Hub Status */}
          {(() => {
            const fatmawati = hospitals.find(rs => rs.id_rs === "RS_018");
            if (!fatmawati) {
              return <MetricsCard title="Hub Utama — Fatmawati" value="—" unit="Memuat…" status="normal" />;
            }
            const occupancy = fatmawati.current_occupancy;
            const maxCapacity = fatmawati.max_capacity;
            const isOverload = occupancy > maxCapacity;
            const isFull = occupancy === maxCapacity;
            let displayValue = `${maxCapacity - occupancy}`;
            let unit = "Slot Tersedia";
            let cardStatus = "success";
            if (isOverload) { displayValue = `+${occupancy - maxCapacity}`; unit = "Overload Pasien"; cardStatus = "danger"; }
            else if (isFull) { displayValue = "0"; unit = "Kapasitas Penuh"; cardStatus = "warning"; }
            return <MetricsCard title="Hub Utama — Fatmawati" value={displayValue} unit={unit} status={cardStatus} fill={hubFillPct} />;
          })()}

          {/* Metric: AI Prediction */}
          <MetricsCard
            title="Prediksi AI ARIMA"
            value={aiPrediction !== null ? `${aiPrediction}` : "—"}
            unit={aiPrediction !== null ? "Pasien Diprediksi" : "Belum Dijalankan"}
            status={aiPrediction === null ? "normal" : aiPrediction > 55 ? "warning" : "success"}
          />

          {/* AI Pipeline Panel */}
          <div className={`rounded-xl border p-4 ${isCrisis ? "border-rose-900/40 bg-rose-950/20" : "border-white/[0.07] bg-zinc-900/50"}`}>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
              AI Simulation Pipeline
            </p>

            {/* Date input */}
            <div className="mb-3">
              <label className="mb-1 block text-[11px] font-medium text-zinc-500">
                Target Tanggal
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                disabled={simulationStep > 1}
                className="w-full rounded-lg border border-white/10 bg-zinc-800/60 px-3 py-2 text-xs font-medium text-zinc-200 tabular-nums transition focus:border-teal-500/60 focus:outline-none focus:ring-1 focus:ring-teal-500/30 disabled:cursor-not-allowed disabled:opacity-30"
              />
            </div>

            {/* Step 1 */}
            <button
              onClick={handleFetchPrediction}
              disabled={simulationStep !== 0}
              className={`mb-2 w-full rounded-lg py-2.5 text-xs font-semibold tracking-wide transition active:scale-[0.98] disabled:cursor-not-allowed ${
                simulationStep === 0
                  ? "bg-teal-500/10 text-teal-300 ring-1 ring-teal-500/25 hover:bg-teal-500/20"
                  : "bg-zinc-800/40 text-zinc-600 ring-1 ring-white/5"
              }`}
            >
              {loading && simulationStep === 0 ? "Menghitung ARIMA…" : "① Jalankan Radar Prediksi AI"}
            </button>

            {/* Step 2 */}
            <button
              onClick={handleSetCurrentDay}
              disabled={simulationStep !== 1}
              className={`w-full rounded-lg py-2.5 text-xs font-semibold tracking-wide transition active:scale-[0.98] disabled:cursor-not-allowed ${
                simulationStep === 1
                  ? "bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/25 hover:bg-amber-500/20"
                  : "bg-zinc-800/40 text-zinc-600 ring-1 ring-white/5"
              }`}
            >
              {loading && simulationStep === 1 ? "Memuat DB…" : "② Time-Travel ke Hari Ini"}
            </button>

            {/* Progress track */}
            <div className="mt-4 flex gap-1">
              {[0, 1, 2, 3].map((s) => (
                <div key={s} className={`h-0.5 flex-1 rounded-full transition-all duration-500 ${
                  simulationStep > s ? "bg-teal-500" : simulationStep === s ? "bg-teal-500/40" : "bg-white/6"
                }`} />
              ))}
            </div>
            <p className="mt-1.5 text-right text-[10px] tabular-nums text-zinc-700">
              {simulationStep}/3
            </p>
          </div>
        </aside>

        {/* ── COLUMN RIGHT: Map hero + Table (col 5–12) ── */}
        <section className="col-span-12 flex flex-col gap-3 lg:col-span-8 xl:col-span-9">

          {/* Map hero */}
          <div className={`relative flex flex-col overflow-hidden rounded-2xl border transition-colors duration-500 ${
            isCrisis
              ? "border-rose-900/50 ring-1 ring-rose-800/20"
              : "border-white/[0.07] ring-1 ring-white/[0.04]"
          }`}
            style={{ minHeight: "420px" }}
          >
            {/* Map header strip */}
            <div className={`flex items-center justify-between border-b px-5 py-3 ${
              isCrisis ? "border-rose-900/40 bg-rose-950/30" : "border-white/[0.06] bg-zinc-900/80"
            }`}>
              <div className="flex items-center gap-2.5">
                <span className={`h-1.5 w-1.5 rounded-full ${isCrisis ? "animate-pulse bg-rose-500" : "bg-teal-400"}`} />
                <span className="text-[12px] font-semibold tracking-tight text-zinc-200">
                  Geospatial Command — Jakarta
                </span>
                <span className="text-[10px] text-zinc-600">Azure Maps SDK</span>
              </div>
              <div className="flex items-center gap-2">
                {simulationStep === 3 && (
                  <span className="flex items-center gap-1.5 rounded-full bg-teal-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-teal-400 ring-1 ring-teal-500/20">
                    <span className="h-1 w-1 animate-pulse rounded-full bg-teal-400" />
                    Jalur Aktif
                  </span>
                )}
                {isCrisis && (
                  <span className="flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-rose-400 ring-1 ring-rose-500/20">
                    <span className="h-1 w-1 animate-pulse rounded-full bg-rose-400" />
                    OVERLOAD
                  </span>
                )}
              </div>
            </div>

            {/* Azure Map — hero stage */}
            <div className="flex-1 w-full" style={{ minHeight: "360px" }}>
              <MriMap hospitals={hospitals} simulationStep={simulationStep} logRouting={logRouting} />
            </div>

            {/* Map footer strip */}
            <div className={`flex items-center justify-between border-t px-5 py-2 ${
              isCrisis ? "border-rose-900/30 bg-rose-950/20" : "border-white/[0.05] bg-zinc-900/60"
            }`}>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 opacity-70" />
                <span className="text-[10px] font-mono text-zinc-700">Azure Atlas Engine — Connected</span>
              </div>
              <span className="text-[10px] tabular-nums text-zinc-700">{hospitals.length} nodes</span>
            </div>
          </div>

          {/* Hospital Table */}
          <HospitalTable
            hospitals={hospitals}
            simulationStep={simulationStep}
            onTriggerLoadBalance={handleLoadBalancing}
          />
        </section>
      </main>
    </div>
  );
}
