"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Check, X as CloseIcon, Crop } from "lucide-react";

interface ImageCropperProps {
  file: File;
  onCropComplete: (croppedFile: File) => void;
  onCancel: () => void;
}

export function ImageCropper({ file, onCropComplete, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [aspect, setAspect] = useState(1); // 1:1 by default
  const imageSrc = URL.createObjectURL(file);

  const onCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const onCropCompleteCallback = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = async () => {
    try {
      const image = new Image();
      image.src = imageSrc;
      await new Promise((resolve) => (image.onload = resolve));

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      canvas.toBlob((blob) => {
        if (!blob) return;
        const newFile = new File([blob], file.name, { type: "image/jpeg" });
        onCropComplete(newFile);
      }, "image/jpeg", 0.95);
    } catch (e) {
      console.error(e);
      alert("Failed to crop image.");
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-background text-foreground relative overflow-hidden">
      <div className="flex-1 relative min-h-0 bg-black/10">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={onCropChange}
          onCropComplete={onCropCompleteCallback}
          onZoomChange={onZoomChange}
          classes={{ containerClassName: "absolute inset-0" }}
        />
      </div>

      <div className="bg-secondary/95 backdrop-blur-sm border-t border-border p-4 flex flex-col gap-4 shrink-0 z-10">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Aspect Ratio</p>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setAspect(1)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                aspect === 1 ? "bg-primary text-primary-foreground shadow-sm" : "bg-background border border-border text-foreground hover:bg-accent"
              }`}
            >
              1:1 Square
            </button>
            <button
              onClick={() => setAspect(4 / 3)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                aspect === 4 / 3 ? "bg-primary text-primary-foreground shadow-sm" : "bg-background border border-border text-foreground hover:bg-accent"
              }`}
            >
              4:3
            </button>
            <button
              onClick={() => setAspect(16 / 9)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                aspect === 16 / 9 ? "bg-primary text-primary-foreground shadow-sm" : "bg-background border border-border text-foreground hover:bg-accent"
              }`}
            >
              16:9
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-destructive/10 text-destructive hover:bg-destructive/20 font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 border border-destructive/20"
          >
            <CloseIcon className="w-5 h-5" /> <span className="hidden xs:inline">Cancel</span>
          </button>
          <button
            onClick={createCroppedImage}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Crop className="w-5 h-5" /> Crop Image
          </button>
        </div>
      </div>
    </div>
  );
}