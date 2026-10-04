import { signOut } from "@/app/admin/actions/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/auth/admin";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const [{ count: newMessages }, { count: toProcess }] = await Promise.all([
    admin.supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "new"),
    admin.supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("payment_status", "paid")
      .eq("fulfillment_status", "new"),
  ]);

  return (
    <div className="lg:flex">
      <AdminNav
        name={admin.displayName}
        badges={{ "/admin/messages": newMessages ?? 0, "/admin/commandes": toProcess ?? 0 }}
        signOut={
          <form action={signOut}>
            <button type="submit" className="text-sm text-brown underline underline-offset-2 hover:text-danger">
              Se déconnecter
            </button>
          </form>
        }
      />
      <main id="contenu" className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
