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
        <header className="flex h-16 items-center justify-between border-b bg-background px-6 md:hidden">
          <div className="flex items-center gap-2 font-semibold">
            <Compass className="size-5 text-primary" />
            <span>Admin</span>
          </div>
          <Link href="/" className="text-sm text-muted-foreground">
            View site
          </Link>
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
