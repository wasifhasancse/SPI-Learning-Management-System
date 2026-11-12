"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HiAcademicCap, HiAdjustmentsHorizontal, HiArrowRight, HiBookOpen, HiCheckCircle, HiMagnifyingGlass, HiPlayCircle, HiShieldCheck, HiVideoCamera } from "react-icons/hi2";
import CourseCard from "@/components/CourseCard";
import { Course, fetchCourses } from "@/lib/api";

export default function HomePage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;
    fetchCourses()
      .then((data) => { if (active) setCourses(data); })
      .catch((err: unknown) => { console.error("Failed to load courses:", err); if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = search.trim();
    router.push(query ? `/courses?search=${encodeURIComponent(query)}` : "/courses");
  };
  const featuredCourse = courses[0];
  const totalLessons = courses.reduce((total, course) => total + Number(course.lecture_count ?? 0), 0);

  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-[#F0FFDF]">
        <div className="container-custom grid min-h-[540px] items-center gap-10 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div className="relative z-10 max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#A8DF8E] bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-900"><HiAcademicCap className="h-4 w-4" />Practical online learning</div>
            <h1 className="max-w-2xl text-4xl font-extrabold leading-[1.12] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">Learn skills that move your <span className="text-emerald-800">future forward.</span></h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">Explore focused courses, follow clear lesson sequences, and learn at your own pace with SPI LMS.</p>
            <form onSubmit={submitSearch} className="mt-8 flex max-w-xl gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
              <label htmlFor="course-search" className="sr-only">Search courses</label>
              <div className="flex min-w-0 flex-1 items-center gap-3 px-3"><HiMagnifyingGlass className="h-5 w-5 shrink-0 text-slate-400" /><input id="course-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="What would you like to learn?" className="w-full bg-transparent py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400" /></div>
              <button type="submit" className="btn-primary shrink-0 !rounded-xl !px-3 text-xs sm:!px-5 sm:text-sm">Find a course</button>
            </form>
            <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm font-semibold text-slate-600">
              <span className="inline-flex items-center gap-2"><HiBookOpen className="h-4 w-4 text-emerald-700" />{loading || error ? "—" : courses.length} courses</span>
              <span className="inline-flex items-center gap-2"><HiVideoCamera className="h-4 w-4 text-emerald-700" />Structured video lessons</span>
              <span className="inline-flex items-center gap-2"><HiShieldCheck className="h-4 w-4 text-emerald-700" />Secure course management</span>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -left-8 top-10 h-24 w-24 rounded-full bg-[#FFD8DF] blur-2xl" />
            <div className="absolute -right-3 bottom-8 h-32 w-32 rounded-full bg-[#A8DF8E] blur-2xl" />
            <div className="relative rounded-[2rem] border border-white bg-white p-3 shadow-[0_24px_70px_rgba(31,41,55,0.12)]">
              {loading ? (
                <div role="status" aria-label="Loading featured course" className="h-[300px] animate-pulse rounded-[1.5rem] bg-[#F0FFDF] sm:h-[360px] motion-reduce:animate-none" />
              ) : featuredCourse?.thumbnail_url ? (
                <img src={featuredCourse.thumbnail_url} alt="" className="h-[300px] w-full rounded-[1.5rem] object-cover sm:h-[360px]" />
              ) : (
                <div className="flex h-[300px] flex-col items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-white via-[#F0FFDF] to-[#FFD8DF] sm:h-[360px]"><div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-emerald-800 shadow-sm"><HiAcademicCap className="h-10 w-10" /></div><p className="mt-5 text-sm font-bold text-slate-700">Your next skill starts here</p></div>
              )}
              {featuredCourse && <Link href={`/courses/${featuredCourse.id}`} className="absolute bottom-7 left-7 right-7 flex items-center justify-between gap-4 rounded-2xl bg-white/95 p-4 shadow-lg backdrop-blur transition hover:-translate-y-0.5"><span className="min-w-0"><span className="block text-[11px] font-bold uppercase tracking-wider text-emerald-800">Featured course</span><span className="mt-1 block truncate text-sm font-bold text-slate-900">{featuredCourse.title}</span></span><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#A8DF8E] text-slate-900"><HiPlayCircle className="h-6 w-6" /></span></Link>}
            </div>
          </div>
        </div>
      </section>

      <section className="container-custom py-16 sm:py-20">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><span className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">Learn something new</span><h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">Explore our courses</h2><p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">Browse the latest courses and open a lesson whenever you are ready.</p></div>
          <Link href="/courses" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-800 hover:text-emerald-950">Browse all courses <HiArrowRight className="h-4 w-4" /></Link>
        </div>
        {loading ? (
          <div role="status" aria-label="Loading courses" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((item) => <div key={item} className="overflow-hidden rounded-2xl border border-slate-100 bg-white"><div className="aspect-[16/10] animate-pulse bg-[#F0FFDF]" /><div className="space-y-3 p-5"><div className="h-4 w-1/3 animate-pulse rounded bg-slate-100" /><div className="h-6 w-3/4 animate-pulse rounded bg-slate-100" /><div className="h-4 animate-pulse rounded bg-slate-100" /></div></div>)}
          </div>
        ) : error ? (
          <div role="alert" className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-12 text-center text-sm text-rose-900">Could not load courses. Please refresh the page to try again.</div>
        ) : courses.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{courses.slice(0, 3).map((course) => <CourseCard key={course.id} course={course} />)}</div>
        ) : (
          <div className="w-full rounded-3xl border border-dashed border-[#A8DF8E] bg-gradient-to-r from-[#F0FFDF]/70 via-white to-[#FFD8DF]/30 px-6 py-14 text-center"><HiBookOpen className="mx-auto h-10 w-10 text-emerald-800" /><h3 className="mt-4 text-lg font-bold text-slate-900">Courses are on the way</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">There are no courses available yet. Administrators can add the first course from the dashboard.</p><Link href="/admin" className="btn-primary mt-5">Open admin dashboard</Link></div>
        )}
      </section>

      <section className="border-y border-slate-100 bg-slate-50">
        <div className="container-custom grid gap-8 py-14 md:grid-cols-3">
          {[
            { icon: HiBookOpen, title: "Clear course structure", description: "Every course brings its lectures together in an easy-to-follow sequence." },
            { icon: HiVideoCamera, title: "Learn by watching", description: "Open lessons in the built-in player with support for common video providers." },
            { icon: HiShieldCheck, title: "A focused learning space", description: "Learners explore courses while administrators manage the catalog securely." }
          ].map(({ icon: Icon, title, description }) => <article key={title} className="rounded-2xl border border-slate-100 bg-white p-6"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0FFDF] text-emerald-800"><Icon className="h-5 w-5" /></span><h3 className="mt-5 text-base font-bold text-slate-900">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p></article>)}
        </div>
      </section>

      <section className="container-custom py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-800">Simple by design</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">A clear path from discovery to learning.</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">Find a topic that matters to you, follow each course in order, and return whenever you are ready for the next lesson.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <div className="rounded-2xl border border-[#A8DF8E]/60 bg-[#F0FFDF] px-5 py-4"><p className="text-2xl font-extrabold text-slate-900">{loading || error ? "—" : courses.length}</p><p className="mt-1 text-xs font-semibold text-slate-600">Available courses</p></div>
              <div className="rounded-2xl border border-[#FFAAB8]/60 bg-[#FFD8DF]/50 px-5 py-4"><p className="text-2xl font-extrabold text-slate-900">{loading || error ? "—" : totalLessons}</p><p className="mt-1 text-xs font-semibold text-slate-600">Video lessons</p></div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { number: "01", icon: HiMagnifyingGlass, title: "Choose a course", description: "Search the catalog and find a course that fits your goals." },
              { number: "02", icon: HiBookOpen, title: "Follow the lessons", description: "Explore the curriculum in a clear, organized sequence." },
              { number: "03", icon: HiPlayCircle, title: "Learn at your pace", description: "Watch each lesson when it works for you and revisit it anytime." }
            ].map(({ number, icon: Icon, title, description }) => <article key={number} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"><div className="flex items-center justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0FFDF] text-emerald-800"><Icon className="h-5 w-5" /></span><span className="text-xs font-extrabold tracking-widest text-slate-300">{number}</span></div><h3 className="mt-5 text-sm font-extrabold text-slate-900">{title}</h3><p className="mt-2 text-xs leading-5 text-slate-600">{description}</p></article>)}
          </div>
        </div>
      </section>

      <section className="bg-[#F0FFDF]/60 py-16 sm:py-20">
        <div className="container-custom grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-xl">
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-800">Find the right course</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Make your next learning choice with confidence.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">From your first search to the first lesson, everything you need to explore a course is in one place.</p>
            <ul className="mt-7 space-y-5">
              {[
                { title: "Narrow down the catalog", description: "Search by topic and filter courses by price." },
                { title: "Explore before you start", description: "Read the course overview and see the available lessons." },
                { title: "Choose when to play", description: "Select a lesson and start the video when you are ready." }
              ].map(({ title, description }) => (
                <li key={title} className="flex items-start gap-3">
                  <HiCheckCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                  <div><h3 className="text-sm font-extrabold text-slate-900">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{description}</p></div>
                </li>
              ))}
            </ul>
            <Link href="/courses" className="btn-primary mt-8">Explore the catalog <HiArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="rounded-[2rem] border border-white bg-white p-5 shadow-[0_20px_60px_rgba(31,41,55,0.08)] sm:p-8">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-emerald-800">Your course toolkit</p><h3 className="mt-2 text-xl font-extrabold text-slate-900">Made for easy exploration</h3></div>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F0FFDF] text-emerald-800"><HiAdjustmentsHorizontal className="h-6 w-6" /></span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                { icon: HiMagnifyingGlass, title: "Search & filter", description: "Find courses by keyword or price.", color: "bg-[#F0FFDF]" },
                { icon: HiBookOpen, title: "Course overview", description: "Get to know the course and its content.", color: "bg-[#FFD8DF]/60" },
                { icon: HiVideoCamera, title: "Lesson list", description: "Browse the course curriculum in one place.", color: "bg-[#FFD8DF]/60" },
                { icon: HiPlayCircle, title: "Video player", description: "Watch a selected lesson at your own pace.", color: "bg-[#F0FFDF]" }
              ].map(({ icon: Icon, title, description, color }) => (
                <div key={title} className="rounded-2xl border border-slate-100 p-4">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-emerald-800 ${color}`}><Icon aria-hidden="true" className="h-5 w-5" /></span>
                  <h4 className="mt-3 text-sm font-extrabold text-slate-900">{title}</h4>
                  <p className="mt-1 text-xs leading-5 text-slate-600">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-custom grid gap-8 py-16 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-800">Good to know</span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Questions before you begin?</h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-slate-600">Here are a few helpful things to know as you explore SPI LMS.</p>
          <Link href="/courses" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-emerald-800 hover:text-emerald-950">Find a course <HiArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="space-y-3">
          {[
            { question: "How do I find a course?", answer: "Search for a title or topic on the home page or in the course catalog. You can also filter the catalog by price and sort the results." },
            { question: "What can I see on a course page?", answer: "Each course page shows its overview, price, and available lessons. Select a lesson from the curriculum to load it in the player." },
            { question: "Will a lesson start playing automatically?", answer: "No. Once a lesson is loaded, press play when you are ready to watch." },
            { question: "Are there free courses?", answer: "The catalog includes a free price filter, so you can easily check whether any free courses are currently available." }
          ].map(({ question, answer }) => (
            <details key={question} name="home-faq" className="group rounded-2xl border border-slate-200 bg-white px-5 transition-colors open:border-[#A8DF8E] open:bg-[#F0FFDF]/40 sm:px-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg py-5 text-sm font-extrabold text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 [&::-webkit-details-marker]:hidden">
                {question}<span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg font-medium text-emerald-800 transition-transform group-open:rotate-45 group-open:bg-white">+</span>
              </summary>
              <p className="pb-5 pr-8 text-sm leading-6 text-slate-600">{answer}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="container-custom pb-14">
        <div className="flex flex-col items-start justify-between gap-5 rounded-3xl bg-slate-900 px-7 py-9 text-white sm:flex-row sm:items-center sm:px-10"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#A8DF8E]">Your learning space</p><h2 className="mt-2 text-2xl font-extrabold">Ready to find your next lesson?</h2><p className="mt-2 text-sm text-slate-300">Browse the course library and find your next lesson.</p></div><Link href="/courses" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#A8DF8E] px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-[#b9e8a4]">Browse courses <HiArrowRight className="h-4 w-4" /></Link></div>
      </section>
    </div>
  );
}
