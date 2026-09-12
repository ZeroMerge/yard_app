import { PageHeader } from "@/components/ui-bits";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/lib/auth";

const Settings = () => {
  const user = useAuth();
  
  return (
    <div className="max-w-3xl space-y-6 pb-16">
      <PageHeader 
        title="Settings" 
        subtitle="Manage your app preferences and workspace settings."
      />
      
      <div className="bg-card border border-border/60 rounded-md p-5 sm:p-6 shadow-none space-y-5">
        <h3 className="font-display font-bold text-base text-foreground tracking-tight">Appearance</h3>
        
        <div className="flex items-center justify-between p-3.5 rounded-md bg-surface-2/40 border border-border/40">
          <div>
            <div className="font-bold text-foreground text-xs sm:text-sm">Theme</div>
            <div className="text-muted-foreground text-xs mt-0.5">Toggle between light and dark interface mode</div>
          </div>
          <ThemeToggle />
        </div>
      </div>
      
      <div className="bg-card border border-border/60 rounded-md p-5 sm:p-6 shadow-2xs space-y-4 opacity-75">
        <h3 className="font-display font-bold text-base text-foreground tracking-tight">Notifications</h3>
        <div className="flex items-center justify-between p-3.5 rounded-md bg-surface-2/40 border border-border/40">
          <div>
            <div className="font-bold text-foreground text-xs sm:text-sm">Email Notifications</div>
            <div className="text-muted-foreground text-xs mt-0.5">Receive campaign updates and payout confirmations</div>
          </div>
          <div className="h-5 w-9 bg-muted rounded-full relative cursor-not-allowed">
            <div className="h-4 w-4 rounded-full bg-surface-2 absolute top-0.5 left-0.5 shadow-xs" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground italic">Granular notification triggers coming soon.</p>
      </div>
    </div>
  );
};

export default Settings;
