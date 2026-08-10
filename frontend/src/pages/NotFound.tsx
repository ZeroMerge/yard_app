import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.warn("404:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-gradient-hero" />
      <header className="px-5 md:px-8 py-5">
        <Link to="/"><Logo /></Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-md text-center"
        >
          <div className="font-display text-[120px] md:text-[160px] leading-none font-extrabold cy-gradient-text">404</div>
          <h1 className="font-display text-2xl md:text-3xl font-bold mt-2">We couldn't find that page.</h1>
          <p className="text-muted-foreground mt-3">
            The link may be broken, or the page moved. Try heading back to your workspace.
          </p>
          <code className="mt-4 inline-block text-xs text-muted-foreground bg-muted px-2 py-1 rounded">{location.pathname}</code>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            <Button asChild variant="outline"><Link to="/"><ArrowLeft className="h-4 w-4 mr-1.5" /> Back home</Link></Button>
            <Button asChild className="bg-secondary text-secondary-foreground hover:bg-secondary/90"><Link to="/login"><Home className="h-4 w-4 mr-1.5" /> Go to workspace</Link></Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default NotFound;
