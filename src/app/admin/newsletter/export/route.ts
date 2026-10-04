import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth/admin";

export async function GET() {
  const admin = await getAdmin();
  if (!admin) return new NextResponse("Accès refusé", { status: 403 });
  const { data, error } = await admin.supabase
    .from("newsletter_subscribers")
    .select("email, confirmed_at, consent_text")
    .eq("status", "confirmed")
    .order("confirmed_at");
  if (error) return new NextResponse("Export impossible", { status: 500 });
  const esc = (v: string | null) => `"${(v ?? "").replace(/^([=+\-@])/, "'$1").replace(/"/g, '""')}"`;
  const csv = "﻿" + ["email;confirme_le;consentement", ...(data ?? []).map((r) => [esc(r.email), esc(r.confirmed_at), esc(r.consent_text)].join(";"))].join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="newsletter-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
