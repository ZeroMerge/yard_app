import { usePwaInstall } from '@/lib/pwa';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowDownTrayIcon as Download, XMarkIcon as X } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

export const PwaInstallPrompt = () => {
  const { canInstall, isInstalled, promptInstall } = usePwaInstall();
  const [dismissed, setDismissed] = useState(false);

  if (!canInstall || isInstalled || dismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-50 p-4 rounded-2xl bg-card shadow-elevated border-0 flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <img src="/brand/yard_icon_whitebg.png" alt="CreatorYard" className="h-10 w-10 rounded-xl object-contain shadow-sm" />
          <div className="min-w-0">
            <div className="font-bold text-sm text-foreground">Install CreatorYard</div>
            <div className="text-xs text-muted-foreground truncate">Add to Home Screen for fast mobile access</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            size="sm"
            onClick={promptInstall}
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-xs px-3 shadow-sm"
          >
            <Download className="h-3.5 w-3.5 mr-1" /> Install
          </Button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-2"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
