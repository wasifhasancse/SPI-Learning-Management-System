import Link from "next/link";
import { HiArrowLeft, HiMagnifyingGlass } from "react-icons/hi2";

export default function NotFound() {
  return (
    <section className="container-custom flex min-h-[65vh] items-center py-16">
      <div className="card-surface w-full overflow-hidden">
        <div className="grid items-center gap-8 bg-gradient-to-br from-[#F0FFDF] via-white to-[#FFD8DF]/60 p-8 sm:p-12 lg:grid-cols-[1fr_auto] lg:p-16">
          <div className="max-w-2xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-emerald-800">404 / Page not found</p>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">This page took a different path.</h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">The page may have moved, or the link may be incorrect. Head back home or browse the course library to continue learning.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/" className="btn-primary"><HiArrowLeft className="h-4 w-4" />Back to home</Link>
              <Link href="/courses" className="btn-secondary"><HiMagnifyingGlass className="h-4 w-4" />Browse courses</Link>
            </div>
          </div>
          <div aria-hidden="true" className="hidden h-48 w-48 items-center justify-center rounded-full border-[18px] border-white bg-[#A8DF8E] text-5xl font-extrabold text-slate-900 shadow-lg lg:flex">404</div>
        </div>
      </div>
    </section>
  );
}
