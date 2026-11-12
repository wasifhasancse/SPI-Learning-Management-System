"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Course, Lecture, fetchCourseById, fetchLecturesByCourse } from "@/lib/api";
import { getEmbedVideoUrl } from "@/lib/videoHelper";
import {
  HiAcademicCap,
  HiArrowLeft,
  HiArrowRight,
  HiCheckCircle,
  HiExclamationTriangle,
  HiInformationCircle,
  HiPlay,
  HiVideoCamera
} from "react-icons/hi2";

export default function CourseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: courseId } = use(params);
  const [course, setCourse] = useState<Course | null>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [activeLecture, setActiveLecture] = useState<Lecture | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const [courseData, lecturesData] = await Promise.all([
          fetchCourseById(courseId),
          fetchLecturesByCourse(courseId)
        ]);
        if (active) {
          setCourse(courseData);
          setLectures(lecturesData);
          setActiveLecture(lecturesData[0] ?? null);
        }
      } catch (err: unknown) {
        console.error("Failed to load course details:", err);
        if (active) setError(err instanceof Error ? err.message : "Could not retrieve course or lectures.");
      } finally {
        if (active) setLoading(false);
      }
    }
    loadData();
    return () => { active = false; };
  }, [courseId]);

  if (loading) {
    return (
      <div className="container-custom space-y-7 py-8 sm:py-12" aria-busy="true" aria-label="Loading course details">
        <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
        <div className="card-surface grid animate-pulse overflow-hidden p-3 sm:grid-cols-[minmax(240px,0.8fr)_1.2fr] sm:gap-6 sm:p-5">
          <div className="aspect-[16/10] rounded-2xl bg-[#F0FFDF] sm:aspect-auto sm:min-h-56" />
          <div className="flex flex-col justify-center space-y-4 p-3 sm:p-6">
            <div className="h-4 w-32 rounded bg-slate-200" />
            <div className="h-8 w-4/5 rounded bg-slate-200" />
            <div className="h-4 w-full rounded bg-slate-100" />
            <div className="h-4 w-3/4 rounded bg-slate-100" />
            <div className="flex gap-3 pt-2">
              <div className="h-8 w-24 rounded-full bg-[#F0FFDF]" />
              <div className="h-8 w-28 rounded-full bg-[#FFD8DF]/70" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(320px,0.9fr)]">
          <div className="space-y-5">
            <div className="card-surface animate-pulse overflow-hidden p-3">
              <div className="aspect-video rounded-xl bg-slate-900/10" />
            </div>
            <div className="card-surface animate-pulse space-y-4 p-6">
              <div className="h-4 w-28 rounded bg-slate-200" />
              <div className="h-7 w-3/5 rounded bg-slate-200" />
              <div className="h-4 w-full rounded bg-slate-100" />
              <div className="h-4 w-4/5 rounded bg-slate-100" />
            </div>
          </div>
          <div className="card-surface animate-pulse space-y-4 p-5">
            <div className="h-6 w-40 rounded bg-slate-200" />
            {[1, 2, 3, 4].map((item) => <div key={item} className="h-[68px] rounded-xl bg-slate-100" />)}
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container-custom py-12 sm:py-16">
        <div className="card-surface w-full overflow-hidden">
          <div className="bg-gradient-to-r from-[#FFD8DF]/70 via-white to-[#F0FFDF] px-6 py-14 text-center sm:px-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-rose-800 shadow-sm">
              <HiExclamationTriangle className="h-7 w-7" />
            </div>
            <h1 className="mt-5 text-2xl font-extrabold text-slate-900">Course unavailable</h1>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">{error || "This course could not be found or may no longer be available."}</p>
            <Link href="/courses" className="btn-primary mt-6"><HiArrowLeft className="h-4 w-4" /> Browse all courses</Link>
          </div>
        </div>
      </div>
    );
  }

  const embedInfo = activeLecture ? getEmbedVideoUrl(activeLecture.video_url) : null;
  const formattedPrice = Number(course.price) === 0 ? "Free access" : `$${Number(course.price).toFixed(2)}`;

  return (
    <div className="container-custom space-y-7 py-8 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/courses" className="inline-flex items-center gap-2 rounded-lg text-sm font-bold text-slate-600 transition hover:text-emerald-900">
          <HiArrowLeft className="h-4 w-4 text-emerald-700" /> All courses
        </Link>
        <div className="text-xs font-medium text-slate-400">
          Course catalog <span className="mx-1.5">/</span> <span className="font-bold text-slate-600">{course.title}</span>
        </div>
      </div>

      <section className="card-surface grid overflow-hidden border-slate-100 bg-white p-3 sm:grid-cols-[minmax(240px,0.8fr)_1.2fr] sm:gap-6 sm:p-5">
        <div className="relative min-h-52 overflow-hidden rounded-2xl bg-gradient-to-br from-[#F0FFDF] to-[#FFD8DF] sm:min-h-64">
          {course.thumbnail_url ? (
            <img src={course.thumbnail_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-emerald-900"><HiAcademicCap className="h-20 w-20 opacity-50" /></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-950/5 to-transparent" />
          <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-800 shadow-sm">
            <HiVideoCamera className="h-4 w-4 text-emerald-800" /> {lectures.length} {lectures.length === 1 ? "lesson" : "lessons"}
          </span>
        </div>
        <div className="flex min-w-0 flex-col justify-center px-2 py-5 sm:px-4 sm:py-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge-green"><HiAcademicCap className="h-3.5 w-3.5" /> SPI LMS Course</span>
            <span className="badge-pink">{formattedPrice}</span>
          </div>
          <h1 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">{course.title}</h1>
          <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-600 sm:text-base">
            {course.description || "Explore the lessons in this course and learn at your own pace."}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500">
            <span className="inline-flex items-center gap-2"><HiVideoCamera className="h-4 w-4 text-emerald-700" />{lectures.length} video lessons</span>
            <span className="inline-flex items-center gap-2"><HiCheckCircle className="h-4 w-4 text-emerald-700" />On-demand learning</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(320px,0.9fr)]">
        <div className="min-w-0 space-y-5">
          <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-lg">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#A8DF8E] text-slate-900"><HiPlay className="h-4 w-4" /></span>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Course player</p>
                  <p className="truncate text-sm font-bold text-white">{activeLecture?.title || "Choose a lesson to begin"}</p>
                </div>
              </div>
              {activeLecture && <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-slate-300">Lesson {activeLecture.order_index}</span>}
            </div>
            <div className="relative flex aspect-video items-center justify-center bg-black">
              {activeLecture && embedInfo ? (
                embedInfo.type === "direct" ? (
                  <video key={activeLecture.id} src={embedInfo.embedUrl} controls preload="none" poster={course.thumbnail_url || undefined} playsInline className="h-full w-full object-contain" />
                ) : (
                  <iframe key={activeLecture.id} src={embedInfo.embedUrl} title={activeLecture.title} loading="lazy" allow="encrypted-media; picture-in-picture; web-share" allowFullScreen className="h-full w-full border-0" />
                )
              ) : (
                <div className="max-w-sm px-6 text-center text-slate-300">
                  <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-[#A8DF8E]"><HiVideoCamera className="h-8 w-8" /></span>
                  <p className="mt-4 font-bold text-white">Your lessons are ready</p>
                  <p className="mt-2 text-xs leading-5 text-slate-400">Select a lesson from the course content to load the video. Playback starts only when you press play.</p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3 text-xs text-slate-400 sm:px-5">
              <span>{activeLecture ? "Press play when you are ready to watch." : "Select a lesson to load the player."}</span>
              {activeLecture && <span className="shrink-0 font-semibold text-[#A8DF8E]">Ready to play</span>}
            </div>
          </section>

          {activeLecture && (
            <section className="card-surface border-slate-100 p-5 sm:p-7">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
                <span className="rounded-full bg-[#F0FFDF] px-3 py-1.5">Lesson {activeLecture.order_index}</span>
                <span className="text-slate-300">/</span>
                <span className="text-slate-500">Selected lesson</span>
              </div>
              <h2 className="mt-4 text-xl font-extrabold leading-snug text-slate-900 sm:text-2xl">{activeLecture.title}</h2>
              <p className="mt-3 whitespace-pre-line border-t border-slate-100 pt-4 text-sm leading-7 text-slate-600">
                {activeLecture.description || "No additional notes are available for this lesson."}
              </p>
            </section>
          )}
          <section className="card-surface border-slate-100 p-5 sm:p-7">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFD8DF]/70 text-rose-900"><HiAcademicCap className="h-5 w-5" /></span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-800">Course overview</p>
                <h2 className="mt-0.5 text-lg font-extrabold text-slate-900">About this course</h2>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-600">{course.description || "Learn practical skills and best practices through this curated course."}</p>
          </section>
        </div>

        <aside className="min-w-0">
          <section className="card-surface overflow-hidden border-slate-100 lg:sticky lg:top-24">
            <div className="border-b border-slate-100 bg-gradient-to-r from-[#F0FFDF]/80 to-white px-5 py-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-800">Course curriculum</p>
                  <h2 className="mt-1 text-lg font-extrabold text-slate-900">Course content</h2>
                  <p className="mt-1 text-xs text-slate-500">{lectures.length} lessons available</p>
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-800 shadow-sm"><HiVideoCamera className="h-5 w-5" /></span>
              </div>
            </div>
            {lectures.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <HiInformationCircle className="mx-auto h-9 w-9 text-slate-300" />
                <p className="mt-3 text-sm font-bold text-slate-700">Lessons coming soon</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">There are no lectures in this course yet.</p>
              </div>
            ) : (
              <div className="max-h-[min(65vh,680px)] space-y-2 overflow-y-auto p-3 sm:p-4">
                {lectures.map((lecture, index) => {
                  const isCurrent = activeLecture?.id === lecture.id;
                  return (
                    <button
                      key={lecture.id}
                      type="button"
                      onClick={() => setActiveLecture(lecture)}
                      aria-current={isCurrent ? "true" : undefined}
                      className={`group flex w-full cursor-pointer items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
                        isCurrent ? "border-[#A8DF8E] bg-[#F0FFDF] text-slate-900 shadow-sm" : "border-slate-100 bg-white text-slate-700 hover:border-[#A8DF8E]/70 hover:bg-[#F0FFDF]/50"
                      }`}
                    >
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold ${isCurrent ? "bg-[#A8DF8E] text-emerald-950" : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-emerald-800"}`}>{index + 1}</span>
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-2 text-sm font-bold leading-5">{lecture.title}</span>
                        <span className="mt-1 block text-[11px] font-medium text-slate-500">Lesson {lecture.order_index}</span>
                      </span>
                      {isCurrent ? (
                        <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-emerald-800"><HiPlay className="h-3.5 w-3.5" /></span>
                      ) : (
                        <HiArrowRight className="mt-2 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-emerald-800" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
            <div className="border-t border-slate-100 px-5 py-3 text-[11px] font-medium text-slate-500">Select a lesson to load it in the player.</div>
          </section>
        </aside>
      </div>
    </div>
  );
}
