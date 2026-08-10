"use client";

export default function PaystackCheckoutButton({ pending }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className={
        "w-full rounded-full px-6 py-3 text-sm font-bold transition disabled:cursor-default disabled:opacity-70 " +
        "bg-[#00C3F7] text-black hover:brightness-95"
      }
    >
      {pending ? "Redirecting to Paystack..." : "Pay with Paystack"}
    </button>
  );
}
