"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  LogOut,
  Loader2,
} from "lucide-react";

import AdminSidebar from "@/components/admin/AdminSidebar";
import {
  api,
  getCurrentUser,
  logout,
  type AdminUser,
} from "@/lib/api";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function verifyAdmin() {
      try {
        const current = await getCurrentUser();

        if (!current?.is_admin) {
          router.replace("/login");
          return;
        }

        await api.get("/api/admin/dashboard");

        if (active) {
          setUser(current);
        }
      } catch {
        if (active) {
          router.replace("/login");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    verifyAdmin();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    setError("");

    try {
      await logout();
      router.replace("/login");
    } catch {
      setError("Erreur pendant la déconnexion.");
      setLoggingOut(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 bg-[#0B0B12] text-white">
        <Loader2 className="animate-spin text-[#00C8C8]" />
        Vérification de la session...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B12] text-white">
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="min-h-screen lg:ml-64">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/10 bg-[#0B0B12]/95 px-5 backdrop-blur-xl md:px-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
              className="lg:hidden"
            >
              <Menu size={24} />
            </button>

            <h1 className="text-xl font-bold">
              AM<span className="text-[#00C8C8]">.</span>
              <span className="ml-3 text-sm font-normal text-gray-400">
                Administration
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              aria-label="Logout"
              className="rounded-xl border border-white/10 p-3 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
            >
              {loggingOut ? (
                <Loader2 size={19} className="animate-spin" />
              ) : (
                <LogOut size={19} />
              )}
            </button>
          </div>
        </header>

        {error && (
          <p role="alert" className="px-8 pt-4 text-sm text-red-400">
            {error}
          </p>
        )}

        <main className="mx-auto max-w-7xl px-5 py-8 md:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
