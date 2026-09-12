import React from "react";
import { cn } from "@/lib/utils";

interface HexBadgeProps {
  role: "brand" | "creator";
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * 3D Tactile Hexagonal Badge (Clean, GitHub-style flat alignment without heavy shadow)
 */
export const HexBadge: React.FC<HexBadgeProps> = ({ role, className, size = "md" }) => {
  const isCreator = role === "creator";

  const sizePx = size === "sm" ? 18 : size === "md" ? 22 : 28;

  const colors = isCreator
    ? {
        shadow: "#15803D",       // Crisp forest green base
        rim: "#16A34A",          // Medium green rim
        surfaceTop: "#4ADE80",   // Bright lime green highlight
        surfaceBottom: "#22C55E",// Rich vibrant green
        innerGlow: "#86EFAC",    // Top bevel gloss
      }
    : {
        shadow: "#92400E",       // Crisp amber base
        rim: "#D97706",          // Medium amber rim
        surfaceTop: "#FDE047",   // Bright sunny gold highlight
        surfaceBottom: "#F59E0B",// Rich warm gold
        innerGlow: "#FEF08A",    // Top bevel gloss
      };

  return (
    <div
      className={cn("relative inline-block select-none", className)}
      style={{ width: sizePx, height: sizePx * 1.12 }}
      title={`${isCreator ? "Creator" : "Brand"} Verified`}
    >
      <svg
        viewBox="0 0 100 112"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id={`hex-face-${role}`} x1="50" y1="8" x2="50" y2="92" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={colors.surfaceTop} />
            <stop offset="100%" stopColor={colors.surfaceBottom} />
          </linearGradient>

          <linearGradient id={`hex-gloss-${role}`} x1="50" y1="8" x2="50" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 1. 3D Bottom Base */}
        <path
          d="M 50 14
             L 88 36
             L 88 84
             L 50 106
             L 12 84
             L 12 36
             Z"
          fill={colors.shadow}
        />

        {/* 2. Mid Bevel Layer */}
        <path
          d="M 50 10
             L 88 32
             L 88 78
             L 50 100
             L 12 78
             L 12 32
             Z"
          fill={colors.rim}
        />

        {/* 3. Main Hexagonal Face */}
        <path
          d="M 50 6
             L 84 26
             L 84 72
             L 50 92
             L 16 72
             L 16 26
             Z"
          fill={`url(#hex-face-${role})`}
        />

        {/* 4. Top Edge Gloss Highlight */}
        <path
          d="M 22 30 L 50 14 L 78 30"
          stroke={`url(#hex-gloss-${role})`}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 5. Center Motif */}
        {isCreator ? (
          <path
            d="M 53 28
               L 39 50
               L 48 50
               L 44 68
               L 61 46
               L 52 46
               Z"
            fill="#FFFFFF"
          />
        ) : (
          <path
            d="M 50 30
               L 55 43
               L 68 44
               L 58 53
               L 61 66
               L 50 59
               L 39 66
               L 42 53
               L 32 44
               L 45 43
               Z"
            fill="#FFFFFF"
          />
        )}
      </svg>
    </div>
  );
};
