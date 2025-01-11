"use client";
import { SignInButton, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/button.tsx";
import Link from "next/link";
export const Auth = () => {
  return (
    <div>
      <Link href="sign-in" className="text-gray-300 hover:text-white mr-4">
        <Button>Sign In</Button>
      </Link>
      <Link href="sign-up" className="text-gray-300 hover:text-white mr-4">
        <Button>Sign Up</Button>
      </Link>
    </div>
  );
};
