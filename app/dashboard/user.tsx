"use client";

import {  useState, lazy, Suspense } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/context/user-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LazyDropdownMenuContent = lazy(
  () => import("./lazy-dropdown-menu-content")
);

const User = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const supabase = createClient();
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            {user?.avatar_url ? (
              <AvatarImage src={user.avatar_url} alt={user.name || "User"} />
            ) : (
              <AvatarFallback>
                {user?.name ? user.name.slice(0, 2).toUpperCase() : "SC"}
              </AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <Suspense fallback={<div>Loading...</div>}>
        <LazyDropdownMenuContent
          user={user}
          loading={loading}
          setLoading={setLoading}
          supabase={supabase}
          router={router}
        />
      </Suspense>
    </DropdownMenu>
  );
};

export default User;
