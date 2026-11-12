import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToastNotifications from "@/components/ToastNotifications";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap"
});

export const metadata: Metadata = {
  title: "SPI Learning Management System (LMS)",
  description: "A modern Learning Management System featuring Admin Course and Lecture Management and Student Video Player panel.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${montserrat.variable} h-full antialiased`}>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-white text-gray-800">
        <ToastNotifications>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </ToastNotifications>
      </body>
    </html>
  );
}
