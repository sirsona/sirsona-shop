// app/products/[slug]/loading.js
export default function ProductDetailLoading() {
  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "2rem" }}>
      {/* Skeleton for breadcrumb */}
      <div
        style={{
          height: 16,
          background: "#eee",
          borderRadius: 4,
          width: "40%",
          marginBottom: "1.5rem",
        }}
      />

      {/* Skeleton for the product layout (2‑column grid) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2rem",
        }}
      >
        {/* Left: Product image skeleton */}
        <div
          style={{
            width: "100%",
            aspectRatio: "1 / 1",
            background: "#eee",
            borderRadius: 8,
          }}
        />

        {/* Right: Product details skeleton */}
        <div>
          {/* Title skeleton */}
          <div
            style={{
              height: 32,
              background: "#eee",
              borderRadius: 4,
              width: "80%",
              marginBottom: "0.5rem",
            }}
          />

          {/* Price skeleton */}
          <div
            style={{
              height: 24,
              background: "#eee",
              borderRadius: 4,
              width: "50%",
              marginBottom: "0.5rem",
            }}
          />

          {/* Stock status skeleton */}
          <div
            style={{
              height: 16,
              background: "#eee",
              borderRadius: 4,
              width: "35%",
              marginBottom: "1rem",
            }}
          />

          {/* Description skeleton (3 lines) */}
          <div style={{ marginTop: "1rem" }}>
            <div
              style={{
                height: 14,
                background: "#eee",
                borderRadius: 4,
                width: "100%",
                marginBottom: 8,
              }}
            />
            <div
              style={{
                height: 14,
                background: "#eee",
                borderRadius: 4,
                width: "95%",
                marginBottom: 8,
              }}
            />
            <div
              style={{
                height: 14,
                background: "#eee",
                borderRadius: 4,
                width: "60%",
              }}
            />
          </div>

          {/* Add to cart button skeleton */}
          <div
            style={{
              height: 48,
              background: "#eee",
              borderRadius: 4,
              width: "100%",
              marginTop: "1.5rem",
            }}
          />
        </div>
      </div>
    </div>
  );
}
