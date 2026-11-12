"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  HiAcademicCap,
  HiBars3,
  HiXMark,
  HiArrowRightOnRectangle,
  HiLockClosed,
  HiUser,
  HiChevronDown,
  HiChevronUp,
  HiPencilSquare,
  HiBookOpen,
  HiCog6Tooth,
  HiChatBubbleLeftRight,
  HiSquares2X2,
  HiVideoCamera
} from "react-icons/hi2";
import { useSession, signOut } from "@/lib/auth-client";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: session, isPending, error, refetch } = useSession();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    await signOut();
    router.push("/");
    router.refresh();
  };

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  const userDisplayName = session?.user?.name || "User";
  const userFirstName = userDisplayName.split(" ")[0];
  const userEmail = session?.user?.email || "user@spilms.com";
  const userImage = session?.user?.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80";

  if (pathname.startsWith("/admin") || pathname === "/dashboard") {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-[#A8DF8E]/40 shadow-xs">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#A8DF8E] flex items-center justify-center text-gray-900 shadow-sm group-hover:scale-105 transition-transform">
              <HiAcademicCap className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-gray-900 block leading-tight">
                SPI <span className="text-emerald-700">LMS</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 hidden sm:block">
                Learning Management System
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                isActive("/") && pathname === "/"
                  ? "bg-[#A8DF8E] text-gray-900 shadow-xs"
                  : "text-gray-700 hover:bg-[#F0FFDF] hover:text-gray-900"
              }`}
            >
              Home
            </Link>

            <Link
              href="/courses"
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                isActive("/courses")
                  ? "bg-[#A8DF8E] text-gray-900 shadow-xs"
                  : "text-gray-700 hover:bg-[#F0FFDF] hover:text-gray-900"
              }`}
            >
              Courses
            </Link>

            <Link
              href="/about"
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                isActive("/about")
                  ? "bg-[#A8DF8E] text-gray-900 shadow-xs"
                  : "text-gray-700 hover:bg-[#F0FFDF] hover:text-gray-900"
              }`}
            >
              About
            </Link>

            <Link
              href="/contact"
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                isActive("/contact")
                  ? "bg-[#A8DF8E] text-gray-900 shadow-xs"
                  : "text-gray-700 hover:bg-[#F0FFDF] hover:text-gray-900"
              }`}
            >
              Contact
            </Link>

            {session?.user && (
              <Link
                href="/admin"
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive("/admin")
                    ? "bg-[#A8DF8E] text-gray-900 shadow-xs"
                    : "text-gray-700 hover:bg-[#F0FFDF] hover:text-gray-900"
                }`}
              >
                <HiSquares2X2 className="w-4 h-4 text-emerald-800" />
                <span>Dashboard</span>
              </Link>
            )}
          </nav>

          {/* Desktop Right Actions (Auth / Status with Reference Image 1 Dropdown) */}
          <div className="hidden md:flex items-center gap-3">
            {isPending ? (
              <div className="flex h-10 items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-3">
                <LoadingSpinner inline label="Loading profile" />
                <span aria-hidden="true" className="h-2.5 w-16 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
              </div>
            ) : error && !session?.user ? (
              <button type="button" onClick={() => refetch()} className="rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-900" aria-label="Profile unavailable. Retry loading session">
                Profile unavailable · Retry
              </button>
            ) : session?.user ? (
              /* Signed In User Profile Dropdown (matching Image 1) */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-1.5 pr-3 py-1 bg-[#F0FFDF] hover:bg-[#A8DF8E]/40 border border-[#A8DF8E] rounded-full transition-all cursor-pointer shadow-2xs"
                  aria-expanded={userDropdownOpen}
                >
                  <img
                    src={userImage}
                    alt={userDisplayName}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-white"
                  />
                  <span className="text-xs font-bold text-gray-800">
                    {userFirstName}
                  </span>
                  {userDropdownOpen ? (
                    <HiChevronUp className="w-3.5 h-3.5 text-gray-600" />
                  ) : (
                    <HiChevronDown className="w-3.5 h-3.5 text-gray-600" />
                  )}
                </button>

                {/* Dropdown Card */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    {/* Header info */}
                    <div className="px-4 py-3 flex items-center gap-3">
                      <img
                        src={userImage}
                        alt={userDisplayName}
                        className="w-11 h-11 rounded-full object-cover border border-[#A8DF8E]"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-gray-900 truncate">
                          {userDisplayName}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {userEmail}
                        </div>
                      </div>
                    </div>

                    <div className="h-px bg-gray-100 my-1" />

                    {/* Menu links - Reference Image 1 with Relevant LMS Tabs */}
                    <div className="py-1">
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-[#F0FFDF] transition-colors"
                      >
                        <HiSquares2X2 className="w-4 h-4 text-emerald-700" />
                        <span className="font-bold text-gray-900">Dashboard</span>
                      </Link>

                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-[#F0FFDF] transition-colors"
                      >
                        <HiBookOpen className="w-4 h-4 text-gray-500" />
                        <span>Course Management</span>
                      </Link>

                      <Link
                        href="/admin/lectures"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-[#F0FFDF] transition-colors"
                      >
                        <HiVideoCamera className="w-4 h-4 text-gray-500" />
                        <span>Lecture Management</span>
                      </Link>

                      <Link
                        href="/about"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-[#F0FFDF] transition-colors"
                      >
                        <HiCog6Tooth className="w-4 h-4 text-gray-500" />
                        <span>Settings</span>
                      </Link>
                    </div>

                    <div className="h-px bg-gray-100 my-1" />

                    {/* Sign Out */}
                    <div className="pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-[#FFD8DF]/50 transition-colors cursor-pointer text-left"
                      >
                        <HiArrowRightOnRectangle className="w-4 h-4 text-rose-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Signed Out: Only Sign In button (no sign up button) */
              <div className="flex items-center">
                <Link
                  href="/login"
                  className="btn-primary !py-1.5 !px-4 text-xs font-bold shadow-2xs"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-700 hover:bg-[#F0FFDF] focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? (
                <HiXMark className="w-6 h-6" />
              ) : (
                <HiBars3 className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#A8DF8E]/30 bg-white px-4 pt-3 pb-5 space-y-2">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg text-sm font-semibold ${
              isActive("/") && pathname === "/"
                ? "bg-[#A8DF8E] text-gray-900"
                : "text-gray-700 hover:bg-[#F0FFDF]"
            }`}
          >
            Home
          </Link>
          <Link
            href="/courses"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg text-sm font-semibold ${
              isActive("/courses")
                ? "bg-[#A8DF8E] text-gray-900"
                : "text-gray-700 hover:bg-[#F0FFDF]"
            }`}
          >
            Courses
          </Link>
          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg text-sm font-semibold ${
              isActive("/about")
                ? "bg-[#A8DF8E] text-gray-900"
                : "text-gray-700 hover:bg-[#F0FFDF]"
            }`}
          >
            About
          </Link>
          <Link
            href="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg text-sm font-semibold ${
              isActive("/contact")
                ? "bg-[#A8DF8E] text-gray-900"
                : "text-gray-700 hover:bg-[#F0FFDF]"
            }`}
          >
            Contact
          </Link>
          <Link
            href="/admin/courses"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${
              isActive("/admin")
                ? "bg-[#A8DF8E] text-gray-900"
                : "text-gray-700 hover:bg-[#F0FFDF]"
            }`}
          >
            <HiSquares2X2 className="w-4 h-4 text-emerald-800" />
            <span>Dashboard</span>
          </Link>

          <div className="pt-3 border-t border-gray-100">
            {isPending ? (
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <LoadingSpinner inline label="Loading profile" />
                <span className="text-xs font-semibold text-slate-600">Loading profile...</span>
              </div>
            ) : error && !session?.user ? (
              <button type="button" onClick={() => refetch()} className="w-full rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-900">
                Profile unavailable · Retry
              </button>
            ) : session?.user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 bg-[#F0FFDF] rounded-xl">
                  <img
                    src={userImage}
                    alt={userDisplayName}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-gray-900 truncate">{userDisplayName}</div>
                    <div className="text-[10px] text-gray-500 truncate">{userEmail}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full btn-danger text-xs font-bold"
                >
                  <HiArrowRightOnRectangle className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary text-center block text-xs font-bold w-full !py-2.5"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
