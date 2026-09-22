import Link from "next/link";
import { Compass, LayoutDashboard, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserMenu } from "@/components/auth/user-menu";
import { getCurrentUserWithProfile, isStaffRole } from "@/lib/supabase/current-user";

const NAV_LINKS = [
  { href: "/destinations", label: "Destinations" },
  { href: "/itineraries", label: "Trip Planner" },
  { href: "/categories", label: "Categories" },
  { href: "/about", label: "About" },
];

export async function SiteHeader() {
  const { user, profile } = await getCurrentUserWithProfile();
  const isStaff = isStaffRole(profile?.role);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold">
          <Compass className="size-5" />
          <span className="hidden sm:inline">Discover Plateau State</span>
          <span className="sm:hidden">Plateau State</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          {isStaff && (
            <Link
              href="/admin"
              className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <LayoutDashboard className="size-3.5" />
              Admin
            </Link>
          )}
        </nav>

        {/*
          Fixed: this used to be `hidden md:flex`, so the avatar/sign-out
          menu (for logged-in users) and the sign-in/sign-up buttons simply
          didn't render at all on mobile. Now always visible — this is the
          primary account control on every screen size.
        */}
        <div className="flex shrink-0 items-center gap-2">
          {user ? (
            <UserMenu
              fullName={profile?.full_name ?? null}
              avatarUrl={profile?.avatar_url ?? null}
              email={user.email}
              isStaff={isStaff}
            />
          ) : (
            <>
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
                <Link href="/auth/login">Sign in</Link>
              </Button>
              <Button size="sm" className="sm:hidden" asChild>
                <Link href="/auth/login">Sign in</Link>
              </Button>
              <Button size="sm" className="hidden sm:inline-flex" asChild>
                <Link href="/auth/sign-up">Get started</Link>
              </Button>
            </>
          )}

          {/* Nav links live behind the hamburger below md; account controls above don't. */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="size-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {NAV_LINKS.map((link) => (
                <DropdownMenuItem key={link.href} asChild>
                  <Link href={link.href}>{link.label}</Link>
                </DropdownMenuItem>
              ))}
              {isStaff && (
                <DropdownMenuItem asChild>
                  <Link href="/admin">Admin dashboard</Link>
                </DropdownMenuItem>
              )}
              {!user && (
                <DropdownMenuItem asChild>
                  <Link href="/auth/sign-up">Get started</Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}