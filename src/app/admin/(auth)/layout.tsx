import Link from "next/link";
import { Logo } from "@/components/site/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="mx-auto mb-6 block w-60" aria-label="Retour au site">
          <Logo alt="Mademoizelle Jane" />
        </Link>
        <div className="rounded-lg border border-line bg-white p-6 shadow-sm sm:p-8">{children}</div>
      </div>
    </main>
  );
}
