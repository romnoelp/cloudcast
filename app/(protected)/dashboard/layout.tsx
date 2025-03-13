import { ReactNode } from "react";
import { Search } from "@/components/navigation-bar/search";
import { Navigator } from "@/components/navigation-bar/navigator";
import TeamSwitcher from "@/components/navigation-bar/team-switcher";
import User from "@/components/navigation-bar/user";
import ThemeToggle from "@/components/navigation-bar/theme-toggle";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="hidden flex-col md:flex">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <TeamSwitcher />
          <div className="ml-2">
            <Navigator />
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <Search />
            <ThemeToggle />
            <User />
          </div>
        </div>
      </div>
      <div className="flex-1 p-8 pt-6">{children}</div>
    </div>
  );
}