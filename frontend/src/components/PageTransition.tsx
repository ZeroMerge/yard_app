import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import type { ReactNode } from "react";

export const PageTransition = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};
