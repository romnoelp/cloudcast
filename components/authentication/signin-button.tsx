"use client";

import { useState, lazy, Suspense } from "react";

const LazySignIn = lazy(() => import("./lazy-signin"));

const SignInButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazySignIn setIsLoading={setIsLoading} isLoading={isLoading} />{" "}
    </Suspense>
  );
};

export default SignInButton;
