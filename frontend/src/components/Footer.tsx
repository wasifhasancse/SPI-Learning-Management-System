"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiAcademicCap, HiEnvelope, HiPhone, HiMapPin } from "react-icons/hi2";

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin") || pathname === "/dashboard") return null;

  return (
    <footer className="border-t border-[#A8DF8E]/40 bg-white pt-12 pb-8 mt-auto">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-gray-100">
          {/* Col 1: Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#A8DF8E] flex items-center justify-center text-gray-900 shadow-xs">
                <HiAcademicCap className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-gray-900">
                SPI <span className="text-emerald-700">LMS</span>
              </span>
            </Link>
            <p className="text-xs text-gray-600 leading-relaxed">
              A simplified, practical Learning Management System designed for modern web learners and course creators.
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
              Platform Navigation
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="text-gray-600 hover:text-emerald-700 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/courses" className="text-gray-600 hover:text-emerald-700 transition-colors">
                  All Courses
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-emerald-700 transition-colors">
                  About SPI LMS
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-emerald-700 transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-gray-600 hover:text-emerald-700 transition-colors">
                  Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Topics / Tech */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
              Curriculum Topics
            </h3>
            <ul className="space-y-2 text-xs text-gray-600">
              <li>Next.js & React 19</li>
              <li>Node.js & Express MVC</li>
              <li>PostgreSQL on Neon DB</li>
              <li>Better-Auth & JWT Security</li>
              <li>Tailwind CSS & Design Systems</li>
            </ul>
          </div>

          {/* Col 4: Contact & Office */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
              Contact & Inquiries
            </h3>
            <ul className="space-y-2.5 text-xs text-gray-600">
              <li className="flex items-center gap-2">
                <HiEnvelope className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>support@spilms.com</span>
              </li>
              <li className="flex items-center gap-2">
                <HiPhone className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>+880 123 456 789</span>
              </li>
              <li className="flex items-center gap-2">
                <HiMapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Uttara, Dhaka, Bangladesh</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-3">
          <div>
            Copyright (c) 2026 SPI Learning Management System. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-gray-500 text-xs">
            <span>Terms & Conditions</span>
            <span>|</span>
            <span>Privacy Policy</span>
            <span>|</span>
            <span>Cookie Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

