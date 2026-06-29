import { redirect } from "next/navigation";
import { Building2, Mail, Shield, User } from "lucide-react";

import { ProfileForm } from "@/components/conta/profile-form";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { PageTransition } from "@/components/motion/page-transition";
import { formatRole, getInitials } from "@/lib/format";
import { getSessionContext } from "@/lib/session/queries";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function ContaPage() {
  const session = await getSessionContext();

  if (!session) {
    redirect("/login");
  }

  const { user, profile, organization, role } = session;
  const initials = getInitials(profile?.full_name, user.email);
  const displayName = profile?.full_name ?? user.email;

  return (
    <>
      <DashboardHeader
        title="Minha conta"
        description="Gerencie seu perfil e preferências de acesso"
      />
      <PageTransition className="p-4 md:p-6">
        <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[280px_1fr]">
          <Card className="border-border/60 bg-card/70 lg:self-start">
            <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
              <Avatar className="size-20">
                <AvatarFallback className="bg-primary/15 text-xl font-semibold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 space-y-1">
                <p className="truncate font-semibold">{displayName}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {user.email}
                </p>
              </div>
              {role && (
                <Badge variant="secondary">{formatRole(role)}</Badge>
              )}
              {organization && (
                <p className="text-sm text-muted-foreground">
                  {organization.name}
                </p>
              )}
              <Separator className="my-2" />
              <SignOutButton variant="ghost" className="w-full" />
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-border/60 bg-card/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="size-5 text-primary" />
                  Dados pessoais
                </CardTitle>
                <CardDescription>
                  Atualize como seu nome aparece no sistema.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileForm
                  fullName={profile?.full_name ?? ""}
                  email={user.email}
                />
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="size-5 text-primary" />
                  Organização
                </CardTitle>
                <CardDescription>
                  Informações da oficina vinculada à sua conta.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Building2 className="mt-0.5 size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Empresa</p>
                    <p className="text-sm text-muted-foreground">
                      {organization?.name ?? "Nenhuma organização vinculada"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Permissão</p>
                    <p className="text-sm text-muted-foreground">
                      {formatRole(role)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Login</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageTransition>
    </>
  );
}
