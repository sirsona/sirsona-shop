import Link from "next/link";

const VARIANTS = {
  primary:
    "rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-default disabled:opacity-60",
  outline:
    "rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:text-gray-900 disabled:cursor-default disabled:opacity-60",
  danger:
    "rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-default disabled:opacity-60",
  ghost:
    "rounded-full px-4 py-2 text-sm font-medium text-gray-600 transition hover:text-gray-900 disabled:cursor-default disabled:opacity-60",
};

// Renders a Link when `href` is provided, otherwise a <button>.
export default function Button({
  href,
  variant = "primary",
  className = "",
  children,
  ...rest
}) {
  const classes = `${VARIANTS[variant] || VARIANTS.primary} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
