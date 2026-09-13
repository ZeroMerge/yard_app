import React from "react";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  showWordmark?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

export const Logo: React.FC<Props> = ({
  className,
  showWordmark = true,
  size = "md",
}) => {
  const heightClasses = {
    xs: "h-5",
    sm: "h-7",
    md: "h-8",
    lg: "h-11",
    xl: "h-14",
  };

  const iconSizeClasses = {
    xs: "h-5 w-5",
    sm: "h-7 w-7",
    md: "h-8 w-8",
    lg: "h-11 w-11",
    xl: "h-14 w-14",
  };

  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      {showWordmark ? (
        <>
          <img
            src="/brand/yard_main_logo_whitebg.png"
            alt="Yard"
            className={cn("object-contain dark:hidden", heightClasses[size])}
          />
          <img
            src="/brand/yard_main_logo_blackbg.png"
            alt="Yard"
            className={cn("object-contain hidden dark:block", heightClasses[size])}
          />
        </>
      ) : (
        <>
          <img
            src="/brand/yard_icon_whitebg.png"
            alt="Yard Icon"
            className={cn("rounded-md object-contain shadow-2xs dark:hidden", iconSizeClasses[size])}
          />
          <img
            src="/brand/yard_icon_blackbg.png"
            alt="Yard Icon"
            className={cn("rounded-md object-contain shadow-2xs hidden dark:block", iconSizeClasses[size])}
          />
        </>
      )}
    </div>
  );
};
