"use client";

import { usePathname } from "next/navigation";
import { useUser } from "@/context/user-context";
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
} from "@/components/ui/navigation-menu";
import { NavLink, roleToLinks } from "@/types/navigation";
import Link from "next/link";

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
                    // Modified linkClassNames to apply primary color when active
                    const linkClassNames = `
                        text-sm
                        font-medium
                        transition-colors
                        mx-4
                        hover:text-primary
                        ${isActive ? "text-primary" : "text-muted-foreground"}
                    `;

                    return (
                        <NavigationMenuItem key={href}>
                            <Link href={href} className={linkClassNames}>
                                {name}
                            </Link>
                        </NavigationMenuItem>
                    );
                })}
            </NavigationMenuList>
        </NavigationMenu>
    );
};

export { Navigator };
