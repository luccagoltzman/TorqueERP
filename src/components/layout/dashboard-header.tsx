"use client";

import { Bell } from "lucide-react";

import { MobileNav } from "@/components/layout/mobile-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { GlobalProductSearch } from "@/components/estoque/global-product-search";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";

type DashboardHeaderProps = {
  title: string;
  description?: string;
};

export function DashboardHeader({ title, description }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/95 backdrop-blur-sm">
      <div className="flex h-16 items-center gap-4 px-4 md:px-6">
        <MobileNav />

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold tracking-tight md:text-xl">
            {title}
          </h1>
          {description && (
            <p className="hidden truncate text-sm text-muted-foreground sm:block">
              {description}
            </p>
          )}
        </div>

        <GlobalProductSearch />

        <ThemeToggle />

        <Button variant="ghost" size="icon-sm" aria-label="Notificações">
          <Bell className="size-4" />
        </Button>

        <UserMenu />
      </div>
    </header>
  );
}
