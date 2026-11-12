"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "@/lib/auth-client";
import {
  HiLockClosed,
  HiEnvelope,
  HiKey,
  HiInformationCircle,
  HiArrowRight,
  HiExclamationCircle,
  HiCheckCircle
} from "react-icons/hi2";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [email, setEmail] = useState("admin@spilms.com");
  const [password, setPassword] = useState("AdminPassword123!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signIn.email({
        email,
        password
      });

      if (result.error) {
        setError(result.error.message || "Invalid email or password.");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(err.message || "An unexpected error occurred during sign-in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-12 md:py-16 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="card-surface p-8 shadow-lg border-[#A8DF8E]/50">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#A8DF8E] flex items-center justify-center text-gray-900 mx-auto mb-3 shadow-xs">
              <HiLockClosed className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Sign In</h1>
            <p className="text-xs text-gray-500 mt-1">
              Authenticate to manage courses and lecture curriculums
            </p>
          </div>

          {/* Test Credentials Helper Box for Evaluation */}
          <div className="mb-6 p-4 rounded-xl bg-[#F0FFDF] border border-[#A8DF8E] text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900">
              <HiInformationCircle className="w-4 h-4 text-emerald-700" />
              <span>Evaluation Test Credentials</span>
            </div>
            <div className="text-gray-700">
              <span className="font-semibold">Email:</span> <code className="bg-white/80 px-1 py-0.5 rounded font-mono">admin@spilms.com</code>
            </div>
            <div className="text-gray-700">
              <span className="font-semibold">Password:</span> <code className="bg-white/80 px-1 py-0.5 rounded font-mono">AdminPassword123!</code>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-[#FFD8DF] border border-[#FFAAB8] flex items-start gap-2 text-xs text-rose-900">
              <HiExclamationCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Already logged in notice */}
          {session?.user && (
            <div className="mb-5 p-3 rounded-lg bg-[#A8DF8E]/40 border border-[#A8DF8E] flex items-center justify-between text-xs text-emerald-950 font-medium">
              <div className="flex items-center gap-1.5">
                <HiCheckCircle className="w-4 h-4 text-emerald-700" />
                <span>Currently authenticated as {session.user.name}</span>
              </div>
              <Link href="/admin" className="font-bold underline">
                Go to Dashboard
              </Link>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <HiEnvelope className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@spilms.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A8DF8E] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <HiKey className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A8DF8E] focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary !py-3 text-sm font-bold uppercase tracking-wider mt-2"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <HiArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500">
            <Link href="/" className="hover:text-emerald-700 font-medium">
              &larr; Back to Student Course Catalog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

