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

// 🔹 Define the structure of navigation links
type NavLink = {
  name: string;
  href: string;
};

// 🔹 Ensure role is a valid string before using it as an index
const roleToLinks: Record<string, NavLink[]> = {
  admin: [
    { name: "Overview", href: "/dashboard/admin" },
    { name: "Users", href: "/dashboard/admin/users" },
    { name: "File Storage", href: "/dashboard/admin/reports" },
  ],
  "product-manager": [
    { name: "Overview", href: "/dashboard/product-manager" },
    { name: "Projects", href: "/dashboard/product-manager/projects" },
    { name: "Analytics", href: "/dashboard/product-manager/analytics" },
  ],
  employee: [
    { name: "Overview", href: "/dashboard/employee" },
    { name: "Tasks", href: "/dashboard/employee/tasks" },
    { name: "Inbox", href: "/dashboard/employee/inbox" },
  ],
};

const Navigator = () => {
  const { role, loading } = useUser();
  const pathname = usePathname();

  if (loading) return null; // Don't render while loading

  // 🔹 Ensure `role` is a valid string, defaulting to an empty array if undefined/null
  const links: NavLink[] = role ? roleToLinks[role] || [] : [];

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {links.map((link: NavLink) => (
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
