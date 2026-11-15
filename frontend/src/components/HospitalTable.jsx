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

  const overloadCount = sortedHospitals.filter(rs => rs.current_occupancy > rs.max_capacity).length;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-800 bg-[#111827]">

      {/* Panel header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-200">Live Hospital Capacity Directory</h2>
          <p className="mt-0.5 text-[11px] text-slate-500">
            <span className="tabular-nums">{sortedHospitals.length}</span> facilities — Real-time MRI unit occupancy across Jakarta
            {overloadCount > 0 && (
              <> &middot; <span className="font-medium tabular-nums text-rose-400">{overloadCount} RS overload</span></>
            )}
          </p>
        </div>

        {simulationStep === 2 && overloadCount > 0 && (
          <button
            onClick={onTriggerLoadBalance}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-teal-500/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-teal-300 ring-1 ring-teal-500/30 transition hover:bg-teal-500/25 hover:text-teal-200 active:scale-95"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-400" />
            Routing Otomatis
          </button>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto" style={{ maxHeight: "420px" }}>
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-[#111827]">
            <tr className="border-b border-slate-800">
              <th className="px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">Facility</th>
              <th className="px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-600">Occ / Cap</th>
              <th className="px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedHospitals.map((rs) => {
              const isOverload = rs.current_occupancy > rs.max_capacity;
              const isFull = rs.current_occupancy === rs.max_capacity;
              const isHub = rs.id_rs === "RS_018";
              const fillPct = Math.min((rs.current_occupancy / rs.max_capacity) * 100, 100);

              const rowBg = isHub
                ? "bg-blue-950/20 hover:bg-blue-950/30"
                : isOverload
                  ? "bg-rose-950/10 hover:bg-rose-950/20"
                  : "hover:bg-slate-800/30";

              const occColor = isOverload
                ? "text-rose-400"
                : isFull
                  ? "text-amber-400"
                  : "text-slate-300";

              let badgeClass, badgeText;
              if (isOverload) { badgeClass = "bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20"; badgeText = "OVERLOAD"; }
              else if (isFull) { badgeClass = "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20"; badgeText = "FULL"; }
              else { badgeClass = "bg-emerald-500/8 text-emerald-400 ring-1 ring-emerald-500/15"; badgeText = "OK"; }

              return (
                <tr key={rs.id_rs} className={`border-b border-slate-800/40 transition-colors ${rowBg}`}>
                  {/* Facility name */}
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-medium leading-snug text-slate-300">
                        {rs.nama_rs}
                      </span>
                      {isHub && (
                        <span className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-blue-400 ring-1 ring-blue-500/25 bg-blue-500/10">
                          HUB
                        </span>
                      )}
                    </div>
                    {/* Capacity micro-bar */}
                    <div className="mt-1.5 h-[3px] w-full overflow-hidden rounded-full bg-slate-800/80">
                      <div
                        className={`h-[3px] rounded-full transition-all duration-500 ${isOverload ? "bg-rose-500" : isFull ? "bg-amber-500" : "bg-emerald-500/60"}`}
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                  </td>

                  {/* Occupancy / Capacity */}
                  <td className="px-3 py-2.5 text-center">
                    <span className={`text-[12px] tabular-nums font-semibold ${occColor}`}>
                      {rs.current_occupancy}
                    </span>
                    <span className="text-[11px] tabular-nums text-slate-700"> / {rs.max_capacity}</span>
                  </td>

                  {/* Status badge */}
                  <td className="px-3 py-2.5 text-center">
                    <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${badgeClass}`}>
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
