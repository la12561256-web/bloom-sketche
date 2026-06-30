import React from 'react';
import { Stroke, Layer, ToolType, ShapeType, Point } from '../types';

interface CanvasContainerProps {
  tool: ToolType;
  shapeType: ShapeType;
  brushSize: number;
  brushOpacity: number;
  brushColor: string;
  activeLayerId: string;
  layers: Layer[];
  strokes: Stroke[];
  onAddStroke: (stroke: Stroke) => void;
  onRemoveStroke: (id: string) => void;
  showGrid: boolean;
  zoom: number;
  onSetZoom: (zoom: number) => void;
  panX: number;
  onSetPanX: (x: number) => void;
  panY: number;
  onSetPanY: (y: number) => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export default function CanvasContainer({
  tool,
  shapeType,
  brushSize,
  brushOpacity,
  brushColor,
  activeLayerId,
  layers,
  strokes,
  onAddStroke,
  onRemoveStroke,
  showGrid,
  zoom,
  onSetZoom,
  panX,
  onSetPanX,
  panY,
  onSetPanY,
  canvasRef
}: CanvasContainerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [isPanning, setIsPanning] = React.useState(false);
  const [currentPoints, setCurrentPoints] = React.useState<Point[]>([]);
  const [panStart, setPanStart] = React.useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = React.useState<Point>({ x: 0, y: 0 });

  // Fixed high resolution drawing canvas
  const CANVAS_WIDTH = 2000;
  const CANVAS_HEIGHT = 1500;

  // Redraw canvas whenever strokes, layers, zoom, pan, grid, or current points change
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw grid if active
    if (showGrid) {
      ctx.save();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < CANVAS_WIDTH; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y < CANVAS_HEIGHT; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Render strokes layer-by-layer
    // Draw layers from bottom (index 2) to top (index 0)
    const reversedLayers = [...layers].reverse();
    
    reversedLayers.forEach(layer => {
      if (!layer.visible) return;

      // Find all strokes for this layer
      const layerStrokes = strokes.filter(s => s.layerId === layer.id);

      ctx.save();
      ctx.globalAlpha = layer.opacity;

      layerStrokes.forEach(stroke => {
        drawStrokeOnContext(ctx, stroke);
      });

      // Also draw active path preview if it belongs to this layer
      if (isDrawing && activeLayerId === layer.id && currentPoints.length > 0) {
        const tempStroke: Stroke = {
          id: 'temp',
          points: currentPoints,
          color: brushColor,
          size: brushSize,
          opacity: brushOpacity,
          tool: tool as Stroke['tool'],
          shapeType: tool === 'shape' ? shapeType : undefined,
          layerId: activeLayerId
        };
        drawStrokeOnContext(ctx, tempStroke);
      }

      ctx.restore();
    });
  }, [strokes, layers, isDrawing, currentPoints, showGrid, tool, shapeType, brushSize, brushOpacity, brushColor, activeLayerId]);

  // Helper to draw a single stroke vector on a canvas context
  const drawStrokeOnContext = (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    if (stroke.points.length === 0) return;

    ctx.save();
    ctx.lineCap = stroke.tool === 'brush' ? 'round' : 'square';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    
    // Set opacity / blend mode
    if (stroke.tool === 'highlighter') {
      ctx.globalAlpha = stroke.opacity * 0.45; // Make translucent
      ctx.globalCompositeOperation = 'multiply';
    } else {
      ctx.globalAlpha = stroke.opacity;
      ctx.globalCompositeOperation = 'source-over';
    }

    const pts = stroke.points;

    if (stroke.tool === 'shape' && stroke.shapeType) {
      const start = pts[0];
      const end = pts[pts.length - 1];
      ctx.beginPath();
      
      if (stroke.shapeType === 'rectangle') {
        ctx.rect(start.x, start.y, end.x - start.x, end.y - start.y);
        ctx.stroke();
      } else if (stroke.shapeType === 'circle') {
        const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
        ctx.arc(start.x, start.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (stroke.shapeType === 'line') {
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
      } else if (stroke.shapeType === 'arrow') {
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();

        // Draw arrow head
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        const headLength = Math.max(stroke.size * 2, 12);
        ctx.lineTo(end.x - headLength * Math.cos(angle - Math.PI / 6), end.y - headLength * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(end.x - headLength * Math.cos(angle + Math.PI / 6), end.y - headLength * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
      } else if (stroke.shapeType === 'star') {
        const cx = start.x;
        const cy = start.y;
        const rOuter = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
        const rInner = rOuter / 2;
        const spikes = 5;
        let rot = (Math.PI / 2) * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;

        ctx.moveTo(cx, cy - rOuter);
        for (let i = 0; i < spikes; i++) {
          x = cx + Math.cos(rot) * rOuter;
          y = cy + Math.sin(rot) * rOuter;
          ctx.lineTo(x, y);
          rot += step;

          x = cx + Math.cos(rot) * rInner;
          y = cy + Math.sin(rot) * rInner;
          ctx.lineTo(x, y);
          rot += step;
        }
        ctx.closePath();
        ctx.stroke();
      }
    } else {
      // Standard freehand stroke (pen, brush, highlighter, eraser)
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        // Smooth line curves
        const xc = (pts[i - 1].x + pts[i].x) / 2;
        const yc = (pts[i - 1].y + pts[i].y) / 2;
        ctx.quadraticCurveTo(pts[i - 1].x, pts[i - 1].y, xc, yc);
      }
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      ctx.stroke();
    }

    ctx.restore();
  };

  // Maps viewport coordinate (clientX, clientY) to internal high-res canvas (2000x1500) coordinate
  const getCanvasCoords = (clientX: number, clientY: number): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * CANVAS_WIDTH;
    const y = ((clientY - rect.top) / rect.height) * CANVAS_HEIGHT;
    return { x, y };
  };

  // Handles starting draw or pan
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // If Spacebar is pressed, or left-click is coupled with select tool, pan instead
    if (tool === 'select' || e.button === 1 || e.shiftKey) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panX, y: e.clientY - panY });
      return;
    }

    const coords = getCanvasCoords(e.clientX, e.clientY);
    
    if (tool === 'eraser') {
      setIsDrawing(true);
      handleEraserAction(coords);
    } else {
      setIsDrawing(true);
      setCurrentPoints([coords]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Track mouse coordinates for footer overlay
    const canvas = canvasRef.current;
    if (canvas) {
      const coords = getCanvasCoords(e.clientX, e.clientY);
      setMousePos({ x: Math.round(coords.x), y: Math.round(coords.y) });
    }

    if (isPanning) {
      onSetPanX(e.clientX - panStart.x);
      onSetPanY(e.clientY - panStart.y);
      return;
    }

    if (!isDrawing) return;

    const coords = getCanvasCoords(e.clientX, e.clientY);

    if (tool === 'eraser') {
      handleEraserAction(coords);
    } else if (tool === 'shape') {
      // Shape only needs start point and final preview point
      setCurrentPoints(prev => [prev[0], coords]);
    } else {
      setCurrentPoints(prev => [...prev, coords]);
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    if (!isDrawing) return;
    setIsDrawing(false);

    if (tool !== 'eraser' && currentPoints.length > 0) {
      const newStroke: Stroke = {
        id: `stroke-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        points: currentPoints,
        color: brushColor,
        size: brushSize,
        opacity: brushOpacity,
        tool: tool as Stroke['tool'],
        shapeType: tool === 'shape' ? shapeType : undefined,
        layerId: activeLayerId
      };
      onAddStroke(newStroke);
    }

    setCurrentPoints([]);
  };

  // Selective eraser path collisions
  const handleEraserAction = (point: Point) => {
    // Eraser threshold in canvas coordinate pixels
    const eraseRadius = brushSize + 15;

    // Search active layer strokes
    const activeStrokes = strokes.filter(s => s.layerId === activeLayerId);

    activeStrokes.forEach(stroke => {
      // Check if point matches any point in the stroke
      const collided = stroke.points.some(p => {
        const dx = p.x - point.x;
        const dy = p.y - point.y;
        return Math.sqrt(dx * dx + dy * dy) < eraseRadius;
      });

      if (collided) {
        onRemoveStroke(stroke.id);
      }
    });
  };

  // Zoom with Mouse Wheel scroll
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomIntensity = 0.1;
    const nextZoom = e.deltaY < 0 
      ? Math.min(zoom + zoomIntensity, 4) 
      : Math.max(zoom - zoomIntensity, 0.4);
    onSetZoom(nextZoom);
  };

  return (
    <div 
      ref={containerRef}
      onWheel={handleWheel}
      className="flex-1 h-full overflow-hidden relative bg-slate-100 flex items-center justify-center p-6 select-none"
    >
      {/* Centering and coordinate tracker widget */}
      <div className="absolute top-4 left-6 flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-slate-200 px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold text-slate-500 shadow-sm z-20">
        <span>X: {mousePos.x}px</span>
        <span className="text-slate-300">|</span>
        <span>Y: {mousePos.y}px</span>
        <span className="text-slate-300">|</span>
        <span>Zoom: {Math.round(zoom * 100)}%</span>
      </div>

      {/* Canvas Wrap Transform Board */}
      <div 
        className="transition-transform duration-75 ease-out relative"
        style={{
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          transformOrigin: 'center center',
          cursor: tool === 'select' ? 'grab' : isDrawing ? 'crosshair' : 'default'
        }}
      >
        <div className="relative bg-white shadow-2xl rounded-xl border border-slate-300/40 overflow-hidden">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="w-[800px] h-[600px] block bg-white touch-none"
          />
        </div>
      </div>

      {/* Live Guide Overlay in clean minimalist badge */}
      <div className="absolute bottom-4 left-6 bg-white/90 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-slate-200 text-[10px] font-semibold text-slate-500 shadow-sm flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
        <span>{tool === 'select' ? 'Space+Drag to Pan' : `Active Drawing: ${tool}`}</span>
      </div>
    </div>
  );
}
