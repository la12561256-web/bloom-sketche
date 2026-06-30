interface SidebarBrushesProps {
  brushSize: number;
  brushOpacity: number;
  currentColor: string;
  onChangeSize: (size: number) => void;
  onChangeOpacity: (opacity: number) => void;
  activeTool: string;
}

export default function SidebarBrushes({
  brushSize,
  brushOpacity,
  currentColor,
  onChangeSize,
  onChangeOpacity,
  activeTool
}: SidebarBrushesProps) {
  // Translate tool display name
  const toolName = activeTool.charAt(0).toUpperCase() + activeTool.slice(1);

  return (
    <div className="p-5 border-b border-slate-100 select-none">
      <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">
        {toolName} Properties
      </h3>

      <div className="space-y-5">
        {/* Brush Size Slider */}
        <div>
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="text-slate-500 font-medium">Stroke Width</span>
            <span className="font-mono bg-slate-50 px-2 py-0.5 border border-slate-100 rounded text-slate-700 font-bold text-[10px]">
              {brushSize}px
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-[10px] text-slate-400 font-medium">1px</span>
            <input
              type="range"
              min="1"
              max="100"
              value={brushSize}
              onChange={(e) => onChangeSize(Number(e.target.value))}
              className="flex-1 h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-sky-500 hover:accent-sky-600 outline-none"
            />
            <span className="text-[10px] text-slate-400 font-medium">100px</span>
          </div>
        </div>

        {/* Brush Opacity Slider */}
        <div>
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="text-slate-500 font-medium">Opacity</span>
            <span className="font-mono bg-slate-50 px-2 py-0.5 border border-slate-100 rounded text-slate-700 font-bold text-[10px]">
              {Math.round(brushOpacity * 100)}%
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-[10px] text-slate-400 font-medium">10%</span>
            <input
              type="range"
              min="10"
              max="100"
              value={brushOpacity * 100}
              onChange={(e) => onChangeOpacity(Number(e.target.value) / 100)}
              className="flex-1 h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-sky-500 hover:accent-sky-600 outline-none"
            />
            <span className="text-[10px] text-slate-400 font-medium">100%</span>
          </div>
        </div>

        {/* Live Brush Dot Preview */}
        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Preview</span>
          <div className="flex-1 flex justify-center items-center h-12 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden relative ml-6">
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '8px 8px' }}></div>
            <div 
              className="rounded-full shadow-inner transition-all duration-100 max-w-full"
              style={{
                width: `${Math.min(brushSize, 40)}px`,
                height: `${Math.min(brushSize, 40)}px`,
                backgroundColor: currentColor,
                opacity: brushOpacity
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
