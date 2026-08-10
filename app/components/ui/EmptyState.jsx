// Friendly empty state: icon + title + copy + optional CTA(s).
export default function EmptyState({ icon, title, copy, children }) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-gray-50 py-16 text-center">
      <div className="text-5xl">{icon}</div>
      <h2 className="mt-4 text-xl font-semibold text-gray-900">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-gray-600">{copy}</p>
      {children && (
        <div className="mt-6 flex justify-center gap-3">{children}</div>
      )}
    </div>
  );
}
