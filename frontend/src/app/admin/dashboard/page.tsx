
import {
  FolderKanban,
  Palette,
  Code2,
  Mail,
} from "lucide-react";

const modules = [
  {
    title: "Projects",
    description: "Gestion des projets",
    icon: FolderKanban,
    color: "#00C8C8",
  },
  {
    title: "Creative Works",
    description: "Design & Motion",
    icon: Palette,
    color: "#A78BFA",
  },
  {
    title: "Skills",
    description: "Compétences",
    icon: Code2,
    color: "#446BFF",
  },
  {
    title: "Messages",
    description: "Messages de contact",
    icon: Mail,
    color: "#00C8C8",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      <section>
        <p className="mb-3 text-xs tracking-[0.25em] text-[#00C8C8]">
          AM PORTFOLIO
        </p>

        <h1 className="text-4xl font-bold">
          Dashboard Overview
        </h1>

        <p className="mt-3 text-gray-400">
          Gérez votre univers digital et créatif.
        </p>
      </section>

      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0B2239] via-[#16192D] to-[#211638] p-8">
        <h2 className="text-3xl font-bold">
          Code. Create. Evolve.
        </h2>

        <p className="mt-4 max-w-xl text-gray-300">
          Full-Stack Development, UI/UX Design,
          Graphic Design & Motion Design.
        </p>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {modules.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-[#151520] p-6 transition hover:-translate-y-1 hover:border-[#00C8C8]/30"
            >
              <Icon
                size={30}
                style={{ color: item.color }}
              />

              <h3 className="mt-6 text-xl font-semibold">
                {item.title}
              </h3>

              <p className="mt-2 text-sm text-gray-400">
                {item.description}
              </p>

              <div className="mt-6 border-t border-white/10 pt-4 text-xs text-gray-500">
                Module à développer
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
