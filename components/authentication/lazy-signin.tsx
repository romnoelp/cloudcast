"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type LazySignInProps = {
    setIsLoading: (isLoading: boolean) => void;
    isLoading: boolean;
};

const LazySignIn: React.FC<LazySignInProps> = ({ setIsLoading, isLoading }) => {
    const supabase = createClient(); 

    const [signInError, setSignInError] = useState<string | null>(null);

    const signInWithGoogle = async () => {
        setIsLoading(true);
        setSignInError(null); 
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error("Google Sign-in Error:", error); 
            toast.error("There was an error logging in with Google.");
            if (error instanceof Error) {
                setSignInError(error.message);
            } else {
                setSignInError("An unexpected error occurred.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            {signInError && (
                <div
                    className="text-red-500 text-sm mb-4"
                    aria-live="polite"
                    role="alert"
                >
                    {signInError}
                </div>
            )}
            <Button
                onClick={signInWithGoogle}
                disabled={isLoading}
                className="w-full"
            >
                {isLoading ? (
                    <span className="size-4 animate-spin border-2 border-t-transparent rounded-full"></span>
                ) : (
                    <Image src="/google.svg" alt="Google Logo" width={20} height={20} />
                )}
                Sign in with Google
            </Button>
        </div>
    );
};

export default LazySignIn;