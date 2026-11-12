"use client";

import Link from "next/link";
import { useState } from "react";
import { Course } from "@/lib/api";
import { HiAcademicCap, HiArrowRight, HiPlayCircle, HiVideoCamera } from "react-icons/hi2";

export default function CourseCard({ course }: { course: Course }) {
  const [imgError, setImgError] = useState(false);
  const formattedPrice = Number(course.price) === 0 ? "Free" : `$${Number(course.price).toFixed(2)}`;

  return (
    <article className="card-surface group flex h-full flex-col gap-0 overflow-hidden border-slate-100 p-0 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#F0FFDF]">
        {course.thumbnail_url && !imgError ? (
          <img src={course.thumbnail_url} alt="" onError={() => setImgError(true)} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#F0FFDF] to-[#FFD8DF] text-emerald-800"><HiAcademicCap className="h-16 w-16" /></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-slate-950/10" />
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-900 shadow-sm">
          <HiVideoCamera className="mr-1 inline h-3.5 w-3.5" />{course.lecture_count ?? 0} {course.lecture_count === 1 ? "lesson" : "lessons"}
        </span>
        <span className="absolute bottom-4 right-4 rounded-full bg-[#FFD8DF] px-3.5 py-1.5 text-xs font-extrabold text-rose-950 shadow-sm">{formattedPrice}</span>
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex-1">
          <h3 className="line-clamp-2 text-lg font-extrabold leading-snug text-slate-900 transition-colors group-hover:text-emerald-800">{course.title}</h3>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{course.description || "Explore the lessons and build practical skills with this course."}</p>
        </div>
        <div className="mt-5 border-t border-slate-100 pt-4">
          <Link href={`/courses/${course.id}`} className="flex w-full items-center justify-between rounded-xl bg-[#F0FFDF] px-4 py-3 text-sm font-bold text-emerald-950 transition hover:bg-[#A8DF8E]">
            <span className="inline-flex items-center gap-2"><HiPlayCircle className="h-5 w-5" />View course</span>
            <HiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </article>
  );
}
