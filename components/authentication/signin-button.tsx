"use client";

import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

const SignInButton = () => {
  const pathname = usePathname();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch {
      toast.error("There was an error logging in with Google.");
      setIsLoading(false);
    }
  };

  if (pathname === "/signin") {
    return (
      <Button onClick={signInWithGoogle} disabled={isLoading} className="w-full" >
        {isLoading ? (
          <span className="size-4 animate-spin border-2 border-t-transparent rounded-full"></span>
        ) : (
          <Image src="/google.svg" alt="Google Logo" width={20} height={20} />
        )}
        Sign in with Google
      </Button>
    );
  }

  return (
    <Link href="/signin">
      <Button className="w-full">
        <Image src="/google.svg" alt="Google Logo" width={20} height={20} />
        Sign in
      </Button>
    </Link>
  );
};

export default SignInButton;
