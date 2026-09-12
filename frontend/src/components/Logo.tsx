import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme";

interface Props {
  className?: string;
  showWordmark?: boolean;
  tone?: "light" | "dark";
  size?: "xs" | "sm" | "md" | "lg";
}

export const Logo = ({ className, showWordmark = true, size = "md" }: Props) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const heightClasses = {
    xs: "h-4",
    sm: "h-6",
    md: "h-8",
    lg: "h-11",
  };

  const iconSizeClasses = {
    xs: "h-4 w-4",
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-11 w-11",
  };

  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      {showWordmark ? (
        <img
          src={isDark ? "/brand/yard_main_logo_blackbg.png" : "/brand/yard_main_logo_whitebg.png"}
          alt="CreatorYard"
          className={cn("object-contain transition-opacity duration-200", heightClasses[size])}
        />
      ) : (
        <img
          src={isDark ? "/brand/yard_icon_blackbg.png" : "/brand/yard_icon_whitebg.png"}
          alt="CreatorYard Icon"
          className={cn("rounded-xl object-contain shadow-sm", iconSizeClasses[size])}
        />
      )}
    </div>
  );
};
