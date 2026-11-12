"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp, useSession } from "@/lib/auth-client";
import {
  HiUserPlus,
  HiEnvelope,
  HiKey,
  HiUser,
  HiArrowRight,
  HiExclamationCircle,
  HiCheckCircle
} from "react-icons/hi2";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const result = await signUp.email({
        name: name.trim(),
        email: email.trim(),
        password: password
      });

      if (result.error) {
        setError(result.error.message || "Failed to create account.");
      } else {
        router.push("/courses");
        router.refresh();
      }
    } catch (err: any) {
      console.warn("Sign-up exception:", err);
      setError(err.message || "An unexpected error occurred during sign-up.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-12 md:py-16 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="card-surface p-8 shadow-lg border-[#A8DF8E]/50">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#A8DF8E] flex items-center justify-center text-gray-900 mx-auto mb-3 shadow-xs">
              <HiUserPlus className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create an Account</h1>
            <p className="text-xs text-gray-500 mt-1">
              Join SPI Learning Management System to manage or follow courses
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-[#FFD8DF] border border-[#FFAAB8] flex items-start gap-2 text-xs text-rose-900">
              <HiExclamationCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {session?.user && (
            <div className="mb-5 p-3 rounded-lg bg-[#A8DF8E]/40 border border-[#A8DF8E] flex items-center justify-between text-xs text-emerald-950 font-medium">
              <div className="flex items-center gap-1.5">
                <HiCheckCircle className="w-4 h-4 text-emerald-700" />
                <span>Signed in as {session.user.name}</span>
              </div>
              <Link href="/courses" className="font-bold underline">
                Browse Courses
              </Link>
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <HiUser className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Wasif Hasan"
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A8DF8E] focus:bg-white"
                />
              </div>
            </div>

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
                  placeholder="name@example.com"
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
                  placeholder="At least 8 characters"
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A8DF8E] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <HiKey className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
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
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <HiArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-700 font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

