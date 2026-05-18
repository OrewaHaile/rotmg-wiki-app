import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Shield, Menu, X } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path: string) => location === path;

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Updates", path: "/updates" },
    { label: "Categories", path: "/categories" },
    { label: "Sets", path: "/sets" },
    { label: "Skins", path: "/skins" },
    { label: "Dungeons", path: "/dungeons", badge: "Soon" },
    { label: "Stats", path: "/stats" },
  ];

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="w-full border-b border-amber-900/40 bg-gradient-to-b from-stone-900 to-stone-950 shadow-lg">
      <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <Link href="/">
            <button
              onClick={closeMenu}
              className="flex min-w-0 shrink-0 items-center gap-2 transition-opacity hover:opacity-80"
            >
              <Shield className="h-5 w-5 shrink-0 text-amber-500" />
              <div className="min-w-0 text-left">
                <p className="text-[10px] uppercase tracking-[0.22em] text-amber-400/80 leading-none">
                  RotMG
                </p>
                <p className="text-sm font-semibold text-amber-100 leading-none">
                  Wiki
                </p>
              </div>
            </button>
          </Link>

          <div className="hidden min-w-0 flex-1 items-center justify-end gap-1 overflow-x-auto sm:flex">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <button
                  className={`whitespace-nowrap rounded-full border px-3 py-2 text-sm font-medium transition-all ${
                    isActive(item.path)
                      ? "border-amber-800/50 bg-amber-950/70 text-amber-100"
                      : "border-transparent text-stone-400 hover:text-amber-300"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    {item.label}
                    {item.badge && (
                      <span className="rounded-full border border-amber-800/40 bg-amber-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-amber-200">
                        {item.badge}
                      </span>
                    )}
                  </span>
                </button>
              </Link>
            ))}
          </div>

          <button
            className="shrink-0 rounded-full border border-stone-800/60 bg-stone-900/80 p-2 text-stone-300 hover:text-amber-200 sm:hidden"
            onClick={() => setMenuOpen((current) => !current)}
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="mt-3 grid gap-2 sm:hidden">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <button
                  onClick={closeMenu}
                  className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all ${
                    isActive(item.path)
                      ? "border border-amber-800/50 bg-amber-950/70 text-amber-100"
                      : "bg-stone-900/80 text-stone-400 hover:text-amber-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="shrink-0 rounded-full border border-amber-800/40 bg-amber-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-amber-200">
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
