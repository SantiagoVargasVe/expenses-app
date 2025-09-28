import * as React from "react";
import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center rounded-md px-4 py-2 text-body-bold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

    const variants: Record<typeof variant, string> = {
      primary:
        "bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500",
      secondary:
        "bg-neutral-100 text-neutral-800 hover:bg-neutral-200 focus:ring-neutral-400",
      ghost: "text-neutral-700 hover:bg-neutral-100 focus:ring-neutral-300",
    };

    return (
      <button
        ref={ref}
        className={clsx(base, variants[variant], className)}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
