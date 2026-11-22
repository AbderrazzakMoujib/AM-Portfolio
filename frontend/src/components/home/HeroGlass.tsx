
"use client";

import {
  useEffect,
  useRef,
  type PointerEvent,
} from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import gsap from "gsap";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Code2,
  MapPin,
  Monitor,
  Palette,
  Play,
} from "lucide-react";
import styles from "./HeroGlass.module.css";

const AMLogo3D = dynamic(
  () => import("@/components/home/AMLogo3D"),
  {
    ssr: false,
    loading: () => (
      <div className={styles.logoFallback}>
        <Image
          src="/images/am-logo.png"
          alt="AM Logo"
          width={300}
          height={300}
          priority
          className="h-auto w-[60%] object-contain"
        />
      </div>
    ),
  }
);

type HeroGlassProps = {
  name?: string;
  headline?: string;
  location?: string;
  availableForWork?: boolean;
};

console.log("CSS KEYS:", Object.keys(styles));
console.log("HERO CLASS:", styles.hero);

const services = [
  {
    id: "development",
    title: "Development",
    subtitle: "Web · Mobile · APIs",
    Icon: Code2,
    position: styles.cardDevelopment,
    tone: styles.cardCyan,
    float: styles.floatOne,
  },
  {
    id: "uiux",
    title: "UI/UX Design",
    subtitle: "Interfaces · Experiences",
    Icon: Monitor,
    position: styles.cardUiux,
    tone: styles.cardPurple,
    float: styles.floatTwo,
  },
  {
    id: "graphic",
    title: "Graphic Design",
    subtitle: "Branding · Visuals",
    Icon: Palette,
    position: styles.cardGraphic,
    tone: styles.cardPurple,
    float: styles.floatThree,
  },
  {
    id: "motion",
    title: "Motion Design",
    subtitle: "Animation · Storytelling",
    Icon: Play,
    position: styles.cardMotion,
    tone: styles.cardCyan,
    float: styles.floatFour,
  },
];

export default function HeroGlass({
  name = "Abderrazzak Moujib",
  headline = "Full-Stack Developer & Creative Designer",
  location = "Casablanca, Morocco",
  availableForWork = true,
}: HeroGlassProps) {
  const heroRef = useRef<HTMLElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const moveX = useRef<gsap.QuickToFunc | null>(null);
  const moveY = useRef<gsap.QuickToFunc | null>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const visual = visualRef.current;

    if (!hero || !visual) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      tl.fromTo(
        `.${styles.status}`,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7 }
      )
        .fromTo(
          `.${styles.name}`,
          { opacity: 0, y: 55 },
          { opacity: 1, y: 0, duration: 1 },
          "-=0.35"
        )
        .fromTo(
          `.${styles.role}`,
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 0.7 },
          "-=0.6"
        )
        .fromTo(
          `.${styles.description}`,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.7 },
          "-=0.45"
        )
        .fromTo(
          `.${styles.buttons}`,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.7 },
          "-=0.4"
        )
        .fromTo(
          `.${styles.visual}`,
          { opacity: 0, scale: 0.88 },
          { opacity: 1, scale: 1, duration: 1.2 },
          "-=1"
        )
        .fromTo(
          `.${styles.glassCard}`,
          { opacity: 0, scale: 0.85, y: 28 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.13,
          },
          "-=0.65"
        );

      moveX.current = gsap.quickTo(visual, "x", {
        duration: 1.2,
        ease: "power3.out",
      });

      moveY.current = gsap.quickTo(visual, "y", {
        duration: 1.2,
        ease: "power3.out",
      });
    }, hero);

    return () => {
      ctx.revert();
      moveX.current = null;
      moveY.current = null;
    };
  }, []);

  function onPointerMove(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== "mouse") return;
    if (!heroRef.current) return;

    const rect = heroRef.current.getBoundingClientRect();

    const x =
      (event.clientX - rect.left) / rect.width - 0.5;

    const y =
      (event.clientY - rect.top) / rect.height - 0.5;

    moveX.current?.(x * 12);
    moveY.current?.(y * 10);
  }

  function onPointerLeave() {
    moveX.current?.(0);
    moveY.current?.(0);
  }

  const firstName = name.trim().split(/\s+/)[0] || "Abderrazzak";
  const lastName =
    name.trim().split(/\s+/).slice(1).join(" ") || "Moujib";

  return (
    <section
      ref={heroRef}
      id="home"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={styles.hero}
      aria-labelledby="hero-title"
    >
      <div className={styles.backgroundGrid} aria-hidden="true" />
      <div className={styles.backgroundLight} aria-hidden="true" />
      <div className={styles.diagonalGlow} aria-hidden="true" />

      <div className={styles.container}>
        {/* LEFT — PERSONAL INTRODUCTION */}
        <div className={styles.content}>
          <div className={styles.status}>
            <span className={styles.statusDot} />
            <span>
              {availableForWork
                ? "Available for Work"
                : "Creative Developer"}
            </span>
          </div>

          <h1 id="hero-title" className={styles.name}>
            <span>{firstName}</span>{" "}
            <span className={styles.highlight}>
              {lastName}
            </span>
          </h1>

          <h2 className={styles.role}>{headline}</h2>

          <p className={styles.description}>
            I build modern web &amp; mobile applications and
            create meaningful digital experiences through
            design, code and motion.
          </p>

          <div className={styles.buttons}>
            <a href="#work" className={styles.primaryButton}>
              View My Work
              <ArrowUpRight size={19} />
            </a>

            <a href="#contact" className={styles.secondaryButton}>
              Get in Touch
              <ArrowRight size={18} />
            </a>
          </div>

          <div className={styles.location}>
            <MapPin size={17} />
            <span>{location}</span>
          </div>
        </div>

        {/* RIGHT — ORBIT + 3D LOGO + FLOATING GLASS */}
        <div className={styles.visualWrap}>
          <div ref={visualRef} className={styles.visual}>
            <div className={styles.orbitGlow} aria-hidden="true" />
            <div className={styles.orbit} aria-hidden="true" />
            <div className={styles.orbitInner} aria-hidden="true" />

            <div className={styles.orbitDotOne} aria-hidden="true" />
            <div className={styles.orbitDotTwo} aria-hidden="true" />
            <div className={styles.orbitDotThree} aria-hidden="true" />
            <div className={styles.orbitDotFour} aria-hidden="true" />

            <div className={styles.logo}>
              <AMLogo3D
                mode="both"
                speed={0.12}
                interactive
                className="h-full w-full"
              />
            </div>

            {services.map((service) => {
              const Icon = service.Icon;

              return (
                <div
                  key={service.id}
                  className={[
                    styles.glassCard,
                    service.position,
                    service.tone,
                  ].join(" ")}
                >
                  <div
                    className={[
                      styles.floatingInner,
                      service.float,
                    ].join(" ")}
                  >
                    <div className={styles.cardIcon}>
                      <Icon size={25} strokeWidth={1.8} />
                    </div>

                    <div className={styles.cardCopy}>
                      <h3>{service.title}</h3>
                      <p>{service.subtitle}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <a href="#work" className={styles.scrollIndicator}>
        <span className={styles.mouseIcon}>
          <span />
        </span>

        <span>Scroll Down</span>

        <ArrowDown size={17} />
      </a>

      <div className={styles.bottomWave} aria-hidden="true" />
    </section>
  );
}
