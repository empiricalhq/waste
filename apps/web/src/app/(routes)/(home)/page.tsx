import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import SignOutButton from "../(auth)/components/button-signout";
import { getMe } from "@/actions/user";
import { SimpleDashboard } from "@/components/dashboard"

export default async function Home() {
  const me = await getMe();

  return (
    <div className="grid min-h-screen grid-rows-[20px_1fr_36px] items-center justify-items-center font-[family-name:var(--font-geist-sans)] p-4">
      <main className="row-start-2 flex flex-col items-center gap-8 sm:items-start w-full">
        {me ? (
          <SimpleDashboard/>
        ) : (
          <Link
            href={"/signin"}
            className={cn(buttonVariants({ variant: "default" }))}
          >
            Sign In
          </Link>
        )}
      </main>
      <footer className="row-start-3 flex flex-wrap items-center justify-center gap-6">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>

          <SignOutButton />

      </footer>
    </div>
  );
}