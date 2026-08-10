// Label + control wrapper used across checkout and admin forms.
export default function Field({ label, hint, children }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-gray-700">
      {label}
      {children}
      {hint && <span className="text-xs font-normal text-gray-500">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";
