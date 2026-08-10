import Image from "next/image";
import Link from "next/link";

// Product card used on the products grid and the home featured section.
export default function ProductCard({ product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-gray-100">
        <Image
          src={product.image_url || "/placeholder.png"}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
      </div>

      <div className="mt-5">
        <h2 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-700">
          {product.name}
        </h2>

        <p className="mt-2 text-xl font-bold text-gray-900">
          KSh {(product.price_cents / 100).toLocaleString()}
        </p>

        {product.stock === 0 ? (
          <span className="mt-3 inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
            Out of stock
          </span>
        ) : (
          <span className="mt-3 inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
            {product.stock} in stock
          </span>
        )}
      </div>
    </Link>
  );
}
