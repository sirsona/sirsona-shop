const COLORS = {
  paid: "bg-green-100 text-green-700",
  delivered: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-600",
  shipped: "bg-blue-100 text-blue-700",
};

// Color-coded status pill. Unknown statuses fall back to neutral gray.
export default function Badge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
        COLORS[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}
