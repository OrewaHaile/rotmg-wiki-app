import { Link, useLocation } from "wouter";
import { Shield } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Items", path: "/items" },
    { label: "Dungeons", path: "/dungeons" },
    { label: "Categories", path: "/categories" },
    { label: "Import Stats", path: "/stats" },
  ];

  return (
    <nav className="bg-gradient-to-b from-stone-900 to-stone-950 border-b border-amber-900/40 sticky top-0 z-30 shadow-lg backdrop-blur-lg">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/">
            <button className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
              <Shield className="w-5 h-5 text-amber-500" />
              <div className="hidden sm:block">
                <p className="text-xs uppercase tracking-[0.2em] text-amber-400/80 leading-none">RotMG</p>
                <p className="text-sm font-semibold text-amber-100 leading-none">Wiki</p>
              </div>
            </button>
          </Link>

          <div className="flex items-center gap-1 flex-1 overflow-x-auto">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <button
                  className={`px-3 py-2 text-sm font-medium whitespace-nowrap transition-all rounded-lg ${
                    isActive(item.path)
                      ? "text-amber-100 bg-amber-950/60 border border-amber-800/50"
                      : "text-stone-400 hover:text-amber-300 border border-transparent"
                  }`}
                >
                  {item.label}
                </button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
