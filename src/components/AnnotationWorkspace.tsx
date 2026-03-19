"use client";

import { useState } from "react";
import { Upload, Camera, Trash2 } from "lucide-react";
import { CanvasEditor } from "./CanvasEditor";
import { ImageCropper } from "./ImageCropper";

export function AnnotationWorkspace() {
  const [files, setFiles] = useState<File[]>([]);
  const [uncroppedFiles, setUncroppedFiles] = useState<File[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUncroppedFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
    // reset input
    e.target.value = '';
  };

  const handleNext = () => {
    if (currentIndex < files.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Finished queue
      setFiles([]);
      setCurrentIndex(0);
    }
  };

  const removeCurrent = () => {
    const newFiles = [...files];
    newFiles.splice(currentIndex, 1);
    setFiles(newFiles);
    if (currentIndex >= newFiles.length && newFiles.length > 0) {
      setCurrentIndex(newFiles.length - 1);
    } else if (newFiles.length === 0) {
      setCurrentIndex(0);
    }
  };

  const handleCropComplete = (croppedFile: File) => {
    setFiles((prev) => [...prev, croppedFile]);
    setUncroppedFiles((prev) => prev.slice(1));
  };

  const handleCropCancel = () => {
    // If they cancel cropping, we just skip this file
    setUncroppedFiles((prev) => prev.slice(1));
  };

  if (uncroppedFiles.length > 0) {
    return (
      <div className="flex-1 flex flex-col h-full bg-black overflow-hidden">
        <div className="flex items-center justify-between p-3 bg-secondary/50 border-b shrink-0">
          <div className="text-sm font-medium text-foreground">
            Crop Image <span className="text-primary">{currentIndex + 1}</span>
          </div>
          <div className="text-xs text-muted-foreground hidden sm:block">
            Adjust the square to fit your target area
          </div>
        </div>
        <div className="flex-1 relative min-h-0 w-full">
          <ImageCropper 
            file={uncroppedFiles[0]} 
            onCropComplete={handleCropComplete} 
            onCancel={handleCropCancel} 
          />
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 text-center bg-card">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Add Images to Annotate</h2>
            <p className="text-muted-foreground mt-2">
              Upload multiple images from your device or take a photo directly. You will be prompted to crop them to 1:1 ratio.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col items-center justify-center h-32 px-4 py-6 bg-secondary hover:bg-secondary/80 rounded-xl border border-dashed border-border cursor-pointer transition-colors group">
              <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors mb-2" />
              <span className="font-medium">Upload Images</span>
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
              />
            </label>

            <label className="flex flex-col items-center justify-center h-32 px-4 py-6 bg-secondary hover:bg-secondary/80 rounded-xl border border-dashed border-border cursor-pointer transition-colors group">
              <Camera className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors mb-2" />
              <span className="font-medium">Take Photo</span>
              <input 
                type="file" 
                accept="image/*" 
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>
      </div>
    );
  }

  const currentFile = files[currentIndex];

  return (
    <div className="flex-1 flex flex-col h-full bg-black overflow-hidden">
      <div className="flex items-center justify-between p-3 bg-secondary/50 border-b shrink-0">
        <div className="text-sm font-medium text-foreground">
          Image <span className="text-primary">{currentIndex + 1}</span> of {files.length}
        </div>
        <div className="flex gap-2">
          <button
            onClick={removeCurrent}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Skip Image</span>
          </button>
        </div>
      </div>
      
      <div className="flex-1 min-h-0 w-full relative flex flex-col">
         <CanvasEditor 
            file={currentFile} 
            onSaved={handleNext}
         />
      </div>
    </div>
  );
}