import Skeleton from "@/app/components/ui/Skeleton";

export default function ProductsLoading() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      {/* Header */}
      <div className="mb-10 flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-64" />
          <Skeleton className="mt-3 h-4 w-96" />
        </div>
        <Skeleton className="h-4 w-20" />
      </div>

      {/* Category pills */}
      <div className="mb-8 flex flex-wrap gap-2">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>

      {/* Product grid */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
            <div className="mt-5">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="mt-2 h-6 w-1/3" />
              <Skeleton className="mt-3 h-5 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
