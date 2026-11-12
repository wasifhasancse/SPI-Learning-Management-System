"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { HiAcademicCap, HiAdjustmentsHorizontal, HiBookOpen, HiMagnifyingGlass, HiXMark } from "react-icons/hi2";
import CourseCard from "@/components/CourseCard";
import { Course, fetchCourses } from "@/lib/api";

export default function CoursesPage({ searchParams }: { searchParams: Promise<{ search?: string | string[] }> }) {
  const params = use(searchParams);
  const initialSearch = typeof params.search === "string" ? params.search : "";
  return <CourseCatalog key={initialSearch} initialSearch={initialSearch} />;
}

function CourseCatalog({ initialSearch }: { initialSearch: string }) {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [priceFilter, setPriceFilter] = useState<"all" | "free" | "paid">("all");
  const [sortBy, setSortBy] = useState<"newest" | "price-asc" | "price-desc">("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    fetchCourses()
      .then((data) => { if (active) setCourses(data); })
      .catch((err: unknown) => { console.error("Failed to load courses:", err); if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filteredCourses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const result = courses.filter((course) =>
      (!query || course.title.toLowerCase().includes(query) || (course.description || "").toLowerCase().includes(query)) &&
      (priceFilter === "all" || (priceFilter === "free" ? Number(course.price) === 0 : Number(course.price) > 0))
    );
    if (sortBy === "price-asc") result.sort((a, b) => Number(a.price) - Number(b.price));
    else if (sortBy === "price-desc") result.sort((a, b) => Number(b.price) - Number(a.price));
    else result.sort((a, b) => b.id - a.id);
    return result;
  }, [courses, searchQuery, priceFilter, sortBy]);

  const clearFilters = () => {
    setSearchQuery("");
    setPriceFilter("all");
    setSortBy("newest");
    if (initialSearch) router.replace("/courses", { scroll: false });
  };
  const hasFilters = Boolean(searchQuery || priceFilter !== "all" || sortBy !== "newest");

  return (
    <div className="container-custom space-y-8 py-12 sm:py-14">
      <div className="relative overflow-hidden rounded-3xl border border-[#A8DF8E]/50 bg-gradient-to-r from-[#F0FFDF] via-white to-[#FFD8DF]/50 p-6 sm:p-8">
        <div className="absolute -right-10 -top-14 h-48 w-48 rounded-full bg-[#A8DF8E]/25 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-800">Course Catalog</span>
            <h1 className="flex items-center gap-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-800 shadow-sm"><HiBookOpen className="h-6 w-6" /></span>Explore all courses</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Find a course, browse its lesson plan, and start learning at your own pace.</p>
          </div>
          <div className="inline-flex w-fit shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-white bg-white/90 px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm"><span className="h-2 w-2 rounded-full bg-emerald-500" />{loading ? "Loading courses..." : error ? "Courses unavailable" : `Showing ${filteredCourses.length} of ${courses.length} courses`}</div>
        </div>
      </div>

      <section className="card-surface overflow-hidden border-slate-100 p-0">
        <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F0FFDF] text-emerald-800"><HiAdjustmentsHorizontal className="h-5 w-5" /></span><div><h2 className="text-sm font-extrabold text-slate-900">Find your next course</h2><p className="mt-0.5 text-xs text-slate-500">Search and refine the catalog</p></div></div>
          {hasFilters && <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1.5 self-start rounded-lg px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-[#FFD8DF]/50 hover:text-rose-900 sm:self-auto"><HiXMark className="h-4 w-4" />Clear filters</button>}
        </div>
        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(240px,1fr)_auto] lg:items-end">
          <div>
            <label htmlFor="course-catalog-search" className="mb-2 block text-xs font-bold text-slate-700">Search courses</label>
            <div className="relative"><HiMagnifyingGlass aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /><input id="course-catalog-search" type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Try a course title or topic" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#A8DF8E] focus:bg-white focus:ring-4 focus:ring-[#A8DF8E]/20" /></div>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <fieldset>
              <legend className="mb-2 block text-xs font-bold text-slate-700">Price</legend>
              <div className="flex items-center rounded-xl bg-slate-100 p-1">
                {(["all", "free", "paid"] as const).map((price) => <button key={price} type="button" aria-pressed={priceFilter === price} onClick={() => setPriceFilter(price)} className={`rounded-lg px-4 py-2 text-xs font-bold capitalize transition ${priceFilter === price ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>{price}</button>)}
              </div>
            </fieldset>
            <div>
              <label htmlFor="course-sort" className="mb-2 block text-xs font-bold text-slate-700">Sort by</label>
              <select id="course-sort" value={sortBy} onChange={(event) => {
                const value = event.target.value;
                if (value === "newest" || value === "price-asc" || value === "price-desc") setSortBy(value);
              }} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 outline-none transition focus:border-[#A8DF8E] focus:ring-4 focus:ring-[#A8DF8E]/20">
                <option value="newest">Newest first</option><option value="price-asc">Price: Low to High</option><option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div role="status" aria-label="Loading courses" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => <div key={item} className="card-surface animate-pulse overflow-hidden"><div className="aspect-[16/10] bg-[#F0FFDF]" /><div className="space-y-3 p-5"><div className="h-4 w-1/4 rounded bg-slate-100" /><div className="h-6 w-3/4 rounded bg-slate-100" /><div className="h-4 w-full rounded bg-slate-100" /><div className="mt-4 h-10 rounded bg-slate-100" /></div></div>)}
        </div>
      ) : error ? (
        <div role="alert" className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-12 text-center text-sm text-rose-900">Could not load courses. Please refresh the page to try again.</div>
      ) : filteredCourses.length === 0 ? (
        <div className="card-surface w-full border-dashed border-[#A8DF8E] bg-gradient-to-r from-[#F0FFDF]/70 via-white to-[#FFD8DF]/30 px-6 py-12 text-center sm:px-10 sm:py-16">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-emerald-800 shadow-sm ring-1 ring-[#A8DF8E]/50"><HiAcademicCap className="h-8 w-8" /></div>
          <h2 className="mt-5 text-xl font-extrabold text-slate-900">{hasFilters ? "No courses match these filters" : "Courses are on the way"}</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">{hasFilters ? "Try a different keyword or price option. You can also clear the filters to see the full course catalog." : "There are no courses available yet. Please check back soon."}</p>
          {hasFilters && <button type="button" onClick={clearFilters} className="btn-primary mt-6 text-sm"><HiXMark className="h-4 w-4" />Clear filters</button>}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{filteredCourses.map((course) => <CourseCard key={course.id} course={course} />)}</div>
      )}
    </div>
  );
}
