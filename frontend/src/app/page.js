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

  // Status koneksi backend untuk menangani Cold Start (Hugging Face Spaces)
  const [serverStatus, setServerStatus] = useState("waking"); // "waking" | "ready" | "error"
  const [wakeElapsed, setWakeElapsed] = useState(0);
  const [showReadyToast, setShowReadyToast] = useState(false);

  // Timer penghitung detik selama server sedang bangun dari mode sleep
  useEffect(() => {
    if (serverStatus !== "waking") return;
    const timer = setInterval(() => {
      setWakeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [serverStatus]);

  // Proactive Wake-Up Ping saat user pertama kali masuk ke dashboard
  const checkServerConnection = async () => {
    setServerStatus("waking");
    setWakeElapsed(0);

    const maxRetries = 4;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const res = await fetch(`${BASE_URL}/hospital/realtime`, { cache: 'no-store' });
        if (res.ok) {
          setServerStatus("ready");
          setShowReadyToast(true);
          setTimeout(() => setShowReadyToast(false), 3500);
          return;
        }
      } catch {
        // Abaikan error sementara saat container Hugging Face masih booting (502/503)
      }
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 4000));
      }
    }
    setServerStatus("error");
  };

  useEffect(() => {
    checkServerConnection();
  }, []);

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
  const fatmawati = hospitals.find(rs => rs.id_rs === "RS_018");
  const hubOccupancy = fatmawati?.current_occupancy ?? 0;
  const hubCapacity  = fatmawati?.max_capacity ?? 55;
  const hubFillPct   = Math.min(Math.round((hubOccupancy / hubCapacity) * 100), 100);
  const hubDelta     = hubCapacity - hubOccupancy;

  // Pemisahan tegas 3 kondisi kapasitas Hub Fatmawati + status Router Aktif
  const isHubOverload = hubOccupancy > hubCapacity;    // > 55 (Merah / Crisis)
  const isHubFull     = hubOccupancy === hubCapacity;  // === 55 (Kuning / Siaga Penuh)
  const isCrisis      = simulationStep === 2 && isHubOverload;
  const isWarningFull = simulationStep === 2 && isHubFull;
  const isSafeMode    = (simulationStep === 2 && !isHubOverload && !isHubFull) || simulationStep === 3;

  const step2Label =
    simulationStep >= 2
      ? isHubOverload
        ? "Krisis Terdeteksi"
        : isHubFull
        ? "Kapasitas Penuh"
        : "Kapasitas Aman"
      : "Evaluasi Kapasitas";

  const stepLabels = ["Idle", "Prediksi Siap", step2Label, "Router Aktif"];

  // Agregasi ringkasan tujuan rujukan dari logRouting secara aman
  const routingSummary = Array.isArray(logRouting)
    ? Object.entries(
        logRouting.reduce((acc, item) => {
          const dest = item?.rs_tujuan || "Tidak Diketahui";
          acc[dest] = (acc[dest] || 0) + 1;
          return acc;
        }, {})
      )
    : [];

  return (
    <div className={`min-h-screen font-sans transition-colors duration-700 ${
      isCrisis
        ? "bg-[#0d0404]"
        : isWarningFull
        ? "bg-[#0d0a04]"
        : isSafeMode
        ? "bg-[#040d0a]"
        : "bg-[#090d16]"
    }`}>

      {/* ══════════════════════════════════════════
          TOP HEADER BAR
      ══════════════════════════════════════════ */}
      <header className={`sticky top-0 z-50 border-b px-4 py-2.5 backdrop-blur-md transition-colors duration-500 lg:px-6 ${
        isCrisis
          ? "border-rose-900/50 bg-[#0d0404]/95"
          : isWarningFull
          ? "border-amber-900/40 bg-[#0d0a04]/95"
          : isSafeMode
          ? "border-emerald-900/50 bg-[#040d0a]/95"
          : "border-slate-800/80 bg-[#090d16]/95"
      }`}>
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3">

          {/* Left — Brand & Mode Badge */}
          <div className="flex items-center gap-3">
            <div className={`h-5 w-1 rounded-full ${
              isCrisis
                ? "bg-rose-500"
                : isWarningFull
                ? "bg-amber-400"
                : isSafeMode
                ? "bg-emerald-400"
                : "bg-teal-400"
            }`} />
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-semibold tracking-tight text-slate-100">
                Smart-MRI Router
              </span>
              <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                isCrisis
                  ? "bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/30"
                  : isWarningFull
                  ? "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30"
                  : isSafeMode
                  ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30"
                  : "bg-teal-500/10 text-teal-400 ring-1 ring-teal-500/20"
              }`}>
                {isCrisis
                  ? "CRISIS MODE"
                  : isWarningFull
                  ? "FULL CAPACITY"
                  : simulationStep === 3
                  ? "ROUTER ACTIVE"
                  : isSafeMode
                  ? "SAFE CAPACITY"
                  : "SPATIAL COMMAND"}
              </span>
            </div>
          </div>

          {/* Center — Step Pipeline */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-white/[0.08] bg-black/30 px-2.5 py-1">
            {stepLabels.map((label, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className={`flex h-6 items-center gap-1.5 rounded-md px-2.5 text-[11px] font-medium transition-all duration-300 ${
                  simulationStep === i
                    ? isCrisis
                      ? "bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/35"
                      : isWarningFull
                      ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/35"
                      : isSafeMode
                      ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/35"
                      : "bg-teal-500/20 text-teal-300 ring-1 ring-teal-500/30"
                    : simulationStep > i
                    ? "text-slate-300"
                    : "text-slate-500"
                }`}>
                  {simulationStep > i && <span className="text-emerald-400">✓</span>}
                  {simulationStep === i && (
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      isCrisis
                        ? "animate-pulse bg-rose-400"
                        : isWarningFull
                        ? "animate-pulse bg-amber-400"
                        : isSafeMode
                        ? "animate-pulse bg-emerald-400"
                        : "animate-pulse bg-teal-400"
                    }`} />
                  )}
                  {label}
                </div>
                {i < 3 && <span className="text-slate-600">›</span>}
              </div>
            ))}
          </div>

          {/* Right — System Date Indicator */}
          <div className="flex items-center gap-2 text-xs tabular-nums text-slate-400">
            <span className="whitespace-nowrap text-slate-400">Tanggal Sistem:</span>
            <span className="whitespace-nowrap rounded-md bg-black/40 px-2.5 py-1 font-medium text-slate-200 ring-1 ring-white/10">
              {currentDate}
            </span>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════
          MAIN WORKSPACE CONTAINER
      ══════════════════════════════════════════ */}
      <main className="mx-auto flex max-w-[1600px] flex-col gap-4 p-4 lg:p-6">

        {/* ── COLD START / SERVER WAKE-UP BANNER ── */}
        {serverStatus === "waking" && (
          <div className="flex flex-col justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-950/25 px-4 py-3 text-xs backdrop-blur-sm sm:flex-row sm:items-center">
            <div className="flex items-start gap-3 sm:items-center">
              <span className="mt-0.5 inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-amber-400 border-t-transparent sm:mt-0" />
              <div>
                <p className="font-semibold text-amber-200">
                  Menghubungkan ke Server AI & Database… ({wakeElapsed} detik)
                </p>
                <p className="mt-0.5 text-[11px] text-amber-200/75">
                  Server cloud sedang diaktifkan. Proses ini hanya terjadi pada akses pertama dan memakan waktu ±15–30 detik. Mohon tunggu sebentar.
                </p>
              </div>
            </div>
            <span className="shrink-0 self-start rounded-md bg-amber-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300 ring-1 ring-amber-500/30 sm:self-center">
              Warming Up
            </span>
          </div>
        )}

        {showReadyToast && serverStatus === "ready" && (
          <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-950/25 px-4 py-2.5 text-xs text-emerald-200">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>
                <strong>Server AI & Database terhubung.</strong> Seluruh fitur prediksi SARIMAX dan simulasi spasial siap digunakan.
              </span>
            </div>
          </div>
        )}

        {serverStatus === "error" && (
          <div className="flex flex-col justify-between gap-3 rounded-xl border border-rose-500/35 bg-rose-950/30 px-4 py-3 text-xs sm:flex-row sm:items-center">
            <div>
              <p className="font-semibold text-rose-300">
                Server Backend Belum Merespons
              </p>
              <p className="mt-0.5 text-[11px] text-rose-200/80">
                Server membutuhkan waktu lebih lama untuk aktif atau sedang mengalami gangguan jaringan.
              </p>
            </div>
            <button
              onClick={checkServerConnection}
              className="shrink-0 rounded-lg bg-rose-500/20 px-3 py-1.5 text-xs font-semibold text-rose-200 ring-1 ring-rose-500/40 transition hover:bg-rose-500/30"
            >
              Coba Hubungkan Ulang
            </button>
          </div>
        )}
        
        {/* ── TOP KPI STRIP (2 Cards Horizontal: 50% : 50%) ── */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <MetricsCard
            title="Fasilitas Terpantau"
            value={`${hospitals.length}`}
            unit="Rumah Sakit Jejaring"
            status="normal"
          />

          {(() => {
            if (!fatmawati) {
              return <MetricsCard title="Hub Utama — RSUP Fatmawati" value="—" unit="Memuat…" status="normal" />;
            }
            let displayValue = `${hubCapacity - hubOccupancy}`;
            let unit = "Slot MRI Tersedia";
            let cardStatus = "success";
            if (isHubOverload) {
              displayValue = `+${hubOccupancy - hubCapacity}`;
              unit = "Overload Pasien";
              cardStatus = "danger";
            } else if (isHubFull) {
              displayValue = "0";
              unit = "Kapasitas Penuh (Siaga)";
              cardStatus = "warning";
            }
            return (
              <MetricsCard
                title="Hub Utama — RSUP Fatmawati"
                value={displayValue}
                unit={unit}
                status={cardStatus}
                fill={hubFillPct}
              />
            );
          })()}
        </section>

        {/* ══════════════════════════════════════════
            ROW 1: HOSPITAL DIRECTORY (LEFT) & GEOSPATIAL MAP (RIGHT)
        ══════════════════════════════════════════ */}
        <section className="grid grid-cols-12 gap-4">

          {/* ── QUADRANT 1 (Top-Left): Live Hospital Directory ── */}
          <div className="col-span-12 flex flex-col lg:col-span-5">
            <HospitalTable
              hospitals={hospitals}
              simulationStep={simulationStep}
              onTriggerLoadBalance={handleLoadBalancing}
            />
          </div>

          {/* ── QUADRANT 2 (Top-Right): Geospatial Routing Map ── */}
          <div className={`col-span-12 flex min-h-[420px] flex-col overflow-hidden rounded-xl border transition-colors duration-500 lg:col-span-7 ${
            isCrisis
              ? "border-rose-900/50 bg-[#120808] ring-1 ring-rose-800/20"
              : isWarningFull
              ? "border-amber-900/40 bg-[#120e08]"
              : isSafeMode
              ? "border-emerald-900/40 bg-[#07120e]"
              : "border-white/[0.07] bg-zinc-900/50"
          }`}>
            {/* Map Header */}
            <div className={`flex items-center justify-between border-b px-5 py-3 ${
              isCrisis
                ? "border-rose-900/40 bg-rose-950/30"
                : isWarningFull
                ? "border-amber-900/30 bg-amber-950/20"
                : isSafeMode
                ? "border-emerald-900/30 bg-emerald-950/25"
                : "border-white/[0.06] bg-zinc-900/80"
            }`}>
              <div className="flex items-center gap-2.5">
                <span className={`h-2 w-2 rounded-full ${
                  isCrisis
                    ? "animate-pulse bg-rose-500"
                    : isWarningFull
                    ? "bg-amber-400"
                    : isSafeMode
                    ? "bg-emerald-400"
                    : "bg-teal-400"
                }`} />
                <div>
                  <h2 className="text-[12px] font-semibold tracking-tight text-zinc-100">
                    Peta Sebaran & Rute Rujukan Spasial — Jakarta
                  </h2>
                  <p className="text-[10px] text-zinc-500">
                    Korelasi koordinat rumah sakit jejaring & jalur evakuasi ambulans/pasien
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {simulationStep === 3 && (
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-300 ring-1 ring-emerald-500/30">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                    Rute Aktif
                  </span>
                )}
                {isCrisis && (
                  <span className="flex items-center gap-1.5 rounded-full bg-rose-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-rose-400 ring-1 ring-rose-500/30">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" />
                    HUB OVERLOAD
                  </span>
                )}
              </div>
            </div>

            {/* Azure Map Canvas */}
            <div className="relative min-h-[340px] w-full flex-1">
              <MriMap hospitals={hospitals} simulationStep={simulationStep} logRouting={logRouting} />
            </div>

            {/* Map Legend Footer (Rounded Gray Pill Badges) */}
            <div className={`flex flex-wrap items-center justify-between gap-2 border-t px-4 py-2.5 ${
              isCrisis
                ? "border-rose-900/30 bg-rose-950/20"
                : isSafeMode
                ? "border-emerald-900/30 bg-emerald-950/20"
                : "border-white/[0.06] bg-zinc-950/70"
            }`}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800/90 px-3 py-1 text-[11px] font-medium text-zinc-200 ring-1 ring-white/10">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#000080] ring-2 ring-white/80" />
                  Hub Utama
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800/90 px-3 py-1 text-[11px] font-medium text-zinc-200 ring-1 ring-white/10">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#10b981] ring-1 ring-white/60" />
                  Tersedia (OK)
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800/90 px-3 py-1 text-[11px] font-medium text-zinc-200 ring-1 ring-white/10">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b] ring-1 ring-white/60" />
                  Penuh (Full)
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800/90 px-3 py-1 text-[11px] font-medium text-zinc-200 ring-1 ring-white/10">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444] ring-1 ring-white/60" />
                  Overload
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800/90 px-3 py-1 text-[11px] font-medium text-zinc-200 ring-1 ring-white/10">
                  <span className="h-1 w-3.5 rounded-full bg-[#34d399]" />
                  Jalur Rujukan
                </span>
              </div>
              <span className="font-mono text-[10px] text-zinc-500">Azure Maps SDK</span>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            ROW 2: GUIDED AI PIPELINE (LEFT) & SARIMAX DECISION OUTPUT (RIGHT)
        ══════════════════════════════════════════ */}
        <section className="grid grid-cols-12 gap-4">

          {/* ── QUADRANT 3 (Bottom-Left): Guided AI Simulation Pipeline ── */}
          <div className={`col-span-12 flex flex-col justify-between rounded-xl border p-5 transition-colors duration-500 lg:col-span-5 ${
            isCrisis
              ? "border-rose-900/40 bg-rose-950/20"
              : isSafeMode
              ? "border-emerald-900/40 bg-[#07120e]"
              : "border-white/[0.07] bg-zinc-900/50"
          }`}>
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold tracking-tight text-zinc-100">
                    Alur Kendali Simulasi & Prediksi AI
                  </h3>
                  <p className="mt-0.5 text-[11px] text-zinc-400">
                    Jalankan tahapan secara berurutan untuk memproyeksikan beban MRI
                  </p>
                </div>
                <span className="rounded-md bg-white/[0.05] px-2.5 py-1 text-[10px] font-semibold tabular-nums text-zinc-300 ring-1 ring-white/10">
                  Step {simulationStep} / 3
                </span>
              </div>

              {/* TAHAP A: Prediksi & Time Travel */}
              <div className="space-y-3.5 rounded-lg border border-white/[0.06] bg-zinc-950/60 p-4">
                <div>
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold tabular-nums ${
                      simulationStep > 0
                        ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40"
                        : "bg-teal-500 text-zinc-950"
                    }`}>
                      {simulationStep > 0 ? "✓" : "1"}
                    </span>
                    <label className="text-xs font-semibold text-zinc-200">
                      Pilih Target Tanggal Prediksi
                    </label>
                  </div>

                  <p className="mb-2.5 pl-7 text-[11px] text-zinc-400">
                    Model SARIMAX akan menghitung estimasi kedatangan pasien MRI pada tanggal ini.
                  </p>

                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    onClick={(e) => {
                      try {
                        e.currentTarget.showPicker?.();
                      } catch {}
                    }}
                    disabled={simulationStep > 1}
                    className="w-full cursor-pointer rounded-lg border border-white/15 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-100 tabular-nums [color-scheme:dark] transition hover:border-teal-500/40 focus:border-teal-500/60 focus:outline-none focus:ring-1 focus:ring-teal-500/30 disabled:cursor-not-allowed disabled:opacity-30 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-85 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
                  />
                </div>

                <div className="grid grid-cols-1 gap-2.5 pt-1 sm:grid-cols-2">
                  {/* Tombol Step 1: Prediksi AI */}
                  <button
                    onClick={handleFetchPrediction}
                    disabled={simulationStep !== 0}
                    className={`flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold tracking-wide transition active:scale-[0.98] disabled:cursor-not-allowed ${
                      simulationStep === 0
                        ? "bg-teal-500/15 text-teal-300 ring-1 ring-teal-500/35 hover:bg-teal-500/25"
                        : "bg-zinc-800/40 text-zinc-600 ring-1 ring-white/5"
                    }`}
                  >
                    <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold tabular-nums ${
                      simulationStep === 0
                        ? "bg-teal-400 text-zinc-950"
                        : simulationStep > 0
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-zinc-700 text-zinc-400"
                    }`}>
                      {simulationStep > 0 ? "✓" : "1"}
                    </span>
                    <span>{loading && simulationStep === 0 ? "Menghitung…" : "Prediksi AI"}</span>
                  </button>

                  {/* Tombol Step 2: Time-Travel */}
                  <button
                    onClick={handleSetCurrentDay}
                    disabled={simulationStep !== 1}
                    className={`flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold tracking-wide transition active:scale-[0.98] disabled:cursor-not-allowed ${
                      simulationStep === 1
                        ? "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/35 hover:bg-amber-500/25"
                        : "bg-zinc-800/40 text-zinc-600 ring-1 ring-white/5"
                    }`}
                  >
                    <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold tabular-nums ${
                      simulationStep === 1
                        ? "bg-amber-400 text-zinc-950"
                        : simulationStep > 1
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-zinc-700 text-zinc-500"
                    }`}>
                      {simulationStep > 1 ? "✓" : "2"}
                    </span>
                    <span>{loading && simulationStep === 1 ? "Memuat DB…" : "Time-Travel"}</span>
                  </button>

                  {loading && (
                  <div className="flex items-center gap-2 rounded-md bg-teal-500/10 px-3 py-2 text-[11px] text-teal-200 ring-1 ring-teal-500/20">
                    <span className="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
                    <span>
                      Sedang memproses permintaan ke server AI & database, mohon tunggu sebentar…
                    </span>
                  </div>
                  )}
                </div>
              </div>

              {/* TAHAP B: Skenario Stress-Test */}
              <div className="mt-3 rounded-lg border border-white/[0.06] bg-zinc-950/60 p-4">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 shrink-0 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-xs font-semibold text-zinc-200">
                    Uji Skenario Beban (Stress-Test)
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-400">
                  <strong className="text-amber-300">Simulate Surge</strong> menyuntikkan lonjakan pasien darurat buatan ke Hub Fatmawati untuk menguji pengalihan otomatis. Klik <strong className="text-zinc-200">Normal / Reset</strong> untuk kembali ke kondisi awal.
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={handleSurgeSimulation}
                    disabled={loading || isCrisis}
                    className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-35 ${
                      isCrisis
                        ? "bg-rose-950 text-rose-400 ring-1 ring-rose-800"
                        : "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30 hover:bg-amber-500/25"
                    }`}
                  >
                    {isCrisis ? "● Surge Crisis Aktif" : "Simulate Surge (Lonjakan)"}
                  </button>
                  <button
                    onClick={handleResetSimulation}
                    disabled={loading}
                    className="rounded-lg bg-zinc-800/80 px-3.5 py-2 text-xs font-medium text-zinc-300 ring-1 ring-white/10 transition hover:bg-zinc-700 hover:text-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    Normal / Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex gap-1.5">
                {[0, 1, 2, 3].map((s) => (
                  <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                    simulationStep > s ? "bg-emerald-400" : simulationStep === s ? "bg-emerald-400/40" : "bg-white/10"
                  }`} />
                ))}
              </div>
            </div>
          </div>

          {/* ── QUADRANT 4 (Bottom-Right): AI Forecast & Spatial Decision Intelligence ── */}
          <div className={`col-span-12 flex flex-col justify-between rounded-xl border p-5 transition-colors duration-500 lg:col-span-7 ${
            isCrisis
              ? "border-rose-900/40 bg-[#120808]"
              : isSafeMode
              ? "border-emerald-900/40 bg-[#07120e]"
              : "border-white/[0.07] bg-zinc-900/50"
          }`}>
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold tracking-tight text-zinc-100">
                    Hasil Analisis SARIMAX & Rekomendasi Keputusan Spasial
                  </h3>
                  <p className="mt-0.5 text-[11px] text-zinc-400">
                    Evaluasi kapasitas Hub Utama (RSUP Fatmawati) dan log distribusi rujukan pasien
                  </p>
                </div>
                <span className={`rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  isSafeMode
                    ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30"
                    : isCrisis
                    ? "bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/30"
                    : isWarningFull
                    ? "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30"
                    : "bg-white/[0.05] text-zinc-400"
                }`}>
                  {stepLabels[simulationStep]}
                </span>
              </div>

              {/* 3 Mini Metric Cards */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-white/[0.06] bg-zinc-950/70 p-3.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                    Prediksi SARIMAX
                  </span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold tracking-tight text-zinc-100 tabular-nums">
                      {aiPrediction !== null ? aiPrediction : "—"}
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      {aiPrediction !== null ? "pasien" : "belum dihitung"}
                    </span>
                  </div>
                </div>

                <div className="rounded-lg border border-white/[0.06] bg-zinc-950/70 p-3.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                    Okupansi Hub Fatmawati
                  </span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className={`text-2xl font-bold tracking-tight tabular-nums ${
                      hubOccupancy > hubCapacity ? "text-rose-400" : hubOccupancy === hubCapacity ? "text-amber-300" : "text-emerald-300"
                    }`}>
                      {hubOccupancy}
                    </span>
                    <span className="text-[11px] text-zinc-400 tabular-nums">
                      / {hubCapacity} kapasitas
                    </span>
                  </div>
                </div>

                <div className="rounded-lg border border-white/[0.06] bg-zinc-950/70 p-3.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                    Margin Kapasitas Hub
                  </span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className={`text-2xl font-bold tracking-tight tabular-nums ${
                      hubDelta < 0 ? "text-rose-400" : hubDelta === 0 ? "text-amber-400" : "text-emerald-400"
                    }`}>
                      {hubDelta < 0 ? `${hubDelta}` : `+${hubDelta}`}
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      {hubDelta < 0 ? "overload" : "slot aman"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Dual-Box: Insight AI (Atas) & Panduan Aksi (Bawah) */}
              <div className="mt-4 space-y-3">

                {/* STEP 0: IDLE */}
                {simulationStep === 0 && (
                  <>
                    <div className="rounded-lg border border-white/[0.06] bg-zinc-950/60 p-4">
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <p className="text-xs font-semibold text-zinc-200">
                          Status Sistem: Siap Melakukan Proyeksi Beban
                        </p>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
                        Model deret waktu <strong className="text-zinc-200">SARIMAX</strong> siap memprediksi volume harian pasien pemindaian MRI di Hub Utama <strong className="text-zinc-200">RSUP Fatmawati</strong> (kapasitas maksimal {hubCapacity} pasien/hari).
                      </p>
                    </div>

                    <div className="rounded-lg border border-white/[0.06] bg-zinc-900/80 p-3.5">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                        Panduan Langkah Berikutnya
                      </p>
                      <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-zinc-300">
                        <span>Pilih tanggal pada panel kiri lalu klik</span>
                        <span className="inline-flex items-center gap-1 rounded bg-teal-500/15 px-2 py-0.5 text-[11px] font-semibold text-teal-300 ring-1 ring-teal-500/30">
                          <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-teal-400 text-[9px] font-bold text-zinc-950">1</span>
                          Prediksi AI
                        </span>
                        <span>atau klik <strong className="text-amber-300">Simulate Surge</strong> untuk simulasi darurat.</span>
                      </p>
                    </div>
                  </>
                )}

                {/* STEP 1: PREDIKSI SIAP (Dual-Box: Insight + Next Step) */}
                {simulationStep === 1 && (
                  <>
                    {/* Box 1: Analytical AI Insight */}
                    <div className="rounded-lg border border-teal-500/25 bg-teal-950/25 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <svg className="h-4 w-4 shrink-0 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <p className="text-xs font-bold text-teal-300">
                            Insight Prediksi SARIMAX ({aiPrediction} Pasien pada {targetDate})
                          </p>
                        </div>
                        <span className="rounded bg-teal-500/15 px-2 py-0.5 text-[10px] font-bold tabular-nums text-teal-300 ring-1 ring-teal-500/30">
                          {Math.round(((aiPrediction ?? 0) / hubCapacity) * 100)}% dari Kapasitas Hub
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-zinc-200">
                        AI memproyeksikan akan ada <strong className="text-teal-300">{aiPrediction} pasien</strong> yang membutuhkan layanan MRI di RSUP Fatmawati pada tanggal <strong className="text-white">{targetDate}</strong>.{" "}
                        {(aiPrediction ?? 0) > hubCapacity
                          ? `Angka ini melampaui batas maksimal ${hubCapacity} slot/hari dan berisiko tinggi memicu antrean berlebih.`
                          : (aiPrediction ?? 0) === hubCapacity
                          ? `Angka ini menyentuh batas maksimal ${hubCapacity} slot/hari (utilisasi penuh tanpa margin cadangan).`
                          : `Volume kedatangan ini masih berada di bawah batas maksimal ${hubCapacity} slot/hari (tersisa estimasi ${hubCapacity - (aiPrediction ?? 0)} slot kosong).`}
                      </p>
                    </div>

                    {/* Box 2: Next-Step Action Guide */}
                    <div className="rounded-lg border border-amber-500/20 bg-zinc-950/70 p-3.5">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                        Panduan Langkah Berikutnya
                      </p>
                      <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs leading-relaxed text-zinc-300">
                        <span>Klik tombol</span>
                        <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-300 ring-1 ring-amber-500/30">
                          <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400 text-[9px] font-bold text-zinc-950">2</span>
                          Time-Travel
                        </span>
                        <span>di panel kiri untuk menyinkronkan okupansi seluruh rumah sakit ke tanggal tersebut dan memvalidasi status kapasitas Hub.</span>
                      </p>
                    </div>
                  </>
                )}

                {/* STEP 2A: KRISIS OVERLOAD (> 55) */}
                {simulationStep === 2 && isHubOverload && (
                  <>
                    <div className="rounded-lg border border-rose-500/35 bg-rose-950/35 p-4">
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div>
                          <p className="text-xs font-bold text-rose-300">
                            KRISIS OVERLOAD TERDETEKSI DI HUB FATMAWATI
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-rose-100/85">
                            Okupansi aktual ({hubOccupancy} pasien) melampaui kapasitas maksimal ({hubCapacity} slot). Terdapat <strong className="text-white">{hubOccupancy - hubCapacity} pasien berlebih</strong> yang harus segera didistribusikan ke RS Satelit terdekat.
                          </p>
                        </div>
                        <button
                          onClick={handleLoadBalancing}
                          disabled={loading}
                          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-teal-400 px-4 py-2.5 text-xs font-bold text-zinc-950 shadow-lg shadow-teal-500/20 transition hover:bg-teal-300 active:scale-95 disabled:opacity-40"
                        >
                          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-zinc-950 text-[10px] font-bold text-teal-300">
                            3
                          </span>
                          <span>{loading ? "Memproses Rute…" : "Eksekusi Spatial Router"}</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* STEP 2B: KAPASITAS PAS 55 (KUNING / SIAGA) */}
                {simulationStep === 2 && isHubFull && (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-950/25 p-4">
                    <p className="text-xs font-bold text-amber-300">
                      KAPASITAS HUB PENUH (SIAGA — {hubOccupancy}/{hubCapacity} PASIEN)
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-amber-100/85">
                      Seluruh slot MRI di RSUP Fatmawati terisi penuh (100%), namun <strong>belum ada pasien berlebih</strong> yang perlu dialihkan ke rumah sakit satelit. Sistem tetap dalam status Siaga tanpa memicu <em>Crisis Mode</em>.
                    </p>
                  </div>
                )}

                {/* STEP 2C: KAPASITAS AMAN (< 55 / HIJAU) */}
                {simulationStep === 2 && !isHubOverload && !isHubFull && (
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/25 p-4">
                    <p className="text-xs font-bold text-emerald-300">
                      KAPASITAS HUB AMAN ({hubOccupancy}/{hubCapacity} PASIEN)
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-emerald-100/85">
                      RSUP Fatmawati masih memiliki <strong>{hubCapacity - hubOccupancy} slot MRI tersedia</strong>. Seluruh permintaan pasien dapat ditangani secara mandiri tanpa perlu pengalihan rujukan.
                    </p>
                  </div>
                )}

                {/* STEP 3: ROUTER AKTIF + RINGKASAN + TABEL DETAIL PASIEN */}
                {simulationStep === 3 && (
                  <div className="space-y-3 rounded-lg border border-emerald-500/25 bg-emerald-950/20 p-4">
                    <div>
                      <p className="text-xs font-bold text-emerald-300">
                        Pengalihan Rujukan Berhasil — Lihat Rute Hijau di Peta Atas
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-zinc-300">
                        Algoritma telah menghitung rute jalan tercepat dari RSUP Fatmawati menuju rumah sakit satelit dengan kapasitas tersedia. Perhatikan <strong className="text-emerald-300">garis rute berwarna hijau</strong> pada peta spasial di kanan atas.
                      </p>
                    </div>

                    {/* Ringkasan per RS Tujuan */}
                    {routingSummary.length > 0 && (
                      <div className="border-t border-emerald-500/15 pt-3">
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                          Ringkasan Distribusi Rujukan ({logRouting.length} Pasien)
                        </p>
                        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                          {routingSummary.map(([hospitalName, count], idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between rounded-md bg-zinc-950/75 px-3 py-1.5 text-[11px] ring-1 ring-white/[0.06]"
                            >
                              <span className="truncate pr-2 font-medium text-zinc-200">{hospitalName}</span>
                              <span className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-bold tabular-nums ${
                                hospitalName.toLowerCase() === "gagal dialihkan"
                                  ? "bg-rose-500/15 text-rose-400"
                                  : "bg-emerald-500/15 text-emerald-300"
                              }`}>
                                {count} pasien
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tabel Scrollable Detail Perpindahan Pasien */}
                    {Array.isArray(logRouting) && logRouting.length > 0 && (
                      <div className="border-t border-emerald-500/15 pt-3">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                            Log Detail Pemindahan Pasien
                          </p>
                          <span className="text-[10px] tabular-nums text-zinc-500">
                            Scroll untuk melihat semua ({logRouting.length})
                          </span>
                        </div>

                        <div className="max-h-[165px] overflow-y-auto rounded-lg border border-white/[0.07] bg-zinc-950/85">
                          <table className="w-full border-collapse text-left">
                            <thead className="sticky top-0 z-10 bg-zinc-900/95 backdrop-blur-sm">
                              <tr className="border-b border-white/[0.07] text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                <th className="px-3 py-2">No</th>
                                <th className="px-3 py-2">Identitas Pasien</th>
                                <th className="px-3 py-2">Rumah Sakit Tujuan</th>
                                <th className="px-3 py-2 text-right">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.04] text-[11px]">
                              {logRouting.map((item, idx) => {
                                const patientLabel =
                                  item.nama_pasien ||
                                  item.id_pasien ||
                                  item.pasien_id ||
                                  `Pasien Rujukan #${idx + 1}`;
                                const destHospital = item.rs_tujuan || "Tidak Diketahui";
                                const isFailed = destHospital.toLowerCase() === "gagal dialihkan";

                                return (
                                  <tr key={idx} className="transition-colors hover:bg-white/[0.02]">
                                    <td className="px-3 py-2 tabular-nums text-zinc-500">
                                      {idx + 1}
                                    </td>
                                    <td className="px-3 py-2 font-medium text-zinc-200">
                                      {patientLabel}
                                      {item.jarak_km && (
                                        <span className="ml-1.5 text-[10px] tabular-nums text-zinc-500">
                                          ({item.jarak_km} km)
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-3 py-2 text-zinc-300">
                                      {destHospital}
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                      <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                        isFailed
                                          ? "bg-rose-500/15 text-rose-400"
                                          : "bg-emerald-500/15 text-emerald-300"
                                      }`}>
                                        {isFailed ? "Tertahan" : "Dialihkan"}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
