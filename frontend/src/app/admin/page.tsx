"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HiAcademicCap, HiArrowRight, HiBookOpen, HiPlus, HiVideoCamera } from "react-icons/hi2";
import { useSession } from "@/lib/auth-client";
import { Course, Lecture, fetchCourses, fetchLectures } from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([fetchCourses(), fetchLectures()])
      .then(([courseData, lectureData]) => {
        if (active) {
          setCourses(courseData);
          setLectures(lectureData);
        }
      })
      .catch((error: unknown) => {
        console.error("Failed to load dashboard data:", error);
        if (active) setError(true);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const name = session?.user?.name?.trim().split(/\s+/)[0] || "Admin";
  const recentCourses = [...courses].sort((a, b) => b.id - a.id).slice(0, 5);
  const stats = [
    { label: "Total courses", value: courses.length, icon: HiBookOpen, color: "bg-[#F0FFDF] text-emerald-800", description: "Courses in your catalog" },
    { label: "Total lessons", value: lectures.length, icon: HiVideoCamera, color: "bg-[#FFD8DF] text-rose-800", description: "Video lessons available" },
    { label: "Free courses", value: courses.filter((course) => Number(course.price) === 0).length, icon: HiAcademicCap, color: "bg-emerald-50 text-emerald-800", description: "Open to learners" }
  ];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-[#A8DF8E]/50 bg-gradient-to-r from-[#F0FFDF] via-white to-[#FFD8DF]/40 p-6 sm:p-8">
        <div className="absolute -right-10 -top-20 h-52 w-52 rounded-full bg-[#A8DF8E]/25 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">Your learning workspace</p>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Welcome back, {name}</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">Manage your courses and lessons, and keep your learning catalog organized in one place.</p>
          </div>
          <Link href="/admin/courses" className="btn-primary shrink-0 text-sm">Manage courses <HiArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      <section aria-label="Catalog overview" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, color, description }) => (
          <article key={label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div><p className="text-xs font-bold text-slate-500">{label}</p><div className="mt-2 flex h-9 items-center text-3xl font-extrabold text-slate-900">{loading ? <LoadingSpinner inline label={`Loading ${label.toLowerCase()}`} /> : error ? <span aria-label={`${label} unavailable`}>—</span> : value}</div></div>
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}><Icon className="h-5 w-5" /></span>
            </div>
            <p className="mt-4 text-xs text-slate-500">{description}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(260px,0.8fr)]">
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div><h2 className="font-bold text-slate-900">Recently added courses</h2><p className="mt-1 text-xs text-slate-500">Latest entries in the course catalog</p></div>
            <Link href="/admin/courses" className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-emerald-800 hover:underline">All courses <HiArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
          {loading ? (
            <div role="status" aria-label="Loading courses" className="space-y-3 p-5">{[0, 1, 2].map((item) => <div key={item} className="h-12 animate-pulse rounded-lg bg-slate-100" />)}</div>
          ) : error ? (
            <p role="alert" className="px-5 py-10 text-center text-sm text-rose-800">Could not load catalog data. Please refresh the page to try again.</p>
          ) : recentCourses.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3 font-semibold">Course</th><th className="px-5 py-3 font-semibold">Lessons</th><th className="px-5 py-3 font-semibold">Price</th><th className="px-5 py-3 text-right font-semibold">Manage</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {recentCourses.map((course) => (
                    <tr key={course.id} className="transition hover:bg-slate-50/70">
                      <td className="max-w-[250px] px-5 py-4"><span className="block truncate font-semibold text-slate-800">{course.title}</span></td>
                      <td className="px-5 py-4 text-slate-600">{lectures.filter((lecture) => lecture.course_id === course.id).length}</td>
                      <td className="px-5 py-4 text-slate-600">{Number(course.price) === 0 ? "Free" : `$${Number(course.price).toFixed(2)}`}</td>
                      <td className="px-5 py-4 text-right"><Link href={`/admin/courses/${course.id}/lectures`} className="text-xs font-bold text-emerald-800 hover:underline">Edit lessons</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="w-full bg-gradient-to-r from-[#F0FFDF]/50 via-white to-[#FFD8DF]/25 px-5 py-12 text-center">
              <HiBookOpen className="mx-auto h-9 w-9 text-slate-300" /><h3 className="mt-3 font-bold text-slate-900">Your catalog is empty</h3>
              <p className="mt-1 text-sm text-slate-500">Create a course to start publishing lessons.</p>
              <Link href="/admin/courses" className="btn-primary mt-4 !rounded-xl"><HiPlus className="h-4 w-4" /> Create a course</Link>
            </div>
          )}
        </div>
        <aside className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-900">Dashboard tools</h2>
          <p className="mt-1 text-xs text-slate-500">Manage the learning content on SPI LMS.</p>
          <div className="mt-5 space-y-3">
            <Link href="/admin/courses" className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-4 transition hover:border-[#A8DF8E] hover:bg-[#F0FFDF]/50">
              <span className="flex items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F0FFDF] text-emerald-900"><HiPlus className="h-4 w-4" /></span><span><span className="block text-sm font-bold text-slate-900">Course Management</span><span className="mt-0.5 block text-xs text-slate-500">Create, edit, or remove courses</span></span></span><HiArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
            </Link>
            <Link href="/admin/lectures" className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-4 transition hover:border-[#FFAAB8] hover:bg-[#FFD8DF]/25">
              <span className="flex items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FFD8DF] text-rose-900"><HiVideoCamera className="h-4 w-4" /></span><span><span className="block text-sm font-bold text-slate-900">Lecture Management</span><span className="mt-0.5 block text-xs text-slate-500">Organize video lessons by course</span></span></span><HiArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
            </Link>
          </div>
          <p className="mt-5 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">{loading ? "Loading catalog data..." : error ? "Catalog data is unavailable." : `${courses.length} courses contain ${lectures.length} lessons.`}</p>
        </aside>
      </section>
    </div>
  );
}
