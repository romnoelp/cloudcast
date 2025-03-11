"use client";

import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";

const Navigator = () => (
  <NavigationMenu>
    <NavigationMenuList>
      <NavigationMenuItem>
        <Link href="/overview" legacyBehavior passHref>
          <NavigationMenuLink className="text-sm font-medium transition-colors hover:text-primary">
            Overview
          </NavigationMenuLink>
        </Link>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <Link href="/customers" legacyBehavior passHref>
          <NavigationMenuLink className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Customers
          </NavigationMenuLink>
        </Link>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <Link href="/products" legacyBehavior passHref>
          <NavigationMenuLink className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Products
          </NavigationMenuLink>
        </Link>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <Link href="/settings" legacyBehavior passHref>
          <NavigationMenuLink className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Settings
          </NavigationMenuLink>
        </Link>
      </NavigationMenuItem>
    </NavigationMenuList>
  </NavigationMenu>
);

export { Navigator };