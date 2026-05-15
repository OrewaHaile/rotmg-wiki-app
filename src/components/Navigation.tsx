import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Shield, Menu, X } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path: string) => location === path;

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Categories", path: "/categories" },
    { label: "Dungeons", path: "/dungeons", badge: "Coming soon" },
    { label: "Stats", path: "/stats" },
  ];

  return (
    <nav className="bg-gradient-to-b from-stone-900 to-stone-950 border-b border-amber-900/40 sticky top-0 z-30 shadow-lg backdrop-blur-lg">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <Link href="/">
            <button className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
              <Shield className="w-5 h-5 text-amber-500" />
              <div className="hidden sm:block">
                <p className="text-xs uppercase tracking-[0.2em] text-amber-400/80 leading-none">RotMG</p>
                <p className="text-sm font-semibold text-amber-100 leading-none">Wiki</p>
              </div>
            </button>
          </Link>

          <div className="hidden sm:flex items-center gap-2 flex-1 overflow-x-auto">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <button
                  className={`px-3 py-2 text-sm font-medium whitespace-nowrap transition-all rounded-full ${
                    isActive(item.path)
                      ? "text-amber-100 bg-amber-950/70 border border-amber-800/50"
                      : "text-stone-400 hover:text-amber-300 border border-transparent"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    {item.label}
                    {item.badge && (
                      <span className="rounded-full border border-amber-800/40 bg-amber-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.25em] text-amber-200">
                        {item.badge}
                      </span>
                    )}
                  </span>
                </button>
              </Link>
            ))}
          </div>

          <button
            className="sm:hidden rounded-full border border-stone-800/60 bg-stone-900/80 p-2 text-stone-300 hover:text-amber-200"
            onClick={() => setMenuOpen((current) => !current)}
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="mt-3 flex flex-col gap-2 sm:hidden">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <button
                  className={`w-full text-left px-4 py-3 text-sm font-medium rounded-2xl transition-all ${
                    isActive(item.path)
                      ? "text-amber-100 bg-amber-950/70 border border-amber-800/50"
                      : "text-stone-400 hover:text-amber-300 bg-stone-900/80"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="rounded-full border border-amber-800/40 bg-amber-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.25em] text-amber-200">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </button>
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
