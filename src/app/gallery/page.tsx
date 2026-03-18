import { GalleryView } from "@/components/GalleryView";

export default function GalleryPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-3xl font-bold">Your Gallery</h1>
        <p className="text-muted-foreground text-lg">Browse all images you have successfully annotated and saved.</p>
      </div>
      <GalleryView />
    </div>
  );
}
