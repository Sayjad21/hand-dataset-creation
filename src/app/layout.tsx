import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/components/Providers";
import { TopBar } from "@/components/TopBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dataset Annotator",
  description: "Web application for annotating hands and objects for toy dataset.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-background font-sans antialiased text-foreground selection:bg-primary/30`}>
        <AppProvider>
          <TopBar />
          <main className="flex-1">{children}</main>
        </AppProvider>
      </body>
    </html>
  );
}
