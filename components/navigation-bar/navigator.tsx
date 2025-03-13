"use client";

import { usePathname } from "next/navigation";
import { useUser } from "@/context/user-context";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { NavLink, roleToLinks } from "@/types/navigation";

const Navigator = () => {
  const { role, loading } = useUser();
  const pathname = usePathname();

  if (loading) return null;

  const links: NavLink[] = role ? roleToLinks[role] || [] : [];

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {links.map(({ href, name }: NavLink) => {
          const isActive = pathname === href;
          const linkClassNames = `text-sm font-medium transition-colors hover:text-primary ${
            isActive ? "text-primary" : "text-muted-foreground"
          }`;

          return (
            <NavigationMenuItem key={href}>
              <NavigationMenuLink href={href} className={linkClassNames}>
                {name}
              </NavigationMenuLink>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export { Navigator };