"use client";

import { useState, lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton"; 

const LazySignIn = lazy(() => import("../../app/signin/lazy-signin"));

const SignInButton = () => {
    const [isLoading, setIsLoading] = useState(false);

    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    Loading...
                </div>
            }
        >
            <LazySignIn setIsLoading={setIsLoading} isLoading={isLoading} />
        </Suspense>
    );
};

export default SignInButton;