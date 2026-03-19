"use client";

import { createContext, useCallback, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

interface AppContextType {
  userId: string | null;
  setUserId: (id: string | null) => void;
  annotationCount: number;
  refreshCount: () => Promise<void>;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);
const USER_STORAGE_KEY = "dataset_annotator_user_id";
const THEME_STORAGE_KEY = "dataset_annotator_theme";

export function AppProvider({ children }: { children: ReactNode }) {
  const [userId, setUserIdState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(USER_STORAGE_KEY);
  });
  const [annotationCount, setAnnotationCount] = useState<number>(0);
  
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as 'light' | 'dark' | null;
    if (savedTheme === 'light') {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const newTheme = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return newTheme;
    });
  }, []);

  const refreshCountForUser = useCallback(async (id: string | null) => {
    if (!id) {
      setAnnotationCount(0);
      return;
    }
    
    // We only count if Supabase config is valid, otherwise swallow
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;

    try {
      const { count, error } = await supabase
        .from("annotations")
        .select("*", { count: "exact", head: true })
        .eq("user_id", id);

      if (!error && count !== null) {
        setAnnotationCount(count);
      }
    } catch (e) {
      console.error("Failed to fetch count", e);
    }
  }, []);

  const setUserId = useCallback((id: string | null) => {
    setUserIdState(id);
    if (typeof window === "undefined") return;

    if (id) {
      localStorage.setItem(USER_STORAGE_KEY, id);
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }

    void refreshCountForUser(id);
  }, [refreshCountForUser]);

  const refreshCount = useCallback(async () => {
    await refreshCountForUser(userId);
  }, [refreshCountForUser, userId]);

  return (
    <AppContext.Provider value={{ userId, setUserId, annotationCount, refreshCount, theme, toggleTheme }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
