"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";
type Theme = "coral" | "team";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  theme?: Theme;
  loading?: boolean;
  fullWidth?: boolean;
}

const base =
  "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none";

const sizes: Record<Size, string> = {
  sm: "text-sm px-3 py-1.5 gap-1.5",
  md: "text-base px-5 py-3 gap-2",
  lg: "text-lg px-7 py-4 gap-2",
};

const variants: Record<Theme, Record<Variant, string>> = {
  coral: {
    primary:
      "bg-coral-500 text-white hover:bg-coral-600 active:bg-coral-700 focus-visible:ring-coral-500",
    secondary:
      "bg-coral-50 text-coral-700 hover:bg-coral-100 active:bg-coral-200 focus-visible:ring-coral-300",
    ghost:
      "text-coral-600 hover:bg-coral-50 active:bg-coral-100 focus-visible:ring-coral-300",
    danger:
      "bg-error-500 text-white hover:opacity-90 active:opacity-80 focus-visible:ring-error-500",
  },
  team: {
    primary:
      "bg-team-500 text-white hover:bg-team-600 active:bg-team-700 focus-visible:ring-team-500",
    secondary:
      "bg-team-50 text-team-700 hover:bg-team-100 active:bg-team-200 focus-visible:ring-team-300",
    ghost:
      "text-team-600 hover:bg-team-50 active:bg-team-100 focus-visible:ring-team-300",
    danger:
      "bg-error-500 text-white hover:opacity-90 active:opacity-80 focus-visible:ring-error-500",
  },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      theme = "coral",
      loading = false,
      fullWidth = false,
      children,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={[
          base,
          sizes[size],
          variants[theme][variant],
          fullWidth ? "w-full" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
