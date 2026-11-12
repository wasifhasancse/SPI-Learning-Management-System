"use client";

import Link from "next/link";
import {
  HiArrowRight,
  HiChatBubbleBottomCenterText,
  HiClock,
  HiEnvelope,
  HiInformationCircle,
  HiMapPin,
  HiPaperAirplane,
  HiPhone
} from "react-icons/hi2";

const contactDetails = [
  { icon: HiEnvelope, label: "Email", value: "support@spilms.com" },
  { icon: HiPhone, label: "Phone", value: "+1 (800) 555-0199" },
  { icon: HiMapPin, label: "Location", value: "San Francisco, CA, USA" },
  { icon: HiClock, label: "Hours", value: "Mon - Fri, 9:00 AM - 6:00 PM PST" }
];

const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#A8DF8E] focus:bg-white focus:ring-4 focus:ring-[#A8DF8E]/20";

export default function ContactPage() {
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-[#F0FFDF]">
        <div className="container-custom relative py-14 sm:py-20">
          <div className="absolute -right-10 top-0 h-48 w-48 rounded-full bg-[#FFD8DF]/70 blur-3xl" />
          <div className="relative max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#A8DF8E] bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-900"><HiChatBubbleBottomCenterText aria-hidden="true" className="h-4 w-4" /> Get in touch</span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">Let&apos;s talk about <span className="text-emerald-800">learning.</span></h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">Have a question about courses or the SPI LMS project? Find contact information and the inquiry form below.</p>
          </div>
        </div>
      </section>

      <section className="container-custom grid items-start gap-6 py-12 sm:py-16 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-8">
        <div className="space-y-5">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0FFDF] text-emerald-800"><HiEnvelope aria-hidden="true" className="h-6 w-6" /></span>
            <h2 className="mt-5 text-xl font-extrabold text-slate-900">Contact details</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">These existing project contact details have not been verified.</p>
            <div className="mt-6 space-y-5 border-t border-slate-100 pt-6">
              {contactDetails.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-emerald-800"><Icon aria-hidden="true" className="h-5 w-5" /></span>
                  <div className="min-w-0"><h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</h3><p className="mt-1 break-words text-sm font-semibold text-slate-800">{value}</p></div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl bg-slate-900 p-6 text-white sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#A8DF8E]">Looking for a course?</p>
            <h2 className="mt-3 text-xl font-extrabold">Start with the course library.</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">Explore available courses and their lessons at your own pace.</p>
            <Link href="/courses" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#A8DF8E] hover:text-white">Browse courses <HiArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_12px_40px_rgba(31,41,55,0.06)] sm:p-8">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFD8DF]/70 text-rose-900"><HiChatBubbleBottomCenterText aria-hidden="true" className="h-6 w-6" /></span>
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">Your inquiry</p><h2 className="mt-1 text-2xl font-extrabold text-slate-900">Send us a message</h2><p className="mt-2 text-sm leading-6 text-slate-600">Share the details of your question using the form below.</p></div>
          </div>
          <div role="status" className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            <HiInformationCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
            <p>The contact form is not connected yet. Messages entered here cannot be sent or saved.</p>
          </div>
          <form onSubmit={(event) => event.preventDefault()} className="mt-7 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="contact-name" className="mb-2 block text-sm font-bold text-slate-700">Your name</label>
                <input id="contact-name" name="name" type="text" autoComplete="name" required placeholder="Your full name" className={inputClass} />
              </div>
              <div>
                <label htmlFor="contact-email" className="mb-2 block text-sm font-bold text-slate-700">Email address</label>
                <input id="contact-email" name="email" type="email" autoComplete="email" required placeholder="name@example.com" className={inputClass} />
              </div>
            </div>
            <div>
              <label htmlFor="contact-subject" className="mb-2 block text-sm font-bold text-slate-700">Subject</label>
              <input id="contact-subject" name="subject" type="text" required placeholder="What is your question about?" className={inputClass} />
            </div>
            <div>
              <label htmlFor="contact-message" className="mb-2 block text-sm font-bold text-slate-700">Message</label>
              <textarea id="contact-message" name="message" rows={6} required placeholder="Tell us a little more about your inquiry..." className={`${inputClass} min-h-36 resize-y`} />
            </div>
            <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-slate-500">All fields are required.</p>
              <button type="submit" disabled className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-200 px-5 py-3 text-sm font-bold text-slate-500"><HiPaperAirplane aria-hidden="true" className="h-4 w-4" /> Sending unavailable</button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
