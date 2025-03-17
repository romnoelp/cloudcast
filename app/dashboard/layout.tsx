import { ReactNode } from "react";
import { Search } from "./(layout-components)/search";
import { Navigator } from "./(layout-components)/navigator";
import TeamSwitcher from "./(layout-components)/team-switcher";
import User from "./(layout-components)/user";
import ThemeToggle from "./(layout-components)/theme-toggle";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="hidden flex-col md:flex">
      <header className="border-b">
        <div className="flex h-16 items-center px-4">
          <TeamSwitcher />
          <Navigator className="ml-2" /> 
          <div className="ml-auto flex items-center space-x-4">
            <Search />
            <ThemeToggle />
            <User />
          </div>
        </div>
      </header>
      <main className="flex-1 p-8 pt-6">{children}</main>
    </div>
  );
}
