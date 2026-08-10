export default function CartSummary({ subtotalCents }) {
  return (
    <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 text-base font-semibold text-gray-900">
      <span>Subtotal</span>
      <span>KSh {(subtotalCents / 100).toLocaleString()}</span>
    </div>
  );
}
