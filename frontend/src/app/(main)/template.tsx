"use client";

import { useEffect, useState } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  const [opacity, setOpacity] = useState("opacity-0");

  useEffect(() => {
    // A small delay ensures the initial render mounts with opacity-0, 
    // then transitions to opacity-100 on the next paint.
    const timer = setTimeout(() => {
      setOpacity("opacity-100");
    }, 10);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`transition-opacity duration-200 ease-in-out ${opacity}`}>
      {children}
    </div>
  );
}
