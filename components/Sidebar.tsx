"use client";

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems=[
  {name:"Companies",href:"/companies"},
  {name:"Lists",href:"/lists"},
  {name:"Saved",href:"/saved"},
]

export function SideBar(){
  const pathname=usePathname()

  return(
    <div className="h-screen w-64 border-r bg-background p-6">
      <h1 className="text-xl font-semibold mb-8">VC Intelligence</h1>

      <nav className="space-y-2">
        {navItems.map(item=>(
          <Link key={item.href} href={item.href}
            className={cn("block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted",pathname.startsWith(item.href) && "bg-muted font-medium")}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
};