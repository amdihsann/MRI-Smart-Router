export default function MetricsCard({ title, value, unit, status, fill }) {
  const themes = {
    danger: {
      card: "border-rose-900/50 bg-rose-950/25",
      label: "text-rose-600",
      value: "text-rose-300",
      unit: "text-rose-500/70",
      dot: "bg-rose-500",
      bar: "bg-rose-500",
      track: "bg-rose-950/60",
    },
    success: {
      card: "border-white/[0.07] bg-zinc-900/50",
      label: "text-zinc-600",
      value: "text-teal-300",
      unit: "text-teal-600",
      dot: "bg-teal-500",
      bar: "bg-teal-500",
      track: "bg-zinc-800",
    },
    warning: {
      card: "border-amber-900/40 bg-amber-950/20",
      label: "text-amber-600/80",
      value: "text-amber-300",
      unit: "text-amber-600/70",
      dot: "bg-amber-500",
      bar: "bg-amber-500",
      track: "bg-amber-950/60",
    },
    normal: {
      card: "border-white/[0.07] bg-zinc-900/50",
      label: "text-zinc-600",
      value: "text-zinc-200",
      unit: "text-zinc-600",
      dot: "bg-zinc-600",
      bar: "bg-zinc-600",
      track: "bg-zinc-800",
    },
  };

  const t = themes[status] || themes.normal;

  return (
    <div className={`relative overflow-hidden rounded-xl border p-4 ${t.card}`}>
      {/* Header row */}
      <div className="mb-2 flex items-center justify-between">
        <p className={`text-[10px] font-bold uppercase tracking-widest ${t.label}`}>
          {title}
        </p>
        <span className={`h-1.5 w-1.5 rounded-full ${t.dot} ${status === "danger" ? "animate-pulse" : ""}`} />
      </div>

      {/* Value — tabular-nums for mechanical precision */}
      <p className={`text-3xl font-bold tabular-nums tracking-tight leading-none ${t.value}`}>
        {value}
      </p>
      {unit && (
        <p className={`mt-1 text-[11px] font-medium ${t.unit}`}>{unit}</p>
      )}

      {/* Optional fill bar (hub capacity) */}
      {fill !== undefined && (
        <div className="mt-3">
          <div className={`h-1 w-full overflow-hidden rounded-full ${t.track}`}>
            <div
              className={`h-1 rounded-full transition-all duration-700 ${t.bar}`}
              style={{ width: `${fill}%` }}
            />
          </div>
          <p className={`mt-1 text-right text-[10px] tabular-nums ${t.unit}`}>{fill}% kapasitas</p>
        </div>
      )}
    </div>
  );
}
