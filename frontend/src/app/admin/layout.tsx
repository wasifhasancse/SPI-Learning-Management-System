"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  HiAcademicCap, HiArrowRightOnRectangle, HiBars3, HiBookOpen,
  HiChartBar, HiChevronRight, HiLockClosed, HiSquares2X2, HiVideoCamera, HiXMark
} from "react-icons/hi2";
import { signOut, useSession } from "@/lib/auth-client";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending, error, refetch } = useSession();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!mobileSidebarOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileSidebarOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileSidebarOpen]);

  if (pathname === "/admin/login") return <>{children}</>;

  if (isPending) {
    return (
      <div className="min-h-screen bg-[#F6F8F5]">
        <div className="mx-auto grid min-h-screen max-w-[1800px] xl:grid-cols-[280px_minmax(0,1fr)]">
          <div aria-hidden="true" className="hidden border-r border-slate-100 bg-white p-6 xl:block">
            <div className="h-12 w-40 animate-pulse rounded-xl bg-[#F0FFDF] motion-reduce:animate-none" />
            <div className="mt-12 space-y-4">{[0, 1, 2, 3].map((item) => <div key={item} className="h-10 animate-pulse rounded-xl bg-slate-100 motion-reduce:animate-none" />)}</div>
          </div>
          <div className="min-w-0">
            <div className="flex h-[76px] items-center justify-between border-b border-slate-100 bg-white px-5 sm:px-8 lg:px-10">
              <span className="text-sm font-bold text-slate-700">Loading dashboard...</span>
              <div className="flex items-center gap-3"><span aria-hidden="true" className="hidden h-3 w-24 animate-pulse rounded bg-slate-200 sm:block motion-reduce:animate-none" /><LoadingSpinner inline label="Loading dashboard" /></div>
            </div>
            <div aria-hidden="true" className="mx-auto w-full max-w-[1500px] space-y-6 p-5 sm:p-8 lg:p-10">
              <div className="h-4 w-40 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
              <div className="h-40 animate-pulse rounded-3xl bg-[#F0FFDF] motion-reduce:animate-none" />
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((item) => <div key={item} className="h-32 animate-pulse rounded-2xl bg-white motion-reduce:animate-none" />)}</div>
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(260px,0.8fr)]"><div className="h-64 animate-pulse rounded-2xl bg-white motion-reduce:animate-none" /><div className="h-64 animate-pulse rounded-2xl bg-white motion-reduce:animate-none" /></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F8F5] px-4">
        <div role="alert" className="w-full max-w-md rounded-3xl border border-[#FFAAB8]/60 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-extrabold text-slate-900">Unable to load your session</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Please try again. If the problem continues, contact the administrator.</p>
          <button type="button" onClick={() => refetch()} className="btn-primary mt-6 w-full !rounded-xl">Try again</button>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F8F5] px-4">
        <div className="w-full max-w-md rounded-3xl border border-[#FFAAB8]/60 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFD8DF] text-rose-900"><HiLockClosed className="h-7 w-7" /></div>
          <h1 className="mt-5 text-xl font-extrabold text-slate-900">Admin sign-in required</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Sign in with an administrator account to manage courses and lectures.</p>
          <Link href="/admin/login" className="btn-primary mt-6 w-full !rounded-xl">Sign in</Link>
        </div>
      </div>
    );
  }

  const userName = session.user.name?.trim() || "Admin";
  const firstName = userName.split(/\s+/)[0];
  const isDashboard = pathname === "/admin";
  const isLectureSection = pathname === "/admin/lectures" || pathname.startsWith("/admin/lectures/") || pathname.includes("/lectures");
  const isCourseSection = !isLectureSection && (pathname === "/admin/courses" || pathname.startsWith("/admin/courses/"));
  const pageTitle = isDashboard ? "Dashboard" : isLectureSection ? "Lecture Management" : "Course Management";
  const items = [
    { href: "/admin", label: "Dashboard", icon: HiSquares2X2, active: isDashboard },
    { href: "/admin/courses", label: "Course Management", icon: HiBookOpen, active: isCourseSection },
    { href: "/admin/lectures", label: "Lecture Management", icon: HiVideoCamera, active: isLectureSection }
  ];

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  const navigation = (
    <>
      <Link href="/" onClick={() => setMobileSidebarOpen(false)} aria-label="SPI LMS home" className="mb-10 flex items-center gap-3 px-2">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A8DF8E] text-slate-900 shadow-sm ring-4 ring-[#F0FFDF]"><HiAcademicCap className="h-6 w-6" /></span>
        <span>
          <span className="block text-lg font-extrabold tracking-tight text-slate-900">SPI <span className="text-emerald-800">LMS</span></span>
          <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Admin workspace</span>
        </span>
      </Link>
      <nav className="space-y-8" aria-label="Admin dashboard navigation">
        <div>
          <p className="mb-3 px-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Workspace</p>
          <div className="space-y-1.5">
            {items.map(({ href, label, icon: Icon, active }) => (
              <Link key={href} href={href} onClick={() => setMobileSidebarOpen(false)} aria-current={active ? "page" : undefined}
                className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ${active ? "bg-[#F0FFDF] text-emerald-950 shadow-sm ring-1 ring-[#A8DF8E]/60" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${active ? "bg-white text-emerald-800" : "bg-slate-50 text-slate-500 group-hover:bg-white group-hover:text-emerald-800"}`}><Icon className="h-5 w-5" /></span>
                <span className="flex-1">{label}</span>
                {active && <span className="h-1.5 w-1.5 rounded-full bg-emerald-700" />}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-3 px-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Visit site</p>
          <Link href="/courses" onClick={() => setMobileSidebarOpen(false)} className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 group-hover:bg-white group-hover:text-emerald-800"><HiAcademicCap className="h-5 w-5" /></span>
            Student course library
          </Link>
        </div>
      </nav>
      <div className="mt-auto pt-8">
        <div className="rounded-2xl border border-[#A8DF8E]/60 bg-gradient-to-br from-[#F0FFDF] to-white p-4">
          <p className="text-sm font-bold text-slate-900">Manage your learning catalog</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">Create courses and organize their video lessons from one dashboard.</p>
          <Link href="/admin/courses" onClick={() => setMobileSidebarOpen(false)} className="mt-3 inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-900 hover:underline">Open course management <HiChevronRight className="h-3.5 w-3.5" /></Link>
        </div>
        <div className="mt-4 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm">
          <div className="flex min-w-0 items-center gap-3">
            {session.user.image ? (
              <img src={session.user.image} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-white" />
            ) : (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFD8DF] text-sm font-bold text-slate-900 ring-2 ring-white">{firstName.slice(0, 1).toUpperCase()}</span>
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-bold text-slate-900">{userName}</span>
              <span className="mt-0.5 block truncate text-[10px] text-slate-500">{session.user.email || "Administrator"}</span>
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Administrator</span>
            <button type="button" onClick={handleLogout} className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-600 transition hover:bg-[#FFD8DF]/70 hover:text-rose-900"><HiArrowRightOnRectangle className="h-3.5 w-3.5" /> Sign out</button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#F6F8F5] text-slate-800">
      <div className="mx-auto grid min-h-screen max-w-[1800px] grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="sticky top-0 hidden h-screen overflow-y-auto border-r border-slate-100 bg-white px-5 py-7 xl:flex xl:flex-col">{navigation}</aside>
        <div className="min-w-0">
          <header className="sticky top-0 z-30 flex min-h-[76px] items-center justify-between gap-4 border-b border-slate-100 bg-white/95 px-5 backdrop-blur sm:px-8 lg:px-10">
            <div className="flex min-w-0 items-center gap-3">
              <button type="button" onClick={() => setMobileSidebarOpen(true)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-700 xl:hidden" aria-label="Open admin navigation" aria-expanded={mobileSidebarOpen}>
                <HiBars3 className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-semibold text-slate-400">SPI LMS / Admin</p>
                <p className="truncate text-base font-extrabold text-slate-900 sm:text-lg">{pageTitle}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3 sm:gap-4">
              <div className="hidden text-right sm:block"><p className="text-sm font-bold text-slate-900">{userName}</p><p className="text-[11px] text-slate-500">Administrator</p></div>
              {session.user.image ? <img src={session.user.image} alt="" className="h-10 w-10 rounded-full object-cover ring-2 ring-[#F0FFDF]" /> : <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFD8DF] text-sm font-bold text-slate-900">{firstName.slice(0, 1).toUpperCase()}</span>}
            </div>
          </header>
          {mobileSidebarOpen && (
            <div className="fixed inset-0 z-40 xl:hidden">
              <button type="button" className="absolute inset-0 h-full w-full bg-slate-950/30" aria-label="Close admin navigation" onClick={() => setMobileSidebarOpen(false)} />
              <aside className="relative flex h-full w-[min(84vw,320px)] flex-col overflow-y-auto border-r border-slate-100 bg-white px-5 py-6 shadow-xl">
                <button type="button" aria-label="Close admin navigation" onClick={() => setMobileSidebarOpen(false)} className="absolute right-4 top-4 rounded-lg p-2 text-slate-500 hover:bg-slate-100"><HiXMark className="h-5 w-5" /></button>
                {navigation}
              </aside>
            </div>
          )}
          <div className="mx-auto w-full max-w-[1500px] p-5 sm:p-8 lg:p-10">
            <div className="mb-6 flex items-center gap-2 text-xs text-slate-500"><HiChartBar className="h-4 w-4 text-emerald-800" /><span>Admin workspace</span><HiChevronRight className="h-3.5 w-3.5" /><span className="font-semibold text-slate-800">{pageTitle}</span></div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
