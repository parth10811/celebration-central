import { motion } from "framer-motion";
import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function AnimatedButton({
  children,
  variant = "default",
  size = "default",
  className,
  ...props
}: AnimatedButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        {
          "bg-primary text-primary-foreground shadow hover:bg-primary/90": variant === "default",
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground": variant === "outline",
          "hover:bg-accent hover:text-accent-foreground": variant === "ghost",
          "h-9 px-4 py-2": size === "default",
          "h-8 rounded-md px-3 text-xs": size === "sm",
          "h-10 rounded-md px-8": size === "lg",
        },
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
} 