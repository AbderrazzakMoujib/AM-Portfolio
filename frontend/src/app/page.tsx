
"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  Code2,
  LoaderCircle,
  Mail,
  Menu,
  MonitorSmartphone,
  Palette,
  Play,
  Send,
  X,
} from "lucide-react";
import {
  FaGithub,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa6";
import { api, initializeCsrf } from "@/lib/api";

// Dynamic import: Three.js only loads in the browser.
const AMLogo3D = dynamic(
  () => import("@/components/home/AMLogo3D"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[320px] items-center justify-center">
        <Image
          src="/images/am-logo.png"
          alt="AM Logo"
          width={240}
          height={240}
          className="h-auto w-40 animate-pulse object-contain"
        />
      </div>
    ),
  }
);

type Profile = {
  full_name: string;
  headline: string;
  location: string | null;
  short_bio: string | null;
  about: string | null;
  portrait_url: string | null;
  cv_url: string | null;
  available_for_work: boolean;
};

type Settings = {
  site_title: string;
  tagline: string | null;
  logo_url: string | null;
  contact_email: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
};

type Skill = {
  id: number;
  name: string;
  category: string;
  icon: string | null;
};

type Project = {
  id: number;
  title: string;
  slug: string;
  category: string;
  description: string | null;
  technologies: string[] | null;
  cover_image: string | null;
  project_url: string | null;
  featured: boolean;
};

type CreativeWork = {
  id: number;
  title: string;
  slug: string;
  category: string;
  description: string | null;
  cover_image: string | null;
  media_url: string | null;
};

type HomeData = {
  profile: Profile | null;
  settings: Settings | null;
  skills: Skill[];
  featured_projects: Project[];
  creative_works: CreativeWork[];
};

type ContactForm = {
  name: string;
  email: string;
  subject: string;
  message: string;
  website: string;
};

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000"
).replace(/\/$/, "");

const initialContact: ContactForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
  website: "",
};

const expertise = [
  {
    number: "01",
    title: "Development",
    description:
      "Modern websites, full-stack platforms, APIs and mobile applications.",
    icon: Code2,
    color: "#00C8C8",
  },
  {
    number: "02",
    title: "UI/UX Design",
    description:
      "Intuitive interfaces, meaningful experiences and digital products.",
    icon: MonitorSmartphone,
    color: "#8055F8",
  },
  {
    number: "03",
    title: "Graphic Design",
    description:
      "Brand identities, visual communication and creative graphics.",
    icon: Palette,
    color: "#446BFF",
  },
  {
    number: "04",
    title: "Motion Design",
    description:
      "Animation, motion graphics and visual storytelling.",
    icon: Play,
    color: "#00C8C8",
  },
];

function assetUrl(
  path: string | null | undefined
): string | null {
  if (!path) return null;

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (path.startsWith("/storage/")) {
    return `${API_URL}${path}`;
  }

  if (path.startsWith("storage/")) {
    return `${API_URL}/${path}`;
  }

  return path.startsWith("/") ? path : `/${path}`;
}

function isSafeUrl(
  value: string | null | undefined
): value is string {
  if (!value) return false;

  try {
    const url = new URL(value);

    return (
      url.protocol === "https:" ||
      url.protocol === "http:"
    );
  } catch {
    return false;
  }
}

function SectionLabel({
  number,
  children,
}: {
  number: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#00C8C8]">
      <span>{number}</span>

      <span className="h-px w-8 bg-[#00C8C8]/50" />

      <span>{children}</span>
    </div>
  );
}

export default function HomePage() {
  const rootRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<HomeData | null>(
    null
  );

  const [dataError, setDataError] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);

  const [year, setYear] = useState<number | null>(
    null
  );

  const [contact, setContact] =
    useState<ContactForm>(initialContact);

  const [sending, setSending] = useState(false);
  const [contactError, setContactError] = useState("");
  const [contactSuccess, setContactSuccess] =
    useState("");

  // Current year: client-side only
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  // Laravel Homepage API
  useEffect(() => {
    const controller = new AbortController();

    async function loadHome() {
      try {
        const response = await fetch(
          `${API_URL}/api/public/home`,
          {
            signal: controller.signal,
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Homepage API unavailable");
        }

        const result =
          (await response.json()) as HomeData;

        if (!controller.signal.aborted) {
          setData(result);
          setDataError(false);
        }
      } catch {
        if (!controller.signal.aborted) {
          setDataError(true);
        }
      }
    }

    void loadHome();

    return () => controller.abort();
  }, []);

  // Lenis Smooth Scroll
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.1,
      anchors: true,
    });

    return () => lenis.destroy();
  }, []);

  // GSAP Animations
  useEffect(() => {
    if (!rootRef.current) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      gsap.fromTo(
        ".hero-reveal",
        {
          y: 50,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.13,
          ease: "power3.out",
          clearProps: "all",
        }
      );

      gsap.utils
        .toArray<HTMLElement>(".scroll-reveal")
        .forEach((element) => {
          gsap.fromTo(
            element,
            {
              y: 45,
              opacity: 0,
            },
            {
              y: 0,
              opacity: 1,
              duration: 0.85,
              ease: "power2.out",
              clearProps: "all",
              scrollTrigger: {
                trigger: element,
                start: "top 90%",
                once: true,
              },
            }
          );
        });
    }, rootRef);

    return () => context.revert();
  }, [data]);

  const profile = data?.profile;
  const settings = data?.settings;

  const projects = data?.featured_projects ?? [];
  const skills = data?.skills ?? [];
  const works = data?.creative_works ?? [];

  const name =
    profile?.full_name ?? "Abderrazzak Moujib";

  const headline =
    profile?.headline ??
    "Full-Stack Developer & Creative Designer";

  const github =
    settings?.github_url ??
    "https://github.com/AbderrazzakMoujib";

  const linkedin =
    settings?.linkedin_url ??
    "https://www.linkedin.com/in/abderrazzak-moujib-665a8831a/";

  const portrait = assetUrl(
    profile?.portrait_url
  );

  async function sendContact(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (sending) return;

    setSending(true);
    setContactError("");
    setContactSuccess("");

    try {
      await initializeCsrf();

      await api.post(
        "/api/public/contact",
        contact
      );

      setContactSuccess(
        "Message envoyé avec succès. Merci !"
      );

      setContact(initialContact);
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 422
      ) {
        setContactError(
          "Vérifie les informations du formulaire."
        );
      } else {
        setContactError(
          "Impossible d'envoyer le message."
        );
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      ref={rootRef}
      className="min-h-screen overflow-x-clip bg-[#0B0B12] font-sans text-white selection:bg-[#00C8C8] selection:text-[#0B0B12]"
    >
      {/* NAVBAR */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#0B0B12]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-6 md:px-12">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <Image
              src="/images/am-logo.png"
              alt="AM Logo"
              width={48}
              height={48}
              className="h-12 w-12 object-contain"
              priority
            />

            <span className="hidden text-[10px] font-bold tracking-[0.2em] text-white/60 sm:block">
              CODE · CREATE · EVOLVE
            </span>
          </Link>

          <nav className="hidden items-center gap-9 text-sm text-white/65 md:flex">
            {[
              ["Work", "#work"],
              ["About", "#about"],
              ["Expertise", "#expertise"],
              ["Creative Lab", "#creative"],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="transition hover:text-[#00C8C8]"
              >
                {label}
              </a>
            ))}
          </nav>

          <a
            href="#contact"
            className="hidden items-center gap-2 rounded-full border border-[#00C8C8]/50 px-6 py-3 text-sm font-medium text-[#00C8C8] transition hover:bg-[#00C8C8] hover:text-[#0B0B12] md:inline-flex"
          >
            Let&apos;s talk
            <ArrowUpRight size={16} />
          </a>

          <button
            type="button"
            aria-label={
              menuOpen
                ? "Close menu"
                : "Open menu"
            }
            aria-expanded={menuOpen}
            onClick={() =>
              setMenuOpen(!menuOpen)
            }
            className="p-2 md:hidden"
          >
            {menuOpen ? (
              <X size={26} />
            ) : (
              <Menu size={26} />
            )}
          </button>
        </div>

        {menuOpen && (
          <nav className="flex flex-col gap-6 border-t border-white/10 bg-[#0B0B12] px-8 py-8 text-lg md:hidden">
            {[
              ["Work", "#work"],
              ["About", "#about"],
              ["Expertise", "#expertise"],
              ["Creative Lab", "#creative"],
              ["Contact", "#contact"],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={() =>
                  setMenuOpen(false)
                }
                className="hover:text-[#00C8C8]"
              >
                {label}
              </a>
            ))}
          </nav>
        )}
      </header>

      <main>
        {/* HERO V2 — 3D AM LOGO */}
        <section
          id="home"
          className="relative flex min-h-[100svh] items-center overflow-hidden border-b border-white/10 px-6 pb-16 pt-28 md:px-12"
        >
          {/* Decorative ambient lighting */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 h-[600px] w-[600px] rounded-full bg-[#00C8C8]/8 blur-[120px]"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 rounded-full bg-[#446BFF]/10 blur-[100px]"
          />

          <div className="relative mx-auto grid w-full max-w-[1400px] items-center gap-12 lg:grid-cols-[1fr_1.05fr]">
            {/* Hero Content */}
            <div className="relative z-10">
              <div className="hero-reveal mb-9 flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#00C8C8]" />

                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">
                  Creative Developer Portfolio
                </p>
              </div>

              <h1 className="space-y-1 text-[clamp(3.4rem,6.5vw,7.5rem)] font-black uppercase leading-[0.99] tracking-[-0.065em]">
                <span className="hero-reveal block">
                  DESIGN
                </span>

                <span className="hero-reveal block">
                  MEETS
                </span>

                <span className="hero-reveal block text-[#00C8C8]">
                  ENGINEERING.
                </span>
              </h1>

              <div className="hero-reveal mt-9 max-w-xl">
                <p className="text-xl font-semibold text-white">
                  {name}
                </p>

                <p className="mt-2 text-base text-white/60">
                  {headline}
                </p>

                <p className="mt-5 max-w-lg text-sm leading-8 text-white/50 md:text-base">
                  I build digital products,
                  design meaningful experiences,
                  and create visuals that move,
                  inform and inspire.
                </p>
              </div>

              <div className="hero-reveal mt-9 flex flex-wrap gap-4">
                <a
                  href="#work"
                  className="inline-flex items-center gap-3 rounded-full bg-[#00C8C8] px-7 py-4 text-sm font-bold text-[#0B0B12] transition hover:bg-white"
                >
                  Explore My Work
                  <ArrowUpRight size={19} />
                </a>

                <a
                  href="#contact"
                  className="inline-flex items-center gap-3 rounded-full border border-white/25 px-7 py-4 text-sm font-semibold transition hover:border-[#00C8C8] hover:text-[#00C8C8]"
                >
                  Let&apos;s Talk
                  <ArrowRight size={18} />
                </a>
              </div>

              <div className="hero-reveal mt-14 flex flex-wrap gap-x-5 gap-y-2 text-[10px] font-semibold uppercase tracking-widest text-white/40">
                <span>Development</span>
                <span className="text-[#00C8C8]">/</span>
                <span>UI/UX</span>
                <span className="text-[#00C8C8]">/</span>
                <span>Graphic</span>
                <span className="text-[#00C8C8]">/</span>
                <span>Motion</span>
              </div>
            </div>

            {/* Real 3D Logo */}
            <div className="relative flex min-h-[350px] items-center justify-center sm:min-h-[480px] lg:min-h-[630px]">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-[15%] rounded-full bg-[#00C8C8]/10 blur-[90px]"
              />

              <div className="relative h-[380px] w-full sm:h-[500px] lg:h-[650px]">
                <AMLogo3D
                  mode="both"
                  speed={0.22}
                  interactive
                  className="h-full w-full"
                />
              </div>

              <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] uppercase tracking-[0.22em] text-white/35">
                AM Logo · Interactive 3D
              </div>
            </div>
          </div>

          <a
            href="#work"
            aria-label="Scroll to projects"
            className="absolute bottom-5 left-6 flex items-center gap-2 text-xs text-white/45 transition hover:text-[#00C8C8] md:left-12"
          >
            Scroll to explore
            <ArrowDown size={15} />
          </a>
        </section>

        {/* SELECTED WORK */}
        <section
          id="work"
          className="scroll-mt-24 px-6 py-28 md:px-12"
        >
          <div className="mx-auto max-w-[1400px]">
            <div className="scroll-reveal mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <SectionLabel number="01">
                  Selected Work
                </SectionLabel>

                <h2 className="mt-5 text-5xl font-bold tracking-[-0.06em] md:text-8xl">
                  Work
                  <span className="text-[#00C8C8]">
                    .
                  </span>
                </h2>
              </div>

              <p className="max-w-sm text-sm leading-7 text-white/50">
                Digital experiences built through
                development, design and creative
                problem-solving.
              </p>
            </div>

            <div className="grid gap-10 md:grid-cols-2">
              {projects.map(
                (project, index) => {
                  const cover = assetUrl(
                    project.cover_image
                  );

                  return (
                    <article
                      key={project.id}
                      className="scroll-reveal group"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0B2239] via-[#1C2142] to-[#392358]">
                        {cover ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={cover}
                            alt={project.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <span className="text-6xl font-bold text-white/10">
                              AM/
                              {String(
                                index + 1
                              ).padStart(2, "0")}
                            </span>
                          </div>
                        )}

                        <span className="absolute left-5 top-5 rounded-full border border-white/20 bg-[#0B0B12]/75 px-4 py-2 text-xs backdrop-blur-md">
                          {project.category}
                        </span>

                        {isSafeUrl(
                          project.project_url
                        ) && (
                          <a
                            href={
                              project.project_url
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Visit ${project.title}`}
                            className="absolute bottom-5 right-5 rounded-full bg-[#00C8C8] p-4 text-[#0B0B12] transition-transform group-hover:rotate-45"
                          >
                            <ArrowUpRight
                              size={21}
                            />
                          </a>
                        )}
                      </div>

                      <div className="mt-6">
                        <p className="mb-2 text-xs uppercase tracking-widest text-[#00C8C8]">
                          Featured Project /
                          {" "}
                          {String(
                            index + 1
                          ).padStart(2, "0")}
                        </p>

                        <h3 className="text-2xl font-semibold md:text-3xl">
                          {project.title}
                        </h3>

                        <p className="mt-3 line-clamp-2 text-sm leading-7 text-white/50">
                          {project.description}
                        </p>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        {(
                          project.technologies ??
                          []
                        )
                          .slice(0, 5)
                          .map((tech) => (
                            <span
                              key={tech}
                              className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/50"
                            >
                              {tech}
                            </span>
                          ))}
                      </div>
                    </article>
                  );
                }
              )}
            </div>

            {dataError && (
              <p className="mt-8 text-sm text-amber-300">
                Homepage API unavailable.
                Check Laravel server.
              </p>
            )}

            {data &&
              projects.length === 0 && (
                <p className="rounded-2xl border border-white/10 p-8 text-sm text-white/50">
                  No featured projects
                  published yet.
                </p>
              )}
          </div>
        </section>

        {/* ABOUT */}
        <section
          id="about"
          className="scroll-mt-20 border-y border-white/10 bg-[#11121D] px-6 py-28 md:px-12"
        >
          <div className="mx-auto grid max-w-[1400px] items-center gap-14 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="scroll-reveal">
              <SectionLabel number="02">
                About Me
              </SectionLabel>

              <h2 className="mt-8 max-w-3xl text-5xl font-bold leading-[1.08] tracking-[-0.06em] md:text-7xl">
                BUILD.
                <br />
                DESIGN.
                <br />
                <span className="text-[#00C8C8]">
                  CREATE.
                </span>
              </h2>

              <p className="mt-8 max-w-2xl whitespace-pre-line text-base leading-8 text-white/55">
                {profile?.about ??
                  profile?.short_bio ??
                  "I'm a Full-Stack Web & Mobile Developer and multimedia designer based in Casablanca. I combine technology, UI/UX, graphic design and motion to build complete digital experiences."}
              </p>

              <div className="mt-9 flex flex-wrap gap-4">
                {profile?.cv_url && (
                  <a
                    href={
                      assetUrl(
                        profile.cv_url
                      ) ?? "#"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[#00C8C8] px-6 py-3 text-sm font-semibold text-[#0B0B12]"
                  >
                    View My CV
                    <ArrowUpRight
                      size={17}
                    />
                  </a>
                )}

                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-medium transition hover:border-[#00C8C8]"
                >
                  Get in Touch
                  <ArrowRight size={17} />
                </a>
              </div>
            </div>

            <div className="scroll-reveal relative">
              <div className="aspect-[4/5] overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0B2239] via-[#262044] to-[#8055F8]/60">
                {portrait ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={portrait}
                    alt={name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-5">
                    <Image
                      src="/images/am-logo.png"
                      alt="AM Portfolio"
                      width={170}
                      height={170}
                      className="object-contain"
                    />

                    <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                      Creative Developer
                    </p>
                  </div>
                )}
              </div>

              <div className="absolute -bottom-5 -left-4 rounded-2xl border border-[#00C8C8]/30 bg-[#0B0B12] px-6 py-4 shadow-2xl">
                <p className="text-sm font-semibold text-[#00C8C8]">
                  {profile?.location ??
                    "Casablanca, Morocco"}
                </p>

                <p className="mt-1 text-xs text-white/50">
                  Design × Technology
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* EXPERTISE */}
        <section
          id="expertise"
          className="scroll-mt-24 px-6 py-28 md:px-12"
        >
          <div className="mx-auto max-w-[1400px]">
            <div className="scroll-reveal mb-16">
              <SectionLabel number="03">
                What I Do
              </SectionLabel>

              <h2 className="mt-5 text-5xl font-bold tracking-[-0.06em] md:text-8xl">
                Expertise
                <span className="text-[#8055F8]">
                  .
                </span>
              </h2>
            </div>

            <div className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-2">
              {expertise.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.number}
                    className="scroll-reveal group bg-[#11121D] p-8 transition-colors duration-300 hover:bg-[#1B1B30] md:p-12"
                  >
                    <div className="mb-14 flex items-start justify-between">
                      <span className="text-xs text-white/35">
                        / {item.number}
                      </span>

                      <Icon
                        size={32}
                        strokeWidth={1.4}
                        style={{
                          color: item.color,
                        }}
                      />
                    </div>

                    <h3 className="text-3xl font-semibold tracking-tight md:text-4xl">
                      {item.title}
                    </h3>

                    <p className="mt-4 max-w-sm text-sm leading-7 text-white/50">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {skills.length > 0 && (
              <div className="scroll-reveal mt-14">
                <p className="mb-6 text-xs uppercase tracking-[0.22em] text-white/45">
                  Tools & Technologies
                </p>

                <div className="flex flex-wrap gap-3">
                  {skills.map((skill) => (
                    <span
                      key={skill.id}
                      className="rounded-full border border-[#00C8C8]/20 bg-[#00C8C8]/5 px-5 py-2.5 text-sm text-white/75"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* CREATIVE LAB */}
        <section
          id="creative"
          className="scroll-mt-24 border-y border-white/10 bg-[#11121D] px-6 py-28 md:px-12"
        >
          <div className="mx-auto max-w-[1400px]">
            <div className="scroll-reveal mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <SectionLabel number="04">
                  Beyond The Code
                </SectionLabel>

                <h2 className="mt-5 text-5xl font-bold tracking-[-0.06em] md:text-8xl">
                  Creative{" "}
                  <span className="text-[#A78BFA]">
                    Lab.
                  </span>
                </h2>
              </div>

              <p className="max-w-sm text-sm leading-7 text-white/50">
                A space for visual
                experiments, interfaces,
                branding and motion.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {works.map((work) => {
                const cover = assetUrl(
                  work.cover_image
                );

                const media = assetUrl(
                  work.media_url
                );

                const content = (
                  <>
                    <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#8055F8]/35 via-[#192448] to-[#00C8C8]/25">
                      {cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={cover}
                          alt={work.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Palette
                            size={70}
                            className="text-white/20"
                          />
                        </div>
                      )}

                      {media && (
                        <span className="absolute bottom-4 right-4 rounded-full bg-[#00C8C8] p-3 text-[#0B0B12]">
                          <ArrowUpRight
                            size={18}
                          />
                        </span>
                      )}
                    </div>

                    <div className="mt-5">
                      <p className="text-xs uppercase tracking-widest text-[#A78BFA]">
                        {work.category}
                      </p>

                      <h3 className="mt-2 text-xl font-semibold">
                        {work.title}
                      </h3>
                    </div>
                  </>
                );

                return (
                  <article
                    key={work.id}
                    className="scroll-reveal group"
                  >
                    {media &&
                    isSafeUrl(media) ? (
                      <a
                        href={media}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {content}
                      </a>
                    ) : (
                      content
                    )}
                  </article>
                );
              })}
            </div>

            {data &&
              works.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/15 p-10 text-sm text-white/50">
                  Creative Works will
                  appear here when
                  published in Admin.
                </div>
              )}
          </div>
        </section>

        {/* CONTACT */}
        <section
          id="contact"
          className="scroll-mt-24 px-6 py-28 md:px-12"
        >
          <div className="mx-auto grid max-w-[1400px] gap-16 lg:grid-cols-2">
            <div className="scroll-reveal">
              <SectionLabel number="05">
                Get In Touch
              </SectionLabel>

              <h2 className="mt-7 text-6xl font-bold leading-[1] tracking-[-0.07em] md:text-8xl">
                LET&apos;S
                <span className="block text-[#00C8C8]">
                  CREATE
                </span>
                TOGETHER.
              </h2>

              <p className="mt-8 max-w-sm text-base leading-8 text-white/50">
                Have a project,
                collaboration or
                opportunity?
                Let&apos;s build something
                meaningful.
              </p>

              <div className="mt-10 flex gap-4">
                {[
                  {
                    icon: FaGithub,
                    url: github,
                    label: "GitHub",
                  },
                  {
                    icon: FaLinkedin,
                    url: linkedin,
                    label: "LinkedIn",
                  },
                  {
                    icon: FaInstagram,
                    url:
                      settings?.instagram_url ??
                      "",
                    label: "Instagram",
                  },
                ]
                  .filter((item) =>
                    isSafeUrl(item.url)
                  )
                  .map(
                    ({
                      icon: Icon,
                      url,
                      label,
                    }) => (
                      <a
                        key={label}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className="rounded-full border border-white/20 p-4 transition hover:border-[#00C8C8] hover:text-[#00C8C8]"
                      >
                        <Icon size={20} />
                      </a>
                    )
                  )}
              </div>

              {settings?.contact_email && (
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="mt-8 inline-flex items-center gap-2 text-sm text-[#00C8C8] hover:underline"
                >
                  <Mail size={17} />
                  {
                    settings.contact_email
                  }
                </a>
              )}
            </div>

            <form
              onSubmit={sendContact}
              className="scroll-reveal relative space-y-6 rounded-3xl border border-white/10 bg-[#151520] p-7 md:p-10"
            >
              <h3 className="text-2xl font-semibold">
                Send a Message
              </h3>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="mb-2 block text-sm text-white/60"
                  >
                    Your Name
                  </label>

                  <input
                    id="contact-name"
                    required
                    maxLength={150}
                    value={contact.name}
                    onChange={(e) =>
                      setContact((p) => ({
                        ...p,
                        name: e.target.value,
                      }))
                    }
                    className="am-input"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="mb-2 block text-sm text-white/60"
                  >
                    Email Address
                  </label>

                  <input
                    id="contact-email"
                    type="email"
                    required
                    maxLength={255}
                    value={contact.email}
                    onChange={(e) =>
                      setContact((p) => ({
                        ...p,
                        email: e.target.value,
                      }))
                    }
                    className="am-input"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-subject"
                  className="mb-2 block text-sm text-white/60"
                >
                  Subject
                </label>

                <input
                  id="contact-subject"
                  maxLength={255}
                  value={contact.subject}
                  onChange={(e) =>
                    setContact((p) => ({
                      ...p,
                      subject: e.target.value,
                    }))
                  }
                  className="am-input"
                  placeholder="Let's collaborate"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="mb-2 block text-sm text-white/60"
                >
                  Message
                </label>

                <textarea
                  id="contact-message"
                  required
                  maxLength={5000}
                  rows={5}
                  value={contact.message}
                  onChange={(e) =>
                    setContact((p) => ({
                      ...p,
                      message: e.target.value,
                    }))
                  }
                  className="am-input resize-y"
                  placeholder="Tell me about your project..."
                />
              </div>

              {/* Spam honeypot */}
              <div
                className="absolute -left-[9999px]"
                aria-hidden="true"
              >
                <label htmlFor="contact-website">
                  Website
                </label>

                <input
                  id="contact-website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={contact.website}
                  onChange={(e) =>
                    setContact((p) => ({
                      ...p,
                      website: e.target.value,
                    }))
                  }
                />
              </div>

              {contactError && (
                <p
                  role="alert"
                  className="text-sm text-red-400"
                >
                  {contactError}
                </p>
              )}

              {contactSuccess && (
                <p
                  role="status"
                  className="flex items-center gap-2 text-sm text-emerald-400"
                >
                  <Check size={17} />
                  {contactSuccess}
                </p>
              )}

              <button
                type="submit"
                disabled={sending}
                className="flex w-full items-center justify-center gap-3 rounded-full bg-[#00C8C8] px-7 py-4 font-semibold text-[#0B0B12] transition hover:bg-white disabled:opacity-50"
              >
                {sending ? (
                  <LoaderCircle
                    size={19}
                    className="animate-spin"
                  />
                ) : (
                  <Send size={19} />
                )}

                {sending
                  ? "Sending..."
                  : "Send Message"}
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-6 py-8 md:px-12">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-3">
            <Image
              src="/images/am-logo.png"
              alt="AM Logo"
              width={45}
              height={45}
              className="object-contain"
            />

            <span className="text-xs text-white/45">
              Code • Create • Evolve
            </span>
          </div>

          <p className="text-xs text-white/40">
            © {year ?? "2026"} {name}.
            All rights reserved.
          </p>

          <a
            href="#home"
            className="flex items-center gap-2 text-xs text-white/60 hover:text-[#00C8C8]"
          >
            Back to Top
            <ArrowUpRight size={16} />
          </a>
        </div>
      </footer>
    </div>
  );
}
