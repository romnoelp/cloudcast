"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/context/user-context";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { NavLink, roleToLinks } from "@/types/navigation"; // ✅ Import type & links

const Navigator = () => {
  const { role, loading } = useUser();
  const pathname = usePathname();

  if (loading) return null; 

  const links: NavLink[] = role ? roleToLinks[role] || [] : [];

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {links.map((link) => (
          <NavigationMenuItem key={link.href}>
            <Link href={link.href} legacyBehavior passHref>
              <NavigationMenuLink
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === link.href ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.name}
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export { Navigator };
