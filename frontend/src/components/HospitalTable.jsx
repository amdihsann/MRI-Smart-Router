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
    <div className="flex flex-col overflow-hidden rounded-xl border border-white/[0.07] bg-zinc-900/50">

      {/* Panel header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-[12px] font-semibold tracking-tight text-zinc-200">Live Facility Tracker</h3>
            <p className="text-[10px] text-zinc-600">
              <span className="tabular-nums">{sortedHospitals.length}</span> fasilitas &middot;&nbsp;
              {overloadCount > 0 && (
                <span className="text-rose-500 tabular-nums">{overloadCount} overload</span>
              )}
            </p>
          </div>
        </div>

        {simulationStep === 2 && (
          <button
            onClick={onTriggerLoadBalance}
            className="flex items-center gap-2 rounded-lg bg-teal-500/10 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-teal-300 ring-1 ring-teal-500/25 transition hover:bg-teal-500/20 hover:text-teal-200 active:scale-95"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-400" />
            Eksekusi Spasial Router
          </button>
        )}
      </div>

      {/* Table */}
      <div className="max-h-[320px] overflow-y-auto">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-zinc-900/95 backdrop-blur-sm">
            <tr className="border-b border-white/[0.05]">
              <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-600">Fasilitas</th>
              <th className="px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-widest text-zinc-600">Occ / Cap</th>
              <th className="px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-widest text-zinc-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedHospitals.map((rs) => {
              const isOverload = rs.current_occupancy > rs.max_capacity;
              const isFull     = rs.current_occupancy === rs.max_capacity;
              const isHub      = rs.id_rs === "RS_018";
              const fillPct    = Math.min((rs.current_occupancy / rs.max_capacity) * 100, 100);

              const rowBg = isHub
                ? "bg-blue-950/20 hover:bg-blue-950/30"
                : isOverload
                ? "bg-rose-950/15 hover:bg-rose-950/25"
                : "hover:bg-white/[0.02]";

              const occColor = isOverload
                ? "text-rose-400"
                : isFull
                ? "text-amber-400"
                : "text-zinc-300";

              let badgeClass, badgeText;
              if (isOverload)     { badgeClass = "bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20";     badgeText = "Overload"; }
              else if (isFull)    { badgeClass = "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20"; badgeText = "Full";     }
              else                { badgeClass = "bg-teal-500/10 text-teal-400 ring-1 ring-teal-500/15";    badgeText = "OK";       }

              return (
                <tr key={rs.id_rs} className={`border-b border-white/[0.04] transition-colors ${rowBg}`}>
                  {/* Facility name */}
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-medium leading-snug text-zinc-300">
                        {rs.nama_rs}
                      </span>
                      {isHub && (
                        <span className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-blue-400 ring-1 ring-blue-500/25 bg-blue-500/10">
                          HUB
                        </span>
                      )}
                    </div>
                    {/* Capacity micro-bar */}
                    <div className="mt-1 h-px w-full overflow-hidden rounded-full bg-white/5">
                      <div
                        className={`h-px rounded-full transition-all duration-500 ${isOverload ? "bg-rose-500" : isFull ? "bg-amber-500" : "bg-teal-500/60"}`}
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                  </td>

                  {/* Occupancy / Capacity */}
                  <td className="px-3 py-2.5 text-center">
                    <span className={`text-[12px] tabular-nums font-semibold ${occColor}`}>
                      {rs.current_occupancy}
                    </span>
                    <span className="text-[11px] tabular-nums text-zinc-700"> / {rs.max_capacity}</span>
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
