import Skeleton from "@/app/components/ui/Skeleton";

export default function ProductDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* Breadcrumb */}
      <Skeleton className="mb-8 h-4 w-64" />

      {/* Product layout — 2 columns on desktop */}
      <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-2">
        {/* Left: image */}
        <Skeleton className="aspect-square w-full rounded-2xl" />

        {/* Right: details */}
        <div className="flex flex-col space-y-6">
          <div>
            <Skeleton className="h-9 w-4/5" />
            <Skeleton className="mt-2 h-3 w-24" />
          </div>

          <div className="border-y border-gray-200 py-4">
            <Skeleton className="h-8 w-40" />
          </div>

          <Skeleton className="h-5 w-28 rounded-full" />

          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[95%]" />
            <Skeleton className="h-4 w-3/5" />
          </div>

          <Skeleton className="h-12 w-48 rounded-full" />
        </div>
      </div>
    </div>
  );
}
