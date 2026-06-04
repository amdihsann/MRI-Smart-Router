export default function MetricsCard({ title, value, status }) {
  const statusColor = {
    danger: "text-red-600 bg-red-50 border-red-200",
    success: "text-green-600 bg-green-50 border-green-200",
    warning: "text-amber-600 bg-amber-50 border-amber-200"
  };

  return (
    <div className={`p-4 border rounded-xl shadow-sm ${statusColor[status] || "bg-white text-gray-800"}`}>
      <p className="text-sm font-medium opacity-80">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}