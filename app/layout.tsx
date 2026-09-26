import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { BookA } from "lucide-react";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
});


export const metadata: Metadata = {
  title: "Tango",
  description: "Learn Japanese Vocabulary",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className={`${inter.className} min-h-full flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50`}>
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur dark:bg-slate-950/80">
          <div className="container mx-auto flex h-16 items-center px-4">
            <Link href="/" className="flex items-center gap-2 font-black text-2xl uppercase tracking-widest text-slate-900 dark:text-white hover:opacity-80 transition-opacity cursor-pointer">
              <span>TANGO</span>
            </Link>
          </div>
        </header>
        <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
