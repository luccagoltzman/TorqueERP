"use client";

import { Sidebar, useSidebarState } from "@/components/layout/sidebar";
import { cn } from "@/lib/utils";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { collapsed, toggle } = useSidebarState();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={collapsed} onToggle={toggle} />
      <div
        className={cn(
          "flex min-h-screen flex-col transition-[margin-left] duration-300 ease-out",
          collapsed ? "md:ml-[72px]" : "md:ml-[260px]",
        )}
      >
        {children}
      </div>
    </div>
  );
}
