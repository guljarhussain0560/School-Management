'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-md bg-gradient-to-br from-indigo-600 to-blue-500" />
        <span className="text-lg font-semibold">Tayog School Suite</span>
      </div>
      <div className="hidden items-center gap-4 sm:flex">
        <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground">Features</Link>
        <Link href="#screens" className="text-sm text-muted-foreground hover:text-foreground">Screens</Link>
        <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground">Pricing</Link>
        <Link href="/login" className="rounded-md bg-white px-3 py-1.5 text-sm shadow-sm ring-1 ring-gray-200 hover:bg-gray-50">Log in</Link>
        <Link href="/signup" className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow hover:bg-indigo-700">Get Started</Link>
      </div>
    </nav>
  );
}


