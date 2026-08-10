// Standard page heading: title + optional subtitle + optional right slot.
export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          {title}
        </h1>
        {subtitle && <p className="mt-2 text-gray-600">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
