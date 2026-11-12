import { HiArrowPath } from "react-icons/hi2";

export default function LoadingSpinner({ label = "Loading...", inline = false }: { label?: string; inline?: boolean }) {
  if (inline) {
    return (
      <span role="status" aria-label={label} className="inline-flex items-center text-emerald-700">
        <HiArrowPath aria-hidden="true" className="h-5 w-5 animate-spin motion-reduce:animate-none" />
        <span className="sr-only">{label}</span>
      </span>
    );
  }
  return (
    <div role="status" aria-live="polite" className="flex min-h-[50vh] w-full items-center justify-center gap-3 bg-white text-sm font-semibold text-slate-600">
      <HiArrowPath aria-hidden="true" className="h-5 w-5 animate-spin text-emerald-700 motion-reduce:animate-none" />
      <span>{label}</span>
    </div>
  );
}
