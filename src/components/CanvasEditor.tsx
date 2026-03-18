"use client";

import { useCallback, useEffect, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { supabase } from "@/lib/supabase";
import { useAppContext } from "./Providers";
import { Box, Fingertip, InteractionMode } from "@/types";
import { Loader2, PlusSquare, Crosshair, MousePointer2, Save, X, Hand } from "lucide-react";

interface CanvasEditorProps {
  file: File;
  onSaved: () => void;
}

const COLORS = {
  hand: "#10b981", // emerald
  target: "#f59e0b", // amber
  fingertip: "#ec4899", // pink
  drawing: "#3b82f6", // blue
};

type RawHandBox = [number, number, number, number];

interface RawObjectPrediction {
  bbox: [number, number, number, number];
  label?: string;
  conf?: number;
}

interface PredictionResponse {
  hands?: RawHandBox[];
  objects?: RawObjectPrediction[];
}

export function CanvasEditor({ file, onSaved }: CanvasEditorProps) {
  const { userId, refreshCount } = useAppContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const [mode, setMode] = useState<InteractionMode>("select");
  const [hands, setHands] = useState<Box[]>([]);
  const [targets, setTargets] = useState<Box[]>([]);
  const [fingertips, setFingertips] = useState<Fingertip[]>([]);
  
  const [selectedBox, setSelectedBox] = useState<string | null>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number, y: number } | null>(null);
  const [drawCurrent, setDrawCurrent] = useState<{ x: number, y: number } | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load image
  useEffect(() => {
    setIsLoading(true);
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setImage(img);
      runPrediction(file);
    };
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Run initial FastAPI predict
  const runPrediction = async (imageFile: File) => {
    const apiUrl = process.env.NEXT_PUBLIC_HF_API_URL || "http://localhost:7860";
    try {
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("conf_thresh", "0.20");

      const res = await fetch(`${apiUrl}/predict`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data: PredictionResponse = await res.json();
        
        const hBoxes: Box[] = (data.hands || []).map((h, i: number) => ({
          id: `h-${Date.now()}-${i}`,
          x: h[0], y: h[1], w: h[2], h: h[3],
          type: "hand"
        }));

        const tBoxes: Box[] = (data.objects || []).map((o, i: number) => ({
          id: `t-${Date.now()}-${i}`,
          x: o.bbox[0], y: o.bbox[1], w: o.bbox[2], h: o.bbox[3],
          type: "target",
          label: o.label,
          conf: o.conf
        }));

        setHands(hBoxes);
        setTargets(tBoxes);
      } else {
        console.warn("Prediction endpoint returned error or not found. Relying on manual annotation.");
      }
    } catch (e) {
      console.warn("FastAPI prediction failed (CORS or unavailable). Start manual annotation.", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Render Canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resize canvas to container
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate dynamic scale to fit image if offset and scale are default
    const fitScale = Math.min(canvas.width / image.width, canvas.height / image.height);
    // For simplicity, we center the image
    const drawW = image.width * fitScale;
    const drawH = image.height * fitScale;
    const offsetX = (canvas.width - drawW) / 2;
    const offsetY = (canvas.height - drawH) / 2;

    // We store these to globally map screen to image coordinates
    // Not using pan/zoom for simplicity, just fit to screen
    setScale((prev) => (Math.abs(prev - fitScale) < 0.0001 ? prev : fitScale));
    setOffset((prev) => (prev.x === offsetX && prev.y === offsetY ? prev : { x: offsetX, y: offsetY }));

    // Draw Image
    ctx.drawImage(image, offsetX, offsetY, drawW, drawH);

    // Helper to draw boxes
    const drawBoxes = (boxes: Box[], color: string) => {
      boxes.forEach(b => {
        const x = offsetX + b.x * fitScale;
        const y = offsetY + b.y * fitScale;
        const w = b.w * fitScale;
        const h = b.h * fitScale;

        ctx.strokeStyle = selectedBox === b.id ? "#ffffff" : color;
        ctx.lineWidth = selectedBox === b.id ? 3 : 2;
        ctx.strokeRect(x, y, w, h);

        // Label
        if (b.label) {
          ctx.fillStyle = color;
          ctx.font = "12px sans-serif";
          ctx.fillRect(x, y - 20, ctx.measureText(b.label).width + 8, 20);
          ctx.fillStyle = "#fff";
          ctx.fillText(b.label, x + 4, y - 5);
        }

        if (selectedBox === b.id) {
           ctx.fillStyle = "rgba(255,255,255,0.2)";
           ctx.fillRect(x,y,w,h);
        }
      });
    };

    drawBoxes(hands, COLORS.hand);
    drawBoxes(targets, COLORS.target);

    // Draw fingertips
    fingertips.forEach(ft => {
      const x = offsetX + ft.x * fitScale;
      const y = offsetY + ft.y * fitScale;
      ctx.fillStyle = COLORS.fingertip;
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw active rectangle
    if (isDrawing && drawStart && drawCurrent) {
      const x = offsetX + Math.min(drawStart.x, drawCurrent.x) * fitScale;
      const y = offsetY + Math.min(drawStart.y, drawCurrent.y) * fitScale;
      const w = Math.abs(drawCurrent.x - drawStart.x) * fitScale;
      const h = Math.abs(drawCurrent.y - drawStart.y) * fitScale;

      ctx.strokeStyle = COLORS.drawing;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(x, y, w, h);
      ctx.setLineDash([]);
    }
  }, [drawCurrent, drawStart, fingertips, hands, image, isDrawing, selectedBox, targets]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const getEventCoords = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = (clientX - rect.left - offset.x) / scale;
    const y = (clientY - rect.top - offset.y) / scale;
    return { x, y };
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (mode === 'place_fingertip') {
      const coords = getEventCoords(e);
      setFingertips([...fingertips, { id: `ft-${Date.now()}`, x: coords.x, y: coords.y }]);
      setMode("select");
      return;
    }

    if (mode === 'draw_hand' || mode === 'draw_target') {
      setIsDrawing(true);
      setDrawStart(getEventCoords(e));
      setDrawCurrent(getEventCoords(e));
      return;
    }

    if (mode === "select") {
      const coords = getEventCoords(e);
      // Determine if a box is clicked
      const clickedBox = [...hands, ...targets].slice().reverse().find(b => 
        coords.x >= b.x && coords.x <= b.x + b.w &&
        coords.y >= b.y && coords.y <= b.y + b.h
      );

      if (clickedBox) {
        setSelectedBox(clickedBox.id);
        setIsDragging(true);
        setDragOffset({ x: coords.x - clickedBox.x, y: coords.y - clickedBox.y });
      } else {
        setSelectedBox(null);
      }
    }
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    const coords = getEventCoords(e);

    if (isDrawing) {
      setDrawCurrent(coords);
    } else if (isDragging && selectedBox) {
      const updateBox = (boxes: Box[], setBoxes: Dispatch<SetStateAction<Box[]>>) => {
        const idx = boxes.findIndex(b => b.id === selectedBox);
        if (idx !== -1) {
          const newBoxes = [...boxes];
          newBoxes[idx] = { ...newBoxes[idx], x: coords.x - dragOffset.x, y: coords.y - dragOffset.y };
          setBoxes(newBoxes);
          return true;
        }
        return false;
      };
      if (!updateBox(hands, setHands)) {
        updateBox(targets, setTargets);
      }
    }
  };

  const handlePointerUp = () => {
    if (isDrawing && drawStart && drawCurrent) {
      const x = Math.min(drawStart.x, drawCurrent.x);
      const y = Math.min(drawStart.y, drawCurrent.y);
      const w = Math.abs(drawCurrent.x - drawStart.x);
      const h = Math.abs(drawCurrent.y - drawStart.y);

      if (w > 10 && h > 10) {
        const newBox: Box = { id: `b-${Date.now()}`, x, y, w, h, type: mode === 'draw_hand' ? 'hand' : 'target' };
        if (mode === 'draw_hand') setHands([...hands, newBox]);
        else setTargets([...targets, newBox]);
      }
      setIsDrawing(false);
      setDrawStart(null);
      setDrawCurrent(null);
      setMode("select");
    }
    setIsDragging(false);
  };

  const deleteSelected = () => {
    if (selectedBox) {
      setHands(hands.filter(h => h.id !== selectedBox));
      setTargets(targets.filter(t => t.id !== selectedBox));
      setSelectedBox(null);
    }
  };

  const saveToSupabase = async () => {
    if (!userId || !image) return;
    setIsSaving(true);
    try {
      // 1. Get raw base image
      const rawExt = file.name.split('.').pop() || 'jpg';
      const baseName = `${userId}_${Date.now()}`;
      
      const rawPath = `raw/${baseName}.${rawExt}`;
      const { error: rawError } = await supabase.storage
        .from('dataset_images')
        .upload(rawPath, file);

      if (rawError) throw rawError;
      
      const { data: { publicUrl: rawUrl } } = supabase.storage.from('dataset_images').getPublicUrl(rawPath);

      // 2. Export annotated canvas (visual confirmation)
      const canvas = canvasRef.current;
      if (!canvas) throw new Error("Canvas not accessible");
      
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.8));
      if (!blob) throw new Error("Failed to export canvas blob");
      
      const annPath = `annotated/${baseName}.jpg`;
      const { error: annError } = await supabase.storage
        .from('dataset_images')
        .upload(annPath, blob);
        
      if (annError) throw annError;
      const { data: { publicUrl: annUrl } } = supabase.storage.from('dataset_images').getPublicUrl(annPath);

      // 3. Save coordinates to DB
      const { error: dbError } = await supabase.from('annotations').insert({
        user_id: userId,
        base_image_url: rawUrl,
        annotated_image_url: annUrl,
        hand_boxes: hands,
        target_boxes: targets,
        fingertips: fingertips
      });

      if (dbError) throw dbError;

      // Update global context
      refreshCount();
      onSaved();
      
    } catch (e) {
      console.error(e);
      alert("Failed to save annotation to Supabase.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex w-full h-full">
      {/* Left Sidebar Toolbox */}
      <div className="w-56 bg-secondary/30 border-r flex flex-col p-4 gap-4 overflow-y-auto">
        <h3 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider">Tools</h3>
        
        <div className="flex flex-col gap-2">
          <ToolButton 
            active={mode === 'select'} 
            onClick={() => setMode('select')}
            icon={<MousePointer2 className="w-4 h-4" />}
            label="Select / Move"
          />
          <ToolButton 
            active={mode === 'draw_hand'} 
            onClick={() => setMode('draw_hand')}
            icon={<Hand className="w-4 h-4" />}
            label="Hand Box"
            color={COLORS.hand}
          />
          <ToolButton 
            active={mode === 'draw_target'} 
            onClick={() => setMode('draw_target')}
            icon={<PlusSquare className="w-4 h-4" />}
            label="Target Box"
            color={COLORS.target}
          />
          <ToolButton 
            active={mode === 'place_fingertip'} 
            onClick={() => setMode('place_fingertip')}
            icon={<Crosshair className="w-4 h-4" />}
            label="Fingertip"
            color={COLORS.fingertip}
          />
        </div>

        <div className="h-px bg-border my-2" />
        
        {selectedBox && (
          <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/20 text-center">
             <p className="text-xs text-destructive font-medium mb-3">1 Box Selected</p>
             <button 
                onClick={deleteSelected}
                className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 text-sm py-1.5 rounded transition-colors font-medium flex items-center justify-center gap-2"
              >
               <X className="w-4 h-4" /> Delete Box
             </button>
          </div>
        )}

        {fingertips.length > 0 && (
          <button 
            onClick={() => setFingertips([])}
            className="text-xs text-muted-foreground hover:text-foreground text-left px-2"
          >
            Clear Fingertips
          </button>
        )}

        <div className="flex-1" />

        <button 
          onClick={saveToSupabase}
          disabled={isSaving || isLoading}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin"/> : <Save className="w-5 h-5" />}
          {isSaving ? "Saving..." : "Save & Next"}
        </button>
      </div>

      {/* Main Canvas Area */}
      <div 
        ref={containerRef} 
        className="flex-1 relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-black cursor-crosshair"
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      >
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10 backdrop-blur-sm">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="text-primary font-medium">Running YOLO & MediaPipe Predictions...</p>
          </div>
        )}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ touchAction: 'none' }} />
      </div>
    </div>
  );
}

interface ToolButtonProps {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
  color?: string;
}

function ToolButton({ active, onClick, icon, label, color }: ToolButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full text-left
        ${active 
          ? 'bg-primary/20 text-primary border border-primary/50 shadow-inner' 
          : 'bg-background border border-border text-foreground hover:bg-accent hover:text-accent-foreground'
        }`}
    >
      <div style={{ color: active && color ? color : 'inherit' }}>
        {icon}
      </div>
      <span>{label}</span>
    </button>
  );
}
