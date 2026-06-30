import React from 'react';
import { 
  Undo2, 
  Redo2, 
  Download, 
  FolderOpen, 
  Edit3, 
  Sparkles,
  Info
} from 'lucide-react';

interface AppHeaderProps {
  projectName: string;
  onRenameProject: (name: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onExport: () => void;
  onOpenGallery: () => void;
  isSaving: boolean;
}

export default function AppHeader({
  projectName,
  onRenameProject,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onExport,
  onOpenGallery,
  isSaving
}: AppHeaderProps) {
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [tempName, setTempName] = React.useState(projectName);
  const [showInfo, setShowInfo] = React.useState(false);

  React.useEffect(() => {
    setTempName(projectName);
  }, [projectName]);

  const handleSaveName = () => {
    if (tempName.trim()) {
      onRenameProject(tempName.trim());
    }
    setIsEditingName(false);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-20 shrink-0 select-none">
      {/* Brand Logo & Name */}
      <div className="flex items-center space-x-4">
        <div className="w-9 h-9 bg-sky-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-sky-200 animate-pulse-slow">
          B
        </div>
        <div className="flex flex-col">
          <h1 className="text-base font-bold tracking-tight text-slate-900 leading-none">Bloom Sketch</h1>
          <span className="text-[10px] text-sky-500 font-semibold tracking-wider uppercase mt-1">Minimal Studio</span>
        </div>
        
        <div className="h-6 w-px bg-slate-200"></div>
        
        {/* Project Name Renameable */}
        <div className="flex items-center space-x-2">
          {isEditingName ? (
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              className="px-2 py-1 text-sm bg-slate-50 border border-sky-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 font-medium"
              autoFocus
            />
          ) : (
            <div 
              onClick={() => setIsEditingName(true)}
              className="flex items-center space-x-1 px-2.5 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer transition-all duration-200 group"
            >
              <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900 truncate max-w-[180px]">
                {projectName}
              </span>
              <Edit3 size={12} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
            </div>
          )}
          
          {isSaving ? (
            <span className="text-[10px] text-emerald-500 font-medium bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Auto-saved
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded-full">
              Synced
            </span>
          )}
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center space-x-6">
        {/* Undo/Redo pair */}
        <div className="flex items-center space-x-1.5 bg-slate-50 p-1 rounded-xl border border-slate-100">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-2 rounded-lg transition-all duration-200 ${
              canUndo 
                ? 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm' 
                : 'text-slate-300 cursor-not-allowed opacity-50'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={16} strokeWidth={2.5} />
          </button>
          
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-2 rounded-lg transition-all duration-200 ${
              canRedo 
                ? 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm' 
                : 'text-slate-300 cursor-not-allowed opacity-50'
            }`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Action Button Set */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenGallery}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold transition-all duration-200 border border-slate-200 hover:border-slate-300"
          >
            <FolderOpen size={14} />
            <span>My Gallery</span>
          </button>
          
          <button
            onClick={onExport}
            className="flex items-center space-x-1.5 bg-sky-500 hover:bg-sky-600 text-white px-4 py-1.5 rounded-xl text-xs font-semibold shadow-sm shadow-sky-100 transition-all duration-200"
          >
            <Download size={14} />
            <span>Export Artwork</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all duration-200"
            >
              <Info size={16} />
            </button>
            
            {showInfo && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50 text-xs text-slate-600 space-y-2 animate-fade-in">
                <p className="font-bold text-slate-900 flex items-center gap-1">
                  <Sparkles size={14} className="text-sky-500" /> Bloom Sketch Studio
                </p>
                <p>Welcome to your minimal creative canvas! Standard options are on your left and properties are on your right.</p>
                <div className="pt-2 border-t border-slate-100 font-mono text-[10px] space-y-1">
                  <div>• Use <b>Space + Drag</b> to pan canvas</div>
                  <div>• Use <b>Mousewheel</b> to zoom</div>
                  <div>• Use <b>Shift</b> while drawing shapes to lock aspect ratio</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
