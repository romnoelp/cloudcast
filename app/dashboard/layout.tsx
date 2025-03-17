import { ReactNode } from "react";
import { Search } from "./search";
import { Navigator } from "./navigator";
import TeamSwitcher from "./team-switcher";
import User from "./user";
import ThemeToggle from "./theme-toggle";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="hidden flex-col md:flex">
      <header className="border-b">
        <div className="flex h-16 items-center px-4">
          <TeamSwitcher />
          <Navigator className="ml-2" /> {/* ✅ className now works */}
          <div className="ml-auto flex items-center space-x-4">
            <Search />
            <ThemeToggle />
            <User />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8 pt-6">{children}</main>
    </div>
  );
}
