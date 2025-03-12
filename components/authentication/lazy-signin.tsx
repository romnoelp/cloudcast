"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type LazySignInProps = {
    setIsLoading: (isLoading: boolean) => void;
    isLoading: boolean;
};

const LazySignIn: React.FC<LazySignInProps> = ({ setIsLoading, isLoading }) => {
    const supabase = createClient();

    const signInWithGoogle = async () => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: { redirectTo: `${window.location.origin}/auth/callback` },
            });
            if (error) throw error;
        } catch (error) {
            toast.error("There was an error logging in with Google.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button onClick={signInWithGoogle} disabled={isLoading} className="w-full">
            {" "}
            {isLoading ? (
                <span className="size-4 animate-spin border-2 border-t-transparent rounded-full"></span>
            ) : (
                <Image src="/google.svg" alt="Google Logo" width={20} height={20} />
            )}
            Sign in with Google{" "}
        </Button>
    );
};

export default LazySignIn;