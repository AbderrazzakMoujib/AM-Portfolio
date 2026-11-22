
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  LogOut,
  FolderKanban,
  Palette,
  Mail,
  Menu,
  Code2,
  ArrowUpRight,
  Loader2,
  LayoutDashboard,
} from "lucide-react";

import {
  api,
  getCurrentUser,
  logout,
  type AdminUser,
} from "@/lib/api";

import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminDashboard() {
  const router = useRouter();

  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  useEffect(() => {
    let active = true;

    async function checkAuth() {
      try {
        const current = await getCurrentUser();

        if (!active) return;

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

    checkAuth();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    setLogoutError("");

    try {
      await logout();
      router.replace("/login");
    } catch {
      setLogoutError(
        "Impossible de se déconnecter. Réessayez."
      );
    } finally {
      setLoggingOut(false);
    }
  }

  const stats = [
    {
      title: "Projects",
      description: "Gérer les projets",
      icon: FolderKanban,
      color: "#00C8C8",
      href: "/admin/projects",
    },
    {
      title: "Creative Works",
      description: "Design & Motion",
      icon: Palette,
      color: "#A78BFA",
      href: "/admin/creative",
    },
    {
      title: "Skills",
      description: "Compétences techniques",
      icon: Code2,
      color: "#446BFF",
      href: "/admin/skills",
    },
    {
      title: "Messages",
      description: "Messages de contact",
      icon: Mail,
      color: "#00C8C8",
      href: "/admin/messages",
    },
  ];

  if (loading || !user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0B0B12] text-white">
        <Loader2
          size={32}
          className="animate-spin text-[#00C8C8]"
        />

        <p className="text-sm text-gray-400">
          Vérification de la session...
        </p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B12] text-white">
      {/* Sidebar */}
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main area */}
      <div className="min-h-screen lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/10 bg-[#0B0B12]/95 px-5 backdrop-blur-xl md:px-8">
          <div className="flex items-center gap-4">
            {/* Mobile menu */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
              className="rounded-xl border border-white/10 p-2 text-white transition hover:bg-white/10 lg:hidden"
            >
              <Menu size={22} />
            </button>

            {/* Page title */}
            <div className="flex items-center gap-3">
              <LayoutDashboard
                size={21}
                className="hidden text-[#00C8C8] sm:block"
              />

              <h1 className="text-lg font-semibold md:text-xl">
                Dashboard
              </h1>
            </div>
          </div>

          {/* Header right */}
          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">
                {user.name}
              </p>

              <p className="text-xs text-gray-400">
                Administrator
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#00C8C8]/30 bg-[#0B2239] text-sm font-bold text-[#00C8C8]">
              {user.name.charAt(0).toUpperCase()}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              aria-label="Logout"
              title="Logout"
              className="rounded-xl border border-white/10 p-2.5 text-gray-300 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
            >
              {loggingOut ? (
                <Loader2 size={19} className="animate-spin" />
              ) : (
                <LogOut size={19} />
              )}
            </button>
          </div>
        </header>

        {/* Dashboard content */}
        <main className="mx-auto max-w-7xl space-y-10 px-5 py-8 md:px-8 md:py-10">
          {/* Welcome section */}
          <section>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#00C8C8]" />

              <p className="text-xs font-semibold tracking-[0.25em] text-[#00C8C8]">
                AM PORTFOLIO ADMINISTRATION
              </p>
            </div>

            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Bienvenue,{" "}
              <span className="bg-gradient-to-r from-[#00C8C8] via-[#446BFF] to-[#A78BFA] bg-clip-text text-transparent">
                {user.name}
              </span>
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-400 md:text-base">
              Gérez votre portfolio, vos projets, vos
              créations et vos compétences depuis votre
              espace administrateur.
            </p>
          </section>

          {/* Brand banner */}
          <section className="relative overflow-hidden rounded-3xl border border-[#00C8C8]/15 bg-gradient-to-br from-[#0B2239] via-[#16192D] to-[#211638] p-6 md:p-9">
            {/* Decorative gradients */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#8055F8]/15 blur-3xl"
            />

            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-20 right-32 h-56 w-56 rounded-full bg-[#00C8C8]/10 blur-3xl"
            />

            <div className="relative z-10 flex flex-col items-start justify-between gap-7 md:flex-row md:items-center">
              <div>
                <p className="mb-3 text-xs font-semibold tracking-[0.25em] text-[#00C8C8]">
                  YOUR CREATIVE SPACE
                </p>

                <h3 className="text-2xl font-bold md:text-3xl">
                  Code. Create. Evolve.
                </h3>

                <p className="mt-3 max-w-lg text-sm leading-7 text-gray-300">
                  Développement web & mobile, UI/UX,
                  graphic design et motion design.
                  Un seul espace pour présenter tout
                  votre univers créatif.
                </p>
              </div>

              <div className="flex shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-[#0B0B12]/40 p-4">
                <Image
                  src="/images/am-logo.png"
                  alt="AM Portfolio Logo"
                  width={100}
                  height={100}
                  className="h-auto w-auto max-w-[100px] object-contain"
                  priority
                />
              </div>
            </div>
          </section>

          {/* Modules */}
          <section>
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-[#00C8C8]">
                  Administration
                </p>

                <h3 className="text-2xl font-bold">
                  Gestion du portfolio
                </h3>
              </div>

              <p className="hidden text-xs text-gray-500 sm:block">
                Modules en préparation
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="group rounded-2xl border border-white/10 bg-[#151520] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#00C8C8]/30 hover:bg-[#191927]"
                  >
                    <div className="mb-7 flex items-start justify-between">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl"
                        style={{
                          backgroundColor: `${item.color}15`,
                          color: item.color,
                        }}
                      >
                        <Icon size={24} />
                      </div>

                      <ArrowUpRight
                        size={19}
                        className="text-gray-600 transition group-hover:text-[#00C8C8]"
                      />
                    </div>

                    <h4 className="text-lg font-semibold">
                      {item.title}
                    </h4>

                    <p className="mt-2 text-sm text-gray-400">
                      {item.description}
                    </p>

                    <div className="mt-5 border-t border-white/10 pt-4">
                      <span className="text-xs text-gray-500">
                        Module à développer
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Bottom section */}
          <section className="grid gap-6 lg:grid-cols-2">
            {/* Recent projects */}
            <div className="rounded-2xl border border-white/10 bg-[#151520] p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Recent Projects
                </h3>

                <FolderKanban
                  size={20}
                  className="text-[#00C8C8]"
                />
              </div>

              <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-[#0B0B12]/50 p-6 text-center">
                <FolderKanban
                  size={28}
                  className="mb-3 text-gray-500"
                />

                <p className="text-sm text-gray-300">
                  Aucun projet affiché
                </p>

                <p className="mt-2 text-xs text-gray-500">
                  Les projets récents apparaîtront ici
                  après la création du module Projects.
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="rounded-2xl border border-white/10 bg-[#151520] p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Recent Messages
                </h3>

                <Mail
                  size={20}
                  className="text-[#A78BFA]"
                />
              </div>

              <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-[#0B0B12]/50 p-6 text-center">
                <Mail
                  size={28}
                  className="mb-3 text-gray-500"
                />

                <p className="text-sm text-gray-300">
                  Aucun message affiché
                </p>

                <p className="mt-2 text-xs text-gray-500">
                  Les messages apparaîtront ici après
                  la création du module Contact.
                </p>
              </div>
            </div>
          </section>

          {logoutError && (
            <p role="alert" className="text-sm text-red-400">
              {logoutError}
            </p>
          )}

          {/* Footer */}
          <footer className="border-t border-white/10 py-6 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} AM Portfolio.
            Code • Create • Evolve.
          </footer>
        </main>
      </div>
    </div>
  );
}
    