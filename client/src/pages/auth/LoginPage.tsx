import { LoginForm } from "@/components/auth/LoginForm";
import { BookOpen } from "lucide-react";

const RECENT_BOOKS = [
  { title: "The Great Library", author: "R. Caldwell", year: 2019 },
  { title: "Atlas of Stories", author: "M. Fontaine", year: 2021 },
  { title: "Cipher & Ink", author: "J. Voss", year: 2023 },
];

export function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-[#2b1608] via-[#1f0f05] to-[#160a03] p-12 text-white lg:flex">
        {/* subtle dot texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/20">
            <BookOpen className="h-5 w-5" />
          </div>
          <span className="text-sm font-semibold tracking-[0.2em] text-amber-100/90">
            BOOK MANAGEMENT
          </span>
        </div>

        <div className="relative z-10">
          <div className="mb-8 flex items-center gap-3">
            <span className="h-px flex-1 bg-white/15" />
            <span className="text-amber-400">✦</span>
            <span className="h-px flex-1 bg-white/15" />
          </div>

          <h1 className="mb-4 font-serif text-4xl font-bold leading-tight">
            Your library,
            <br />
            <span className="text-amber-400">perfectly ordered.</span>
          </h1>
          <p className="mb-10 max-w-sm text-white/60">
            Manage catalogues, track inventory, and discover your collection —
            all in one elegant workspace.
          </p>

          <div className="space-y-3">
            {RECENT_BOOKS.map((book) => (
              <div
                key={book.title}
                className="flex items-center justify-between rounded-lg border-l-2 border-amber-500 bg-white/5 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{book.title}</p>
                  <p className="text-xs text-white/40">
                    {book.author} · {book.year}
                  </p>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-white/30">
          © {new Date().getFullYear()} Book Management. All rights reserved.
        </p>
      </div>

      {/* Right panel */}
      <div className="flex w-full flex-col items-center justify-center bg-[#f5f1ea] px-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <h2 className="mb-2 font-serif text-3xl font-bold text-[#2b1608]">
            Welcome back
          </h2>
          <p className="mb-8 text-sm text-gray-500">
            Sign in to manage your book collection
          </p>

          <LoginForm />

          <p className="mt-8 text-center text-sm text-gray-500">
            Need access?{" "}
            <a href="#" className="font-medium text-amber-700 hover:underline">
              Contact your administrator
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
