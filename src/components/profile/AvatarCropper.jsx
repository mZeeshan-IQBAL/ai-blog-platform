// components/profile/AvatarCropper.jsx
"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * Simple square avatar cropper with zoom and drag.
 * Props:
 * - file: File (original image)
 * - initialUrl: optional string (preview)
 * - onCancel: () => void
 * - onCropped: (file: File, dataUrl: string) => void
 */
export default function AvatarCropper({ file, initialUrl = "", onCancel, onCropped }) {
  const [error, setError] = useState("");
  const [imgUrl, setImgUrl] = useState(initialUrl);
  const [imageEl, setImageEl] = useState(null);
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const lastPos = useRef({ x: 0, y: 0 });

  // Validate type/size
  useEffect(() => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowed.includes(file.type)) {
      setError("Unsupported format. Use JPG, PNG, or WEBP.");
      return;
    }
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError("File too large. Max 5MB.");
      return;
    }
    const url = URL.createObjectURL(file);
    setImgUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Load image metadata to center
  useEffect(() => {
    if (!imgUrl) return;
    const img = new Image();
    img.onload = () => {
      setImageEl(img);
      // Reset state
      setScale(1);
      setPos({ x: 0, y: 0 });
      lastPos.current = { x: 0, y: 0 };
    };
    img.src = imgUrl;
  }, [imgUrl]);

  const onMouseDown = (e) => {
    dragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  };
  const onMouseMove = (e) => {
    if (!dragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPos({ x: lastPos.current.x + dx, y: lastPos.current.y + dy });
  };
  const onMouseUp = () => {
    dragging.current = false;
    lastPos.current = { ...pos };
  };

  const onTouchStart = (e) => {
    if (!e.touches?.[0]) return;
    dragging.current = true;
    dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchMove = (e) => {
    if (!dragging.current || !e.touches?.[0]) return;
    const dx = e.touches[0].clientX - dragStart.current.x;
    const dy = e.touches[0].clientY - dragStart.current.y;
    setPos({ x: lastPos.current.x + dx, y: lastPos.current.y + dy });
  };
  const onTouchEnd = () => {
    dragging.current = false;
    lastPos.current = { ...pos };
  };

  async function cropAndCompress() {
    if (!imageEl || !containerRef.current) return;
    // Output size
    const OUT = 512;
    const canvas = document.createElement("canvas");
    canvas.width = OUT;
    canvas.height = OUT;
    const ctx = canvas.getContext("2d");

    // Compute draw params
    const cont = containerRef.current.getBoundingClientRect();
    // Image natural size
    const iw = imageEl.naturalWidth;
    const ih = imageEl.naturalHeight;

    // Scale image to fit container shortest side
    const baseScale = Math.max(cont.width / iw, cont.height / ih);
    const drawScale = baseScale * scale;

    // Compute top-left drawing position in container coords
    const drawW = iw * drawScale;
    const drawH = ih * drawScale;
    const cx = cont.width / 2 + pos.x - drawW / 2;
    const cy = cont.height / 2 + pos.y - drawH / 2;

    // Draw onto canvas
    // We assume container is square and represents our crop area
    // Map container coords to canvas coords
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, OUT, OUT);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(imageEl, cx * (OUT / cont.width), cy * (OUT / cont.height), drawW * (OUT / cont.width), drawH * (OUT / cont.height));

    // Compress to <= 500KB by lowering quality if needed
    let quality = 0.9;
    let blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", quality));
    for (let i = 0; i < 3 && blob && blob.size > 500 * 1024; i++) {
      quality -= 0.2;
      blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", Math.max(0.4, quality)));
    }
    if (!blob) {
      setError("Failed to create image");
      return;
    }
    const croppedFile = new File([blob], `avatar_${Date.now()}.jpg`, { type: "image/jpeg" });
    const dataUrl = await blobToDataURL(blob);
    onCropped(croppedFile, dataUrl);
  }

  function blobToDataURL(blob) {
    return new Promise((resolve) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.readAsDataURL(blob);
    });
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onMouseUp={onMouseUp} onTouchEnd={onTouchEnd}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl p-6 w-full max-w-lg">
        <h3 className="text-lg font-semibold mb-2">Crop your avatar</h3>
        <p className="text-sm text-gray-600 mb-4">Position your face in the center circle. Drag to move, use the slider to zoom.</p>

        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}

        <div
          ref={containerRef}
          className="relative w-full aspect-square bg-gray-100 overflow-hidden rounded-lg touch-none select-none cursor-move"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
        >
          {imgUrl && (
            // Using img tag with CSS transform for smoother drag/zoom preview
            <img
              ref={imgRef}
              src={imgUrl}
              alt="to-crop"
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
                transformOrigin: "center center",
                userSelect: "none",
                pointerEvents: "none",
              }}
            />
          )}
          
          {/* Face positioning guides */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Center crosshair */}
            <div className="absolute left-1/2 top-1/2 w-8 h-8 -ml-4 -mt-4">
              <div className="w-full h-0.5 bg-white/80 absolute top-1/2 -mt-px"></div>
              <div className="h-full w-0.5 bg-white/80 absolute left-1/2 -ml-px"></div>
            </div>
            
            {/* Face guide circle */}
            <div className="absolute left-1/2 top-1/2 w-32 h-40 -ml-16 -mt-20 border-2 border-white/60 rounded-full">
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-white bg-black/50 px-2 py-1 rounded">
                Center face here
              </div>
            </div>
            
            {/* Corner guidelines */}
            <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-white/40"></div>
            <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-white/40"></div>
            <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-white/40"></div>
            <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-white/40"></div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-600">Zoom</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setPos({ x: 0, y: 0 }); lastPos.current = { x: 0, y: 0 }; }}
                className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
              >
                Center
              </button>
              <button
                type="button"
                onClick={() => { setScale(1); setPos({ x: 0, y: 0 }); lastPos.current = { x: 0, y: 0 }; }}
                className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
              >
                Reset
              </button>
            </div>
          </div>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.01"
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Zoom out</span>
            <span>Zoom in</span>
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button className="flex-1 px-4 py-2 border rounded-lg" onClick={onCancel} type="button">Cancel</button>
          <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg" onClick={cropAndCompress} type="button">Save</button>
        </div>
      </motion.div>
    </div>
  );
}