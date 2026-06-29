"use client";

import Link from "next/link";
import { User } from "lucide-react";

import { getInitials } from "@/lib/format";
import { useSession } from "@/components/layout/session-provider";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu() {
  const { user, profile, organization } = useSession();
  const initials = getInitials(profile?.full_name, user.email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-sm" className="rounded-full" />
        }
      >
        <Avatar className="size-8">
          <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate font-medium">
            {profile?.full_name ?? user.email}
          </p>
          {organization && (
            <p className="truncate text-xs text-muted-foreground">
              {organization.name}
            </p>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/conta" />}>
          <User className="size-4" />
          Meu perfil
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <SignOutButton variant="menu" />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
