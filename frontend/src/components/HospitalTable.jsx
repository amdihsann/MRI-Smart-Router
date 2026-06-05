import React from "react";

export default function HospitalTable({ hospitals, simulationStep, onTriggerLoadBalance }) {
  const coreRsIds = ["RS_018", "RS_012", "RS_015", "RS_016", "RS_011"];

  const sortedHospitals = hospitals && hospitals.length > 0 
    ? [...hospitals].sort((a, b) => {
        if (a.id_rs === "RS_018") return -1;
        if (b.id_rs === "RS_018") return 1;

        // 2. RS Core lainnya harus berada di atas RS hasil ekspansi database lainnya
        const aIsCore = coreRsIds.includes(a.id_rs);
        const bIsCore = coreRsIds.includes(b.id_rs);

        if (aIsCore && !bIsCore) return -1;
        if (!aIsCore && bIsCore) return 1;

        // 3. Jika sesama RS Core atau sesama RS luar, urutkan berdasarkan ID
        return a.id_rs.localeCompare(b.id_rs);
      })
    : [];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white">Live Facility Tracker</h3>
        {/* Tombol Spasial Router */}
        {simulationStep === 2 && (
          <button 
            onClick={onTriggerLoadBalance}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-4 rounded-lg text-sm transition animate-bounce"
          >
            ⚖️ Eksekusi Spasial Router
          </button>
        )}
      </div>

      {/* Kontainer Scroll Luar */}
      <div className="max-h-[380px] overflow-y-auto pr-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
              <th className="py-3 px-2">Nama Rumah Sakit</th>
              <th className="py-3 px-2 text-center">Kapasitas</th>
              <th className="py-3 px-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-sm">
            {sortedHospitals.map((rs) => {
              // Hitung kondisi keterisian secara matematis
              const isOverload = rs.current_occupancy > rs.max_capacity;
              const isFull = rs.current_occupancy === rs.max_capacity;

              // Tentukan string kelas warna kapasitas secara aman
              const capacityColorClass = isOverload ? "text-red-400 font-bold" : "text-slate-300";

              // Tentukan string kelas warna badge secara aman (Menghindari kebocoran Boolean true)
              let badgeClass = "px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
              let badgeText = "Available";

              if (isOverload) {
                badgeClass = "px-2 py-0.5 rounded text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20";
                badgeText = "Overload";
              } else if (isFull) {
                badgeClass = "px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20";
                badgeText = "Full";
              }

              return (
                <tr key={rs.id_rs} className="hover:bg-slate-800/30 transition">
                  {/* Kolom Nama RS */}
                  <td className="py-3 px-2 font-medium text-slate-200">
                    {rs.nama_rs} 
                    {rs.id_rs === "RS_018" && (
                      <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded ml-2">
                        HUB
                      </span>
                    )}
                  </td>
                  
                  {/* Kolom Kapasitas Keterisian */}
                  <td className="py-3 px-2 text-center text-slate-300">
                    <span className={capacityColorClass}>
                      {rs.current_occupancy}
                    </span>
                    <span className="text-slate-500"> / {rs.max_capacity}</span>
                  </td>
                  
                  {/* Kolom Badge Status */}
                  <td className="py-3 px-2 text-center">
                    <span className={badgeClass}>
                      {badgeText}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}