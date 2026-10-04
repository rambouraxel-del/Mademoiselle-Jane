import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s — Administration Mademoizelle Jane" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-[#f6f1ea] text-brown">{children}</div>;
}
