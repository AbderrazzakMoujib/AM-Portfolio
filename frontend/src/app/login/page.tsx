"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import axios from "axios";
import { ArrowRight, LockKeyhole, Loader2 } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const user = await login(email, password);

      if (!user?.is_admin) {
        throw new Error("Accès administrateur refusé.");
      }

      router.replace("/admin/dashboard");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 422) {
          setError("Email ou mot de passe incorrect.");
        } else if (err.response?.status === 419) {
          setError("Session expirée. Réessayez.");
        } else {
          setError("Connexion impossible. Vérifiez le serveur.");
        }
      } else {
        setError("Accès administrateur refusé.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0B0B12] px-5 text-white">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
  <div className="mb-5 flex justify-center">
    <Image
      src="/images/am-logo.png"
      alt="AM Portfolio Logo"
      width={120}
      height={120}
      className="h-auto w-auto rounded-2xl"
      priority
    />
  </div>

  <p className="text-xs tracking-[0.35em] text-[#00C8C8]">
    CODE • CREATE • EVOLVE
  </p>

  <h1 className="mt-8 text-3xl font-bold">
    Admin Login
  </h1>

  <p className="mt-3 text-sm text-gray-400">
    Connectez-vous à votre espace administrateur.
  </p>
</div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-3xl border border-white/10 bg-[#151520] p-8 shadow-2xl"
        >
          <div>
            <label htmlFor="email" className="mb-2 block text-sm text-gray-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full rounded-xl border border-white/10 bg-[#0B0B12] px-4 py-3 text-white outline-none focus:border-[#00C8C8]"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm text-gray-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-xl border border-white/10 bg-[#0B0B12] px-4 py-3 text-white outline-none focus:border-[#8055F8]"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#00C8C8] px-5 py-3 font-semibold text-[#0B0B12] transition hover:bg-[#00E5E5] disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <LockKeyhole size={18} />
                Sign In
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-gray-500">
          © 2026 AM Portfolio — Administration
        </p>
      </div>
    </main>
  );
}
