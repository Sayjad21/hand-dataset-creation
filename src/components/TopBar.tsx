"use client";

import Link from "next/link";
import { LogOut, Image as ImageIcon } from "lucide-react";
import { useAppContext } from "./Providers";

export function TopBar() {
  const { userId, setUserId, annotationCount } = useAppContext();

  if (!userId) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-4">
          <Link href="/annotate" className="flex items-center space-x-2">
            <span className="font-bold text-lg hidden sm:inline-block">Dataset Annotator</span>
            <span className="font-bold text-lg sm:hidden">Annotator</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link href="/annotate" className="transition-colors hover:text-foreground/80 text-foreground">
              Annotate
            </Link>
            <Link href="/gallery" className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center gap-1">
              <ImageIcon className="w-4 h-4" /> Gallery
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center text-sm text-muted-foreground mr-4">
            <span className="font-medium">User ID:</span> <span className="ml-1 text-foreground">{userId}</span>
          </div>
          <div className="flex items-center bg-secondary px-3 py-1 rounded-full text-sm font-medium">
            Total Annotated: <span className="ml-2 font-bold text-primary">{annotationCount}</span>
          </div>
          <button
            onClick={() => setUserId(null)}
            className="flex items-center gap-2 text-sm font-medium text-destructive hover:bg-destructive/10 px-3 py-1.5 rounded-md transition-colors"
            title="Switch User"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
