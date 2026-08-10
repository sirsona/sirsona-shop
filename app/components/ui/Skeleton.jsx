// Skeleton block — gray pulsing placeholder used by loading states.
export default function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse rounded-lg bg-gray-100 ${className}`} />
  );
}
