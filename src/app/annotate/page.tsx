import { AnnotationWorkspace } from "@/components/AnnotationWorkspace";

export default function AnnotatePage() {
  return (
    <div className="container mx-auto p-4 md:p-8 h-[calc(100vh-3.5rem)] flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Annotation Workspace</h1>
      <div className="flex-1 bg-card rounded-xl border shadow-sm overflow-hidden flex">
        <AnnotationWorkspace />
      </div>
    </div>
  );
}
