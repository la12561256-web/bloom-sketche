import React from 'react';
import { Plus } from 'lucide-react';

interface SidebarColorsProps {
  currentColor: string;
  onSelectColor: (color: string) => void;
  presetColors: string[];
  onAddCustomColor: (color: string) => void;
  onRemoveCustomColor: (color: string) => void;
}

export default function SidebarColors({
  currentColor,
  onSelectColor,
  presetColors,
  onAddCustomColor,
  onRemoveCustomColor
}: SidebarColorsProps) {
  const [hexInput, setHexInput] = React.useState(currentColor);
  const colorWheelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setHexInput(currentColor);
  }, [currentColor]);

  const handleHexSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let val = hexInput.trim();
    if (!val.startsWith('#')) {
      val = '#' + val;
    }
    const reg = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (reg.test(val)) {
      onSelectColor(val.toUpperCase());
    } else {
      setHexInput(currentColor);
    }
  };

  // Safe color picker helper from circular coordinate
  const handleColorWheelClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!colorWheelRef.current) return;
    const rect = colorWheelRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Calculate angle in degrees
    let angle = Math.atan2(y, x) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    
    // Calculate distance from center (saturation)
    const distance = Math.min(Math.sqrt(x * x + y * y) / (rect.width / 2), 1);
    
    // Derive HSL color
    const hue = Math.round(angle);
    const saturation = Math.round(distance * 100);
    const lightness = 50; // Keep lightness uniform for stable drawing colors
    
    // Convert HSL to Hex
    const hex = hslToHex(hue, saturation, lightness);
    onSelectColor(hex);
  };

  // Quick helper converts HSL to Hex
  function hslToHex(h: number, s: number, l: number): string {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
  }

  return (
    <div className="p-5 border-b border-slate-100 select-none">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Color Palette</h3>
        <form onSubmit={handleHexSubmit} className="flex items-center space-x-1">
          <span className="text-[10px] font-mono text-slate-400 mr-0.5">#</span>
          <input
            type="text"
            value={hexInput.replace('#', '')}
            onChange={(e) => setHexInput('#' + e.target.value)}
            onBlur={handleHexSubmit}
            className="w-16 text-[10px] font-mono bg-slate-100 border border-transparent hover:border-slate-200 focus:bg-white focus:border-sky-300 focus:ring-1 focus:ring-sky-300 px-1.5 py-0.5 rounded text-slate-600 outline-none text-center font-bold"
            maxLength={6}
          />
        </form>
      </div>

      {/* Interactive Color Wheel/Mixer container */}
      <div className="relative flex justify-center py-2">
        <div 
          ref={colorWheelRef}
          onClick={handleColorWheelClick}
          className="relative w-36 h-36 rounded-full cursor-crosshair shadow-md border border-slate-200 overflow-hidden active:scale-[0.98] transition-all duration-150"
          style={{
            background: 'conic-gradient(from 0deg, red, yellow, lime, aqua, blue, magenta, red)'
          }}
        >
          {/* Overlay white radial gradient for saturation mixing */}
          <div className="absolute inset-0 bg-[radial-gradient(circle,white_0%,transparent_100%)] opacity-85"></div>
          
          {/* Outer Ring for Clean aesthetic */}
          <div className="absolute inset-2 rounded-full border border-white/40 pointer-events-none"></div>

          {/* Current Selection Ring Pointer */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-5 h-5 bg-white rounded-full shadow-lg border-2 border-slate-700 flex items-center justify-center overflow-hidden">
              <div 
                className="w-2.5 h-2.5 rounded-full transition-colors duration-200"
                style={{ backgroundColor: currentColor }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Swatches List */}
      <div className="mt-5">
        <div className="flex items-center justify-between text-[9px] font-semibold text-slate-400 mb-2.5">
          <span>Active Swatches</span>
          <button 
            onClick={() => onAddCustomColor(currentColor)}
            className="flex items-center gap-0.5 text-sky-500 hover:text-sky-600 font-bold"
            title="Save color to palette"
          >
            <Plus size={10} strokeWidth={3} /> Save Color
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {presetColors.map((color, idx) => {
            const isSelected = currentColor.toUpperCase() === color.toUpperCase();
            return (
              <div key={`${color}-${idx}`} className="relative group">
                <button
                  onClick={() => onSelectColor(color)}
                  className={`w-7 h-7 rounded-lg shadow-sm border cursor-pointer hover:scale-105 transition-all relative ${
                    isSelected 
                      ? 'border-slate-800 scale-110 ring-2 ring-sky-100' 
                      : 'border-slate-200 hover:border-slate-400'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
                
                {/* Remove button for saved colors (except default ones) */}
                {idx >= 7 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveCustomColor(color);
                    }}
                    className="absolute -top-1 -right-1 hidden group-hover:flex w-3.5 h-3.5 bg-rose-500 text-white rounded-full items-center justify-center shadow-md border border-white"
                    title="Delete swatch"
                  >
                    <Plus size={8} className="rotate-45" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
