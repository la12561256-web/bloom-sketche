import React from 'react';
import { 
  MousePointer, 
  Pencil, 
  Brush, 
  Highlighter, 
  Eraser, 
  Shapes, 
  Square, 
  Circle, 
  Minus, 
  ArrowRight, 
  Star,
  Grid,
  Maximize2
} from 'lucide-react';
import { ToolType, ShapeType } from '../types';

interface ToolbarProps {
  activeTool: ToolType;
  selectedShapeType: ShapeType;
  onSelectTool: (tool: ToolType) => void;
  onSelectShapeType: (shape: ShapeType) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  onResetZoom: () => void;
  zoom: number;
}

export default function Toolbar({
  activeTool,
  selectedShapeType,
  onSelectTool,
  onSelectShapeType,
  showGrid,
  onToggleGrid,
  onResetZoom,
  zoom
}: ToolbarProps) {
  const [showShapeSelector, setShowShapeSelector] = React.useState(false);

  const tools = [
    { id: 'select', label: 'Pointer & Pan', icon: MousePointer },
    { id: 'pen', label: 'Precision Pen', icon: Pencil },
    { id: 'brush', label: 'Artistic Brush', icon: Brush },
    { id: 'highlighter', label: 'Translucent Marker', icon: Highlighter },
    { id: 'eraser', label: 'Stroke Eraser', icon: Eraser },
    { id: 'shape', label: 'Geometric Shapes', icon: Shapes },
  ] as const;

  const shapes = [
    { id: 'rectangle', label: 'Rectangle', icon: Square },
    { id: 'circle', label: 'Circle', icon: Circle },
    { id: 'line', label: 'Line', icon: Minus },
    { id: 'arrow', label: 'Arrow', icon: ArrowRight },
    { id: 'star', label: 'Star', icon: Star },
  ] as const;

  const handleToolClick = (toolId: ToolType) => {
    onSelectTool(toolId);
    if (toolId === 'shape') {
      setShowShapeSelector(prev => !prev);
    } else {
      setShowShapeSelector(false);
    }
  };

  return (
    <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col items-center z-30 select-none">
      {/* Primary Toolbar Card */}
      <nav className="flex flex-col space-y-2 bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-slate-200/60">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          
          return (
            <div key={tool.id} className="relative group">
              <button
                onClick={() => handleToolClick(tool.id)}
                className={`p-3 rounded-xl transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-100 scale-105' 
                    : 'text-slate-400 hover:text-sky-500 hover:bg-sky-50'
                }`}
                title={tool.label}
              >
                <Icon size={20} strokeWidth={2.2} />
              </button>

              {/* Minimal Tooltip */}
              <div className="absolute left-16 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-900 text-white text-[10px] font-semibold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-md z-50">
                {tool.label}
              </div>
            </div>
          );
        })}

        <div className="h-px bg-slate-100 mx-1"></div>

        {/* View Controls */}
        <div className="relative group">
          <button
            onClick={onToggleGrid}
            className={`p-3 rounded-xl transition-all duration-200 cursor-pointer ${
              showGrid 
                ? 'bg-slate-100 text-slate-800' 
                : 'text-slate-400 hover:text-sky-500 hover:bg-sky-50'
            }`}
            title="Toggle Grid Overlay"
          >
            <Grid size={20} strokeWidth={2.2} />
          </button>
          <div className="absolute left-16 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-900 text-white text-[10px] font-semibold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-md z-50">
            Grid: {showGrid ? 'On' : 'Off'}
          </div>
        </div>

        <div className="relative group">
          <button
            onClick={onResetZoom}
            className="p-3 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-xl transition-all duration-200 cursor-pointer"
            title="Reset Zoom to 100%"
          >
            <Maximize2 size={20} strokeWidth={2.2} />
          </button>
          <div className="absolute left-16 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-900 text-white text-[10px] font-semibold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-md z-50">
            Reset View ({Math.round(zoom * 100)}%)
          </div>
        </div>
      </nav>

      {/* Floating Shape Sub-selector (shown when shape tool is active and clicked) */}
      {activeTool === 'shape' && showShapeSelector && (
        <div className="mt-4 flex flex-col space-y-2 bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-slate-200/60 animate-fade-in-up">
          <div className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400 text-center select-none">
            Shapes
          </div>
          {shapes.map((shape) => {
            const ShapeIcon = shape.icon;
            const isShapeActive = selectedShapeType === shape.id;

            return (
              <button
                key={shape.id}
                onClick={() => {
                  onSelectShapeType(shape.id);
                  setShowShapeSelector(false);
                }}
                className={`p-2.5 rounded-lg transition-all duration-150 cursor-pointer flex items-center justify-center ${
                  isShapeActive 
                    ? 'bg-sky-50 text-sky-600 border border-sky-100' 
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                }`}
                title={shape.label}
              >
                <ShapeIcon size={16} strokeWidth={2.2} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
