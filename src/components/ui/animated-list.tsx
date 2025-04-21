import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AnimatedListProps {
  children: ReactNode;
  className?: string;
  staggerChildren?: number;
}

export function AnimatedList({ children, className, staggerChildren = 0.1 }: AnimatedListProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren
          }
        }
      }}
      className={cn("w-full", className)}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedListItemProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedListItem({ children, className }: AnimatedListItemProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.5,
            ease: [0.4, 0, 0.2, 1]
          }
        }
      }}
      className={cn("w-full", className)}
    >
      {children}
    </motion.div>
  );
} 