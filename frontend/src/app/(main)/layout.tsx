"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, User, LogOut, CheckCircle2 } from "lucide-react";
import clsx from "clsx";
import { logout, isAuthenticated } from "@/lib/api";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Dashboard", href: "/dashboard" },
  { name: "AI Coach", href: "/chat" },
  { name: "Meal Planner", href: "/diet" },
  { name: "History", href: "/history" },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    // Basic auth check
    if (!isAuthenticated()) {
      router.replace("/login");
    }

    const handleScroll = () => {
      setHasScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans transition-opacity duration-200">
      {/* Navbar Segment */}
      <nav
        className={clsx(
          "sticky top-0 z-50 w-full transition-all duration-300 backdrop-blur-md",
          hasScrolled
            ? "bg-white/70 shadow-sm border-b border-slate-200"
            : "bg-white/50 border-b border-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="bg-indigo-600 text-white p-1.5 rounded-lg shadow-sm group-hover:scale-105 transition-transform">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-900">
                  NutriCal <span className="text-indigo-600 font-medium">AI</span>
                </span>
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex md:items-center md:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={clsx(
                    "text-sm tracking-tight transition-colors duration-200",
                    pathname === link.href
                      ? "font-semibold text-black"
                      : "font-medium text-slate-500 hover:text-indigo-600"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Right Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={logout}
                className="inline-flex items-center justify-center p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-red-500 transition-colors"
                title="Log out"
              >
                <LogOut className="w-5 h-5" />
              </button>
              <div className="w-9 h-9 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 cursor-pointer hover:shadow-sm transition-all">
                <User className="w-5 h-5" />
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 focus:outline-none transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav menu */}
        <div
          className={clsx(
            "md:hidden absolute w-full bg-white shadow-xl border-b border-slate-200 transition-all duration-300 origin-top overflow-hidden",
            mobileMenuOpen ? "opacity-100 scale-y-100 flex" : "opacity-0 scale-y-0 h-0"
          )}
        >
          <div className="px-4 pt-2 pb-6 w-full space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={clsx(
                  "block px-3 py-3 rounded-xl text-base tracking-tight transition-colors",
                  pathname === link.href
                    ? "font-semibold text-indigo-600 bg-indigo-50"
                    : "font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 mt-2 border-t border-slate-100">
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="flex items-center w-full px-3 py-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
