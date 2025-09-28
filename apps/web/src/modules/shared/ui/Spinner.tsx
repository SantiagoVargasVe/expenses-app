import clsx from "clsx";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
}

export function Spinner({ size = "md" }: SpinnerProps) {
  const sizes: Record<typeof size, string> = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-10 w-10 border-4",
  };

  return (
    <span
      className={clsx(
        "text-brand-600 inline-block animate-spin rounded-full border-current border-t-transparent",
        sizes[size],
      )}
      role="status"
      aria-label="Loading"
    />
  );
}
