"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Button({ 
  children, 
  onClick, 
  type = "button", 
  variant = "primary", 
  disabled = false, 
  className,
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  type?: "button" | "submit" | "reset"; 
  variant?: "primary" | "secondary" | "outline" | "glass"; 
  disabled?: boolean;
  className?: string; 
}) {
  const baseStyles = "inline-flex items-center justify-center rounded-2xl font-semibold tracking-wide transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-black text-white hover:bg-gray-900 focus:ring-gray-900 shadow-[0_8px_20px_rgb(0,0,0,0.12)] hover:shadow-[0_12px_25px_rgb(0,0,0,0.2)] px-8 py-4",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-300 px-8 py-4",
    outline: "border border-gray-200 bg-transparent text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:ring-gray-200 px-8 py-4",
    glass: "bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 shadow-[0_8px_30px_rgb(0,0,0,0.1)] px-8 py-4"
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(baseStyles, variants[variant], className)}
    >
      {children}
    </motion.button>
  );
}
