"use client";

import Link from "next/link";
import { Menu, User } from "lucide-react";

import { SignOutButton } from "@/components/layout/sign-out-button";
import { useSession } from "@/components/layout/session-provider";
import { dashboardNav } from "@/config/navigation";
import { getInitials } from "@/lib/format";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function MobileNav() {
  const { user, profile } = useSession();

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon-sm" className="md:hidden" />
        }
      >
        <Menu className="size-5" />
        <span className="sr-only">Abrir menu</span>
      </SheetTrigger>
      <SheetContent side="left" className="flex w-72 flex-col bg-sidebar p-0">
        <SheetHeader className="border-b border-sidebar-border px-4 py-4">
          <SheetTitle>TorqueERP</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
          {dashboardNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <Icon className="size-5 text-primary" />
                {item.title}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto space-y-1 border-t border-sidebar-border p-2">
          <Link
            href="/conta"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <Avatar className="size-7">
              <AvatarFallback className="bg-primary/15 text-[10px] font-semibold text-primary">
                {getInitials(profile?.full_name, user.email)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate">{profile?.full_name ?? user.email}</p>
              <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                <User className="size-3" />
                Meu perfil
              </p>
            </div>
          </Link>
          <Separator />
          <SignOutButton
            variant="sidebar"
            className="[&_button]:text-destructive [&_button]:hover:text-destructive"
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
