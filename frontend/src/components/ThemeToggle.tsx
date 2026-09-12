import { MoonIcon as Moon, SunIcon as Sun } from '@heroicons/react/24/outline';
import { useTheme } from "@/lib/theme";
import { motion, AnimatePresence } from "framer-motion";

export const ThemeToggle = () => {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="relative h-9 w-9 grid place-items-center rounded-xl bg-card shadow-sm hover:bg-surface-2 text-foreground transition-all duration-200"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.18 }}
          className="absolute inset-0 grid place-items-center"
        >
          {theme === "dark" ? <Sun className="h-4 w-4 text-teal-400" /> : <Moon className="h-4 w-4 text-teal-600" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
};
