import { HiArrowPath } from "react-icons/hi2";

export default function AdminListSkeleton({ label, cards = false }: { label: string; cards?: boolean }) {
  return (
    <div role="status" aria-label={label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-600">
        <HiArrowPath aria-hidden="true" className="h-4 w-4 animate-spin text-emerald-700 motion-reduce:animate-none" />
        <span>{label}</span>
      </div>
      <div aria-hidden="true" className={cards ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "space-y-3"}>
        {[0, 1, 2].map((item) => (
          <div key={item} className={`animate-pulse rounded-xl border border-slate-100 p-4 motion-reduce:animate-none ${cards ? "space-y-4" : "flex items-center gap-4"}`}>
            <div className={`shrink-0 rounded-lg bg-[#F0FFDF] ${cards ? "h-28 w-full" : "h-12 w-12"}`} />
            <div className="min-w-0 flex-1 space-y-3"><div className="h-3 w-2/3 rounded bg-slate-200" /><div className="h-3 w-4/5 rounded bg-slate-100" /></div>
            {!cards && <div className="hidden h-8 w-20 rounded-lg bg-slate-100 sm:block" />}
          </div>
        ))}
      </div>
    </div>
  );
}
