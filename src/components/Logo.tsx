import Image from "next/image";
import { MuseoModerno } from "next/font/google";
import { cn } from "@/lib/utils";
import Link from "next/link";

const museo = MuseoModerno({
  weight: "700",
  subsets: ["latin"],
});
export const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-2">
      <Image src="/logo.svg" alt="logo" width={32} height={32} />
      <h2 className={cn(museo.className, "text-xl")}>Social Helper</h2>
    </Link>
  );
};
