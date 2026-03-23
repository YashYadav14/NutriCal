"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Make the Card animated by default for entry
export function Card({ 
  className, 
  children,
  delay = 0,
}: { 
  className?: string; 
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 1, 0.5, 1] }}
      className={cn(
        "bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/80 overflow-hidden backdrop-blur-xl relative transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ 
  title, 
  description, 
  className 
}: { 
  title: string | React.ReactNode; 
  description?: string; 
  className?: string;
}) {
  return (
    <div className={cn("p-8 border-b border-gray-50/50", className)}>
      <h3 className="text-xl font-bold tracking-tight text-gray-900">{title}</h3>
      {description && <p className="text-sm font-medium text-gray-500 mt-2">{description}</p>}
    </div>
  );
}

export function CardContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("p-8", className)}>{children}</div>;
}
