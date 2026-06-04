import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "default" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  iconContainer?: boolean; // For "Button-in-Button" pattern
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "default",
      isLoading,
      leftIcon,
      rightIcon,
      iconContainer = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    // Base classes for all buttons
    // - transition-fluid: smooth cubic-bezier motion
    // - active:scale-[0.98]: haptic physics press effect
    const baseStyles =
      "group inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-bold transition-fluid active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    // Variant-specific classes
    const variants = {
      primary:
        "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 dark:shadow-emerald-900/40 hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-500/30 border border-emerald-400/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]",
      secondary:
        "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 shadow-md border border-slate-200 dark:border-slate-700 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]",
      outline:
        "border-2 border-slate-200 dark:border-slate-700 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300",
      ghost:
        "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300",
      danger:
        "bg-rose-500 text-white shadow-lg shadow-rose-500/25 hover:bg-rose-600 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]",
    };

    // Size-specific classes
    const sizes = {
      sm: "h-9 px-4 text-xs",
      default: "h-12 px-6",
      lg: "h-14 px-8 text-base",
      icon: "h-12 w-12",
    };

    const variantStyles = variants[variant];
    const sizeStyles = sizes[size];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles, sizeStyles, className)}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        
        {children}
        
        {!isLoading && rightIcon && (
          <span
            className={cn(
              "ml-2 flex items-center justify-center transition-transform group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105",
              iconContainer && "h-8 w-8 rounded-full bg-black/10 dark:bg-white/10 ml-3"
            )}
          >
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
