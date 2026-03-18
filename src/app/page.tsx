"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/components/Providers";
import { Fingerprint } from "lucide-react";

export default function Home() {
  const [inputObj, setInputObj] = useState("");
  const { userId, setUserId } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (userId) {
      router.push("/annotate");
    }
  }, [userId, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputObj.trim()) {
      setUserId(inputObj.trim());
      router.push("/annotate");
    }
  };

  if (userId) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] opacity-50 pointer-events-none" />
      
      <div className="z-10 w-full max-w-sm px-4">
        <div className="bg-card border shadow-xl rounded-2xl overflow-hidden backdrop-blur-sm">
          <div className="p-8 text-center space-y-2">
            <div className="w-16 h-16 bg-primary/10 text-primary mx-auto rounded-full flex items-center justify-center mb-6">
              <Fingerprint className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome to Annotator</h1>
            <p className="text-sm text-muted-foreground pb-4">
              Enter your User ID to begin bounding box annotations.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div>
                <input
                  type="text"
                  placeholder="e.g. user1"
                  value={inputObj}
                  onChange={(e) => setInputObj(e.target.value)}
                  className="flex h-12 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-center"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={!inputObj.trim()}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 w-full"
              >
                Start Annotating
              </button>
            </form>
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-8">
          No password required. All annotations will be linked to this ID.
        </p>
      </div>
    </div>
  );
}
