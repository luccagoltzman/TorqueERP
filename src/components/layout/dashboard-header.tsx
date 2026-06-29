"use client";

import { Bell, Search } from "lucide-react";

import { MobileNav } from "@/components/layout/mobile-nav";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type DashboardHeaderProps = {
  title: string;
  description?: string;
};

export function DashboardHeader({ title, description }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur-md">
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

        <div className="hidden max-w-sm flex-1 md:flex">
          <div className="relative w-full">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar peças, OS, clientes..."
              className="pl-9"
            />
          </div>
        </div>

        <Button variant="ghost" size="icon-sm" aria-label="Notificações">
          <Bell className="size-4" />
        </Button>

        <Avatar>
          <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
            TE
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
