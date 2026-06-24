"use client";

import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";

type Theme = "coral" | "team";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  theme?: Theme;
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  theme?: Theme;
}

const focusRing: Record<Theme, string> = {
  coral: "focus:ring-coral-500 focus:border-coral-500",
  team: "focus:ring-team-500 focus:border-team-500",
};

const base =
  "w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 transition focus:outline-none focus:ring-2 disabled:opacity-50 disabled:bg-neutral-50";

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, theme = "coral", className = "", ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-neutral-700">{label}</label>
      )}
      <input
        ref={ref}
        className={`${base} ${focusRing[theme]} ${error ? "border-red-400 focus:ring-red-400" : ""} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, theme = "coral", className = "", ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-neutral-700">{label}</label>
      )}
      <textarea
        ref={ref}
        rows={3}
        className={`${base} ${focusRing[theme]} resize-none ${error ? "border-red-400 focus:ring-red-400" : ""} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
);
Textarea.displayName = "Textarea";
