"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  Tags,
  Users,
  Package2,
  Search,
  BarChart3,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Dashboard", icon: Home },
    { href: "/admin/posts", label: "Blog Posts", icon: FileText },
    { href: "/admin/seo", label: "SEO Pages", icon: Search },
    { href: "/admin/tags", label: "Tags", icon: Tags },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Logo Area */}
      <div className="flex h-16 items-center px-6 border-b">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Package2 className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold">HyperBetz</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        <p className="px-3 text-xs font-semibold text-muted-foreground uppercase mb-2">
          Menu
        </p>
        {links.map((link) => {
          const isActive = pathname === link.href;
          // || pathname.includes(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <link.icon className="h-4 w-4" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3 rounded-lg bg-accent/50 p-3">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="text-xs font-medium">Analytics</span>
            <span className="text-[10px] text-muted-foreground">
              Live
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
