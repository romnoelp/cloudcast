"use client";

import { ReactNode, useRef } from "react";
import { CopySlash, Bell } from "lucide-react";
import { Navigator } from "./(layout-components)/navigator";
import TeamSwitcher from "./(layout-components)/team-switcher";
import User from "./(layout-components)/user";
import ThemeToggle from "./(layout-components)/theme-toggle";
import { useOrganization } from "@/context/organization-context";
import { useUser } from "@/context/user-context"; 
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import NotificationDropdown from "./projects/(invite-user)/notification";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { selectedOrg } = useOrganization();
  const { user } = useUser(); 
  const joinCodeRef = useRef<HTMLSpanElement>(null);

  const handleCopyJoinCode = () => {
    if (joinCodeRef.current) {
      const range = document.createRange();
      range.selectNode(joinCodeRef.current);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);
      document.execCommand("copy");
      window.getSelection()?.removeAllRanges();
      toast.success("Join code copied to clipboard!");
    }
  };

  return (
    <div className="flex flex-col h-full w-screen">
      <header className="border-b flex-shrink-0">
        <div className="flex h-16 items-center px-4">
          <TeamSwitcher />
          <Navigator className="ml-2" />
          <div className="ml-auto flex items-center space-x-4">
            {selectedOrg && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Org Code: </span>
                <span className="font-semibold" ref={joinCodeRef}>
                  {selectedOrg.join_code}
                </span>
                <Button variant="outline" size="icon" onClick={handleCopyJoinCode}>
                  <CopySlash className="h-4 w-4" />
                </Button>
              </div>
            )}

            {user ? <NotificationDropdown userId={user.id} /> : (
              <Button variant="outline" size="icon" aria-label="Notifications">
                <Bell className="h-5 w-5 text-gray-700" />
              </Button>
            )}

            <ThemeToggle />
            <User />
          </div>
        </div>
      </header>
      <main className="flex-1 p-8 pt-6 overflow-hidden">{children}</main>
    </div>
  );
}
