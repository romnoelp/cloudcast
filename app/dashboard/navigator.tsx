"use client";

import { usePathname } from "next/navigation";
import { useUser } from "@/context/user-context";
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
} from "@/components/ui/navigation-menu";
import { NavLink, Role, roleToLinks } from "@/types/navigation";
import Link from "next/link";

type NavigatorProps = {
    className?: string;
};

const Navigator = ({ className = "" }: NavigatorProps) => {
    const { role, loading } = useUser();
    const pathname = usePathname();

    if (loading) return null;

    const links: NavLink[] = role ? roleToLinks[role as Role] || [] : [];

    return (
        <NavigationMenu className={className}>
            <NavigationMenuList>
                {links.map(({ href, name }) => {
                    const isActive = pathname === href;
                    return (
                        <NavigationMenuItem key={href}>
                            <Link
                                href={href}
                                className={`text-sm font-medium transition-colors mx-4 hover:text-primary ${isActive ? "text-primary" : "text-muted-foreground"
                                    }`}
                            >
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
