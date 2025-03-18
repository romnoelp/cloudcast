"use client";

import { ReactNode, useRef } from "react";
import { CopySlash } from "lucide-react";
import { Navigator } from "./(layout-components)/navigator";
import TeamSwitcher from "./(layout-components)/team-switcher";
import User from "./(layout-components)/user";
import ThemeToggle from "./(layout-components)/theme-toggle";
import { useOrganization } from "@/context/organization-context";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { selectedOrg } = useOrganization();
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
    <div className="flex flex-col h-full w-screen "> {/* ✅ Prevents full page scroll */}
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
            <ThemeToggle />
            <User />
          </div>
        </div>
      </header>
      {/* ✅ Prevents the whole page from scrolling */}
      <main className="flex-1 p-8 pt-6 overflow-hidden">{children}</main>
    </div>
  );
}
