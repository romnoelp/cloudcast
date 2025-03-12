"use client";

import {
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import React from "react";

type LazyDropdownMenuContentProps = {
    user: any; 
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    supabase: ReturnType<typeof createClient>;
    router: ReturnType<typeof useRouter>;
};

const LazyDropdownMenuContent: React.FC<LazyDropdownMenuContentProps> = ({
    user,
    loading,
    setLoading,
    supabase,
    router,
}) => {
    const handleLogout = async () => {
        setLoading(true);
        await supabase.auth.signOut();
        router.push("/signin");
        router.refresh();
    };

    return (
        <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                        {user?.name || "Guest"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                        {user?.email || "example@email.com"}
                    </p>
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem>
                    Profile
                    <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    Settings
                    <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                {loading ? "Signing out..." : "Sign out"}
                <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
            </DropdownMenuItem>
        </DropdownMenuContent>
    );
};

export default LazyDropdownMenuContent;