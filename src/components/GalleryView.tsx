"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAppContext } from "./Providers";
import { Loader2, Image as ImageIcon } from "lucide-react";

interface SavedAnnotation {
  id: string;
  base_image_url: string;
  annotated_image_url: string;
  created_at: string;
}

export function GalleryView() {
  const { userId } = useAppContext();
  const [annotations, setAnnotations] = useState<SavedAnnotation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchGallery = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("annotations")
          .select("id, base_image_url, annotated_image_url, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setAnnotations(data || []);
      } catch (e) {
        console.error("Failed to fetch gallery:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGallery();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground font-medium">Loading your annotations...</p>
      </div>
    );
  }

  if (annotations.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-card mt-8 rounded-xl border border-dashed">
        <ImageIcon className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold tracking-tight">Gallery is Empty</h2>
        <p className="text-muted-foreground mt-2 max-w-sm">
          You have not saved any annotations yet for the current user ID ({userId}).
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-6">
      {annotations.map((ann) => (
        <div key={ann.id} className="group relative bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
          <div className="aspect-square relative overflow-hidden bg-black/5">
            {/* The final drawn visualization */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={ann.annotated_image_url} 
              alt="Annotated" 
              className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="p-3 bg-secondary/30">
            <p className="text-xs text-muted-foreground font-medium flex justify-between items-center">
              <span>{new Date(ann.created_at).toLocaleDateString()}</span>
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">{new Date(ann.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
