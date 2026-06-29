"use client";

import { LogOut } from "lucide-react";

import { signOut } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type SignOutButtonProps = {
  variant?: "menu" | "sidebar" | "ghost";
  className?: string;
  showLabel?: boolean;
};

export function SignOutButton({
  variant = "menu",
  className,
  showLabel = true,
}: SignOutButtonProps) {
  if (variant === "sidebar") {
    return (
      <form action={signOut} className={className}>
        <Button
          type="submit"
          variant="ghost"
          className="w-full justify-start gap-3 px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
        >
          <LogOut className="size-5 shrink-0" />
          {showLabel && "Sair"}
        </Button>
      </form>
    );
  }

  if (variant === "ghost") {
    return (
      <form action={signOut} className={className}>
        <Button type="submit" variant="ghost" className="w-full justify-start gap-2">
          <LogOut className="size-4" />
          {showLabel && "Sair"}
        </Button>
      </form>
    );
  }

  return (
    <form action={signOut} className={cn("w-full", className)}>
      <button
        type="submit"
        className="group/dropdown-menu-item relative flex w-full cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground [&_svg]:size-4"
      >
        <LogOut />
        {showLabel && "Sair"}
      </button>
    </form>
  );
}
