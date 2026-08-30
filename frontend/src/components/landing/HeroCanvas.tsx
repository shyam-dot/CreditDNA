import React, { useEffect, useRef, useState } from 'react';

const FRAME_COUNT = 240;

const getFrameUrl = (index: number) => {
  const frameNumber = String(index + 1).padStart(4, '0');
  return `/Images/${frameNumber}.jpg?v=2`;
};

export default function HeroCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const targetFrameRef = useRef<number>(0);
  const currentFrameRef = useRef<number>(0);
  const [loadedCount, setLoadedCount] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // 1. Preload Images Sequence
  useEffect(() => {
    let isMounted = true;
    const images: HTMLImageElement[] = [];
    let loaded = 0;

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = getFrameUrl(i);
      img.onload = () => {
        if (!isMounted) return;
        loaded++;
        setLoadedCount(loaded);
        if (loaded === FRAME_COUNT) {
          setIsLoaded(true);
        }
      };
      img.onerror = () => {
        if (!isMounted) return;
        loaded++;
        setLoadedCount(loaded);
      };
      images.push(img);
    }
    imagesRef.current = images;

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Track Scroll Position
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalHeight = rect.height - window.innerHeight;
      if (totalHeight <= 0) return;

      const currentScroll = Math.max(0, -rect.top);
      const progress = Math.min(1, Math.max(0, currentScroll / totalHeight));

      const frameIndex = Math.min(
        FRAME_COUNT - 1,
        Math.floor(progress * (FRAME_COUNT - 1))
      );
      targetFrameRef.current = frameIndex;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 3. Smooth Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;

    const render = () => {
      // Smooth linear interpolation for buttery frame transitions
      currentFrameRef.current += (targetFrameRef.current - currentFrameRef.current) * 0.12;
      const frameToDraw = Math.min(
        FRAME_COUNT - 1,
        Math.max(0, Math.round(currentFrameRef.current))
      );

      const img = imagesRef.current[frameToDraw];

      if (img && img.complete && img.naturalWidth > 0) {
        const width = window.innerWidth;
        const height = window.innerHeight;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
          canvas.width = width * dpr;
          canvas.height = height * dpr;
          canvas.style.width = `${width}px`;
          canvas.style.height = `${height}px`;
        }

        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, width, height);

        // Aspect ratio cover algorithm
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const screenRatio = width / height;

        let drawW = width;
        let drawH = height;
        let offsetX = 0;
        let offsetY = 0;

        if (screenRatio > imgRatio) {
          drawH = width / imgRatio;
          offsetY = (height - drawH) / 2;
        } else {
          drawW = height * imgRatio;
          offsetX = (width - drawW) / 2;
        }

        ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
        ctx.restore();
      }

      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-[450vh] bg-[#0B0F19]">
      {/* Sticky Fullscreen Canvas Container */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden flex items-center justify-center z-0">
        <canvas ref={canvasRef} className="block w-full h-full" />

        {/* Minimal Progress Bar while images preload */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-[#0B0F19] flex flex-col items-center justify-center z-50 transition-opacity duration-300">
            <div className="w-48 h-1.5 bg-gray-800 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-cyan-400 transition-all duration-150"
                style={{ width: `${(loadedCount / FRAME_COUNT) * 100}%` }}
              />
            </div>
            <span className="font-mono text-xs text-gray-400 tracking-wider">
              LOADING ({Math.round((loadedCount / FRAME_COUNT) * 100)}%)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
