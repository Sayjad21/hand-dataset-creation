import { AnnotationWorkspace } from "@/components/AnnotationWorkspace";

export default function AnnotatePage() {
  return (
    <div className="w-full flex flex-col overflow-hidden fixed inset-0 top-14 pb-4 bg-background">
      <div className="flex-1 w-full overflow-hidden flex flex-col">
        <AnnotationWorkspace />
      </div>
    </div>
  );
}