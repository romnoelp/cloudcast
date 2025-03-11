"use client";

import { GalleryVerticalEnd } from "lucide-react";
import SignInButton from "@/components/authentication/signin-button";

const Signin = () => {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left Side - Login Section */}
      <div className="flex flex-col justify-center px-6 md:px-10">
        <div className="absolute top-6 left-6 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md border">
            <GalleryVerticalEnd className="size-4" />
          </div>
          <span className="text-lg font-medium">CloudCast</span>
        </div>

        <div className="max-w-sm mx-auto w-full text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your institutional email (<b>@neu.edu.ph</b>) <br /> to login
            to your account
          </p>
          <div className="mt-6">
            <SignInButton />
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            By signing in, you agree to our{" "}
            <span className="underline cursor-pointer">Terms of Service</span>{" "}
            and <span className="underline cursor-pointer">Privacy Policy</span>
            .
          </p>
        </div>
      </div>
      {/* Right Side - Image Section */}
      <div className="hidden lg:flex bg-[oklch(0.871_0.006_286.286)]"></div>
    </div>
  );
};

export default Signin;
