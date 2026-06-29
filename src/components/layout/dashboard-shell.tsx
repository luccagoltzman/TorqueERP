"use client";

import { Sidebar, useSidebarState } from "@/components/layout/sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { collapsed, toggle } = useSidebarState();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar collapsed={collapsed} onToggle={toggle} />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
