"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, List, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Companies", href: "/companies", icon: LayoutGrid },
  { name: "Lists", href: "/lists", icon: List },
  { name: "Saved Searches", href: "/saved", icon: Bookmark },
];

export function SideBar() {
  const pathname = usePathname();

  return (
    <div className="h-screen w-64 border-r bg-background px-6 py-8 flex flex-col">
      <div className="mb-10">
        <h1 className="text-xl font-semibold tracking-tight">
          VC Intelligence
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Precision AI Scout
        </p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-muted",
                pathname.startsWith(item.href) &&
                  "bg-muted font-medium"
              )}
            >
              <Icon className="w-4 h-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}