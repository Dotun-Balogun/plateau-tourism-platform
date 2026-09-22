import Link from "next/link";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import {
  Compass,
  ExternalLink,
  FolderTree,
  LayoutDashboard,
  LogOut,
  MapPin,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCurrentUserWithProfile, isStaffRole } from "@/lib/supabase/current-user";
import { signOut } from "@/app/(public)/auth/actions";

const ADMIN_NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/destinations", label: "Destinations", icon: MapPin },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
];

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, profile } = await getCurrentUserWithProfile();

  if (!user) {
    redirect("/auth/login?redirectTo=/admin");
  }

  if (!isStaffRole(profile?.role)) {
    redirect("/");
  }

  const displayName = profile?.full_name || user.email || "Admin";
  const initials =
    displayName
      .trim()
      .split(/\s+/)
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  return (
    <div className="flex min-h-full bg-muted/30">
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-background md:flex">
        <div className="flex h-16 items-center gap-2 border-b px-5 font-semibold">
          <Compass className="size-5 text-primary" />
          <span>Admin</span>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="space-y-1 border-t p-3">
          <div className="flex items-center gap-2 px-3 py-2">
            <Avatar className="size-7">
              {profile?.avatar_url && (
                <AvatarImage src={profile.avatar_url} alt={displayName} />
              )}
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <span className="truncate text-sm text-muted-foreground">
              {displayName}
            </span>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <ExternalLink className="size-4" />
            View site
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        {/*
          Fixed: this bar previously only had a logo and "View site" link —
          no avatar, no sign-out — because those lived exclusively in the
          desktop sidebar above, which is hidden below md. Mobile admins had
          no way to sign out at all. Now both are here.
        */}
        <header className="flex h-16 items-center justify-between gap-3 border-b bg-background px-4 md:hidden">
          <div className="flex min-w-0 items-center gap-2 font-semibold">
            <Compass className="size-5 shrink-0 text-primary" />
            <span className="truncate">Admin</span>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Avatar className="size-7">
              {profile?.avatar_url && (
                <AvatarImage src={profile.avatar_url} alt={displayName} />
              )}
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <Link
              href="/"
              className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              title="View site"
            >
              <ExternalLink className="size-4" />
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                title="Sign out"
              >
                <LogOut className="size-4" />
              </button>
            </form>
          </div>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b bg-background px-3 py-2 md:hidden">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent"
            >
              <item.icon className="size-3.5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}