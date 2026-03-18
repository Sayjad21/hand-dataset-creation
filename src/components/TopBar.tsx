"use client";

import Link from "next/link";
import { LogOut, Image as ImageIcon, PenTool } from "lucide-react";
import { useAppContext } from "./Providers";

export function TopBar() {
  const { userId, setUserId, annotationCount } = useAppContext();

  if (!userId) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-2 md:px-8">
        
        {/* Left Side: Navigation */}
        <div className="flex items-center gap-2 md:gap-6">
          <Link href="/annotate" className="flex items-center space-x-2 mr-2">
            <span className="font-bold text-lg hidden md:inline-block">Dataset Annotator</span>
            <span className="font-bold text-base md:hidden tracking-tighter">Annotator</span>
          </Link>
          
          <nav className="flex items-center gap-1 md:gap-4 text-sm font-medium">
            <Link href="/annotate" className="flex items-center gap-1.5 px-2 py-1 transition-colors hover:text-foreground/80 text-foreground">
              <PenTool className="w-4 h-4 md:hidden" />
              <span className="hidden md:inline">Annotate</span>
            </Link>
            <Link href="/gallery" className="flex items-center gap-1.5 px-2 py-1 transition-colors hover:text-foreground/80 text-foreground/60">
              <ImageIcon className="w-4 h-4" /> 
              <span className="hidden md:inline">Gallery</span>
            </Link>
          </nav>
        </div>

        {/* Right Side: User Info & Actions */}
        <div className="flex items-center gap-1 md:gap-4">
          <div className="hidden lg:flex items-center text-sm text-muted-foreground mr-2">
            <span className="font-medium">User ID:</span> <span className="ml-1 text-foreground">{userId}</span>
          </div>
          
          <div className="flex items-center bg-secondary px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium whitespace-nowrap">
            <span className="hidden md:inline">Total:</span>
            <span className="md:hidden text-[10px] uppercase mr-1">Tot:</span>
            <span className="font-bold text-primary">{annotationCount}</span>
          </div>
          
          <button
            onClick={() => setUserId(null)}
            className="flex items-center gap-2 text-sm font-medium text-destructive hover:bg-destructive/10 px-2 md:px-3 py-1.5 rounded-md transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4 md:w-4 md:h-4" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>

      </div>
    </header>
  );
}
