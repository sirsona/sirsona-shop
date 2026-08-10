import AddToCartButton from "@/app/components/AddToCartButton";
import { apiFetch } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const product = await apiFetch(`/api/products/${slug}`);
    return {
      title: product.name,
      description:
        product.description ||
        `KSh ${(product.price_cents / 100).toLocaleString()}`,
      openGraph: {
        title: product.name,
        description: product.description,
      },
    };
  } catch {
    return { title: "Product not found" };
  }
}

export default async function ProductDetail({ params }) {
  const { slug } = await params;

  try {
    const product = await apiFetch(`/api/products/${slug}`);

    if (!product || product.error) {
      notFound();
    }

    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-black transition">
            Home
          </Link>
          <span>›</span>
          <Link href="/products" className="hover:text-black transition">
            Products
          </Link>
          <span>›</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        {/* Main Layout — 2 columns on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Left: Image Column */}
          <div className="bg-gray-50 rounded-2xl overflow-hidden aspect-square relative">
            <Image
              src={product.image_url || "/placeholder.png"}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>

          {/* Right: Info Column */}
          <div className="flex flex-col space-y-6">
            {/* Title & Category */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
                {product.name}
              </h1>
              <p className="text-sm text-gray-500 mt-1 uppercase tracking-wide">
                {product.category || "Product"}
              </p>
            </div>

            {/* Price */}
            <div className="border-t border-b border-gray-200 py-4">
              <p className="text-3xl font-semibold text-gray-900">
                KSh {(product.price_cents / 100).toLocaleString()}
              </p>
            </div>

            {/* Stock & Description */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    product.stock > 0
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {product.stock > 0
                    ? `In Stock (${product.stock})`
                    : "Out of Stock"}
                </span>
              </div>

              {product.description && (
                <p className="text-gray-600 leading-relaxed text-base">
                  {product.description}
                </p>
              )}
            </div>

            {/* Add to Cart Button */}
            <div className="pt-4">
              <AddToCartButton productId={product.id} stock={product.stock} />
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching product:", error);
    notFound();
  }
}
