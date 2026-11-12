import Link from "next/link";
import {
  HiAcademicCap,
  HiAdjustmentsHorizontal,
  HiArrowRight,
  HiBookOpen,
  HiCheckCircle,
  HiCircleStack,
  HiCodeBracket,
  HiPlayCircle,
  HiRectangleStack,
  HiShieldCheck,
  HiVideoCamera
} from "react-icons/hi2";

const learningFeatures = [
  {
    icon: HiAdjustmentsHorizontal,
    title: "Find a course",
    description: "Search the catalog by topic, filter by price, and sort the available courses."
  },
  {
    icon: HiBookOpen,
    title: "Explore the curriculum",
    description: "Read a course overview and browse its organized list of video lessons."
  },
  {
    icon: HiPlayCircle,
    title: "Learn at your pace",
    description: "Choose a lesson and press play when you are ready. Return to lessons whenever you like."
  }
];

const technology = [
  {
    icon: HiCodeBracket,
    title: "Next.js & Tailwind CSS",
    description: "A responsive frontend brings the course catalog, lesson player, and dashboard together."
  },
  {
    icon: HiRectangleStack,
    title: "Express & TypeScript",
    description: "A structured API handles course and lecture operations using an MVC-style backend."
  },
  {
    icon: HiCircleStack,
    title: "PostgreSQL",
    description: "Course and lesson information is stored in PostgreSQL, hosted on Neon."
  },
  {
    icon: HiShieldCheck,
    title: "Better Auth & JWT",
    description: "Sessions and token verification support authenticated content management."
  }
];

export default function AboutPage() {
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-[#F0FFDF]">
        <div className="container-custom relative grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#A8DF8E] bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-900"><HiAcademicCap aria-hidden="true" className="h-4 w-4" /> About SPI LMS</span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">A simpler way to share knowledge and <span className="text-emerald-800">keep learning.</span></h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">SPI LMS brings courses, video lessons, and content management into one focused learning space.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/courses" className="btn-primary">Explore courses <HiArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
              <Link href="/admin" className="btn-secondary">Admin dashboard</Link>
            </div>
          </div>
          <div className="relative rounded-[2rem] border border-white bg-white p-6 shadow-[0_24px_70px_rgba(31,41,55,0.1)] sm:p-8">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#F0FFDF] text-emerald-800"><HiAcademicCap aria-hidden="true" className="h-7 w-7" /></span>
              <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">One learning space</p><h2 className="mt-1 text-xl font-extrabold text-slate-900">Built for learning and managing</h2></div>
            </div>
            <div className="mt-5 space-y-3">
              <div className="flex items-start gap-4 rounded-2xl bg-[#F0FFDF]/70 p-4"><HiBookOpen aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-800" /><div><h3 className="text-sm font-extrabold text-slate-900">For learners</h3><p className="mt-1 text-sm leading-6 text-slate-600">Discover courses and follow lessons in one place.</p></div></div>
              <div className="flex items-start gap-4 rounded-2xl bg-[#FFD8DF]/45 p-4"><HiVideoCamera aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-rose-800" /><div><h3 className="text-sm font-extrabold text-slate-900">For administrators</h3><p className="mt-1 text-sm leading-6 text-slate-600">Keep courses and their lessons organized from the dashboard.</p></div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-custom grid gap-8 py-16 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-800">Our purpose</span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Learning content, without the clutter.</h2>
        </div>
        <div className="space-y-4 text-sm leading-7 text-slate-600 sm:text-base">
          <p>SPI Learning Management System is a full-stack project designed to make course content easy to find, follow, and manage. Learners can browse the public catalog, while administrators have a dedicated workspace for maintaining it.</p>
          <p>Each course brings its description, price, and lesson list together. Video lessons can be selected individually and played when the learner is ready.</p>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-slate-50 py-16 sm:py-20">
        <div className="container-custom">
          <div className="max-w-2xl">
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-800">For learners</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">From curiosity to your next lesson.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">The course library is open to browse, with a straightforward path from discovery to watching.</p>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {learningFeatures.map(({ icon: Icon, title, description }, index) => (
              <article key={title} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F0FFDF] text-emerald-800"><Icon aria-hidden="true" className="h-6 w-6" /></span><span className="text-xs font-extrabold tracking-widest text-slate-300">0{index + 1}</span></div>
                <h3 className="mt-5 text-lg font-extrabold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
              </article>
            ))}
          </div>
          <p className="mt-6 text-sm leading-6 text-slate-600">Lessons support YouTube, Vimeo, and direct video files, depending on the video provided for each lesson.</p>
        </div>
      </section>

      <section className="container-custom grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:gap-16">
        <div className="rounded-[2rem] bg-slate-900 p-6 text-white sm:p-9">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#A8DF8E] text-slate-900"><HiRectangleStack aria-hidden="true" className="h-6 w-6" /></span>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[#A8DF8E]">One admin dashboard</p>
          <h2 className="mt-3 text-2xl font-extrabold sm:text-3xl">A workspace for the whole catalog.</h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">The dashboard brings course and lecture management together, helping administrators maintain content in one place.</p>
        </div>
        <div>
          <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-800">For administrators</span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Keep learning content organized.</h2>
          <ul className="mt-6 space-y-4">
            {[
              "Create, update, and remove courses with descriptions, prices, and thumbnails.",
              "Add and manage video lessons, including their order within a course.",
              "View catalog information and navigate management tools from one dashboard."
            ].map((item) => <li key={item} className="flex gap-3 text-sm leading-6 text-slate-600"><HiCheckCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" /><span>{item}</span></li>)}
          </ul>
          <Link href="/admin" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-emerald-800 hover:text-emerald-950">Visit the admin dashboard <HiArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
        </div>
      </section>

      <section className="bg-[#F0FFDF]/50 py-16 sm:py-20">
        <div className="container-custom">
          <div className="max-w-2xl">
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-800">Behind the platform</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Built with a modern stack.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">SPI LMS separates the learning interface, API, data storage, and authentication into focused parts.</p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {technology.map(({ icon: Icon, title, description }) => (
              <article key={title} className="rounded-2xl border border-white bg-white p-5 shadow-sm">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0FFDF] text-emerald-800"><Icon aria-hidden="true" className="h-5 w-5" /></span>
                <h3 className="mt-4 text-sm font-extrabold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container-custom py-16">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-slate-900 px-7 py-9 text-white sm:flex-row sm:items-center sm:px-10">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#A8DF8E]">Start exploring</p><h2 className="mt-2 text-2xl font-extrabold">Find something new to learn.</h2><p className="mt-2 text-sm leading-6 text-slate-300">Browse the catalog and see the lessons available on SPI LMS.</p></div>
          <Link href="/courses" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#A8DF8E] px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-[#b9e8a4]">Browse courses <HiArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
        </div>
      </section>
    </div>
  );
}
