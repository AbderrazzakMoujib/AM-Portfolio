"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Palette,
  Code2,
  Mail,
  UserRound,
  Images,
  Settings,
  X,
} from "lucide-react";

const navigation = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Projects",
    href: "/admin/projects",
    icon: FolderKanban,
  },
  {
    label: "Creative Works",
    href: "/admin/creative",
    icon: Palette,
  },
  {
    label: "Skills",
    href: "/admin/skills",
    icon: Code2,
  },
  {
    label: "Messages",
    href: "/admin/messages",
    icon: Mail,
  },
  {
    label: "About Me",
    href: "/admin/about",
    icon: UserRound,
  },
  {
    label: "Media Library",
    href: "/admin/media",
    icon: Images,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function AdminSidebar({
  open,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/10 bg-[#0B2239] transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-24 items-center justify-between border-b border-white/10 px-7">
          <Link href="/admin/dashboard" className="text-3xl font-black text-white">
            AM<span className="text-[#00C8C8]">.</span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="text-white lg:hidden"
          >
            <X size={22} />
          </button>
        </div>

        <nav
          aria-label="Admin navigation"
          className="flex-1 space-y-1 overflow-y-auto px-4 py-7"
        >
          {navigation.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                  active
                    ? "bg-[#00C8C8]/15 font-semibold text-[#00C8C8]"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={19} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 px-7 py-6">
          <p className="text-xs font-semibold tracking-widest text-[#00C8C8]">
            CODE • CREATE • EVOLVE
          </p>
          <p className="mt-2 text-xs text-gray-400">
            AM Portfolio Administration
          </p>
        </div>
      </aside>
    </>
  );
}
