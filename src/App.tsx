import React from 'react';
import AppHeader from './components/AppHeader';
import Toolbar from './components/Toolbar';
import SidebarColors from './components/SidebarColors';
import SidebarBrushes from './components/SidebarBrushes';
import CanvasContainer from './components/CanvasContainer';
import ProjectGallery, { GalleryProject } from './components/ProjectGallery';
import { Stroke, Layer, ToolType, ShapeType } from './types';
import { Layers, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';

// Pre-set aesthetic drawing colors
const INITIAL_PRESET_COLORS = [
  '#0EA5E9', // sky-500
  '#6366F1', // indigo-500
  '#F43F5E', // rose-500
  '#F59E0B', // amber-500
  '#10B981', // emerald-500
  '#1E293B', // slate-800
  '#FFFFFF', // white
];

const DEFAULT_LAYERS: Layer[] = [
  { id: 'layer-foreground', name: 'Foreground Strokes', visible: true, opacity: 1.0 },
  { id: 'layer-wash', name: 'Color Wash', visible: true, opacity: 0.8 },
  { id: 'layer-sketch', name: 'Background Sketch', visible: true, opacity: 0.6 },
];

// Sample default minimalist spring vase vector artwork!
const createDefaultStrokes = (layerIdForeground: string, layerIdWash: string, layerIdSketch: string): Stroke[] => {
  return [
    // Background Sketch: Delicate gray lines representing a vase outline
    {
      id: 'default-sketch-vase',
      points: [
        { x: 900, y: 1100 },
        { x: 860, y: 950 },
        { x: 880, y: 750 },
        { x: 940, y: 650 },
        { x: 1060, y: 650 },
        { x: 1120, y: 750 },
        { x: 1140, y: 950 },
        { x: 1100, y: 1100 },
        { x: 900, y: 1100 }
      ],
      color: '#94a3b8',
      size: 3,
      opacity: 0.5,
      tool: 'pen',
      layerId: layerIdSketch
    },
    // Foreground Strokes: Darker precise line drawing for plant stems
    {
      id: 'default-stem-1',
      points: [
        { x: 1000, y: 800 },
        { x: 1000, y: 600 },
        { x: 980, y: 480 },
        { x: 940, y: 400 }
      ],
      color: '#334155',
      size: 5,
      opacity: 0.9,
      tool: 'pen',
      layerId: layerIdForeground
    },
    {
      id: 'default-stem-2',
      points: [
        { x: 1000, y: 780 },
        { x: 1020, y: 620 },
        { x: 1050, y: 500 },
        { x: 1090, y: 420 }
      ],
      color: '#334155',
      size: 5,
      opacity: 0.9,
      tool: 'pen',
      layerId: layerIdForeground
    },
    // Color Wash: Soft water-color like circles representing flowers
    {
      id: 'default-flower-wash-1',
      points: [
        { x: 940, y: 400 },
        { x: 935, y: 395 },
        { x: 930, y: 400 },
        { x: 935, y: 405 },
        { x: 940, y: 400 }
      ],
      color: '#bae6fd',
      size: 80,
      opacity: 0.7,
      tool: 'brush',
      layerId: layerIdWash
    },
    {
      id: 'default-flower-wash-2',
      points: [
        { x: 1090, y: 420 },
        { x: 1085, y: 415 },
        { x: 1080, y: 420 },
        { x: 1085, y: 425 },
        { x: 1090, y: 420 }
      ],
      color: '#fecdd3',
      size: 90,
      opacity: 0.7,
      tool: 'brush',
      layerId: layerIdWash
    },
    // Foreground details: Flower centers
    {
      id: 'default-flower-center-1',
      points: [
        { x: 940, y: 400 },
        { x: 942, y: 402 }
      ],
      color: '#0ea5e9',
      size: 14,
      opacity: 1.0,
      tool: 'pen',
      layerId: layerIdForeground
    },
    {
      id: 'default-flower-center-2',
      points: [
        { x: 1090, y: 420 },
        { x: 1092, y: 422 }
      ],
      color: '#f43f5e',
      size: 16,
      opacity: 1.0,
      tool: 'pen',
      layerId: layerIdForeground
    }
  ];
};

export default function App() {
  const [activeProjectId, setActiveProjectId] = React.useState<string>('project-1');
  const [projectName, setProjectName] = React.useState<string>('Spring_Vase_01');
  const [strokes, setStrokes] = React.useState<Stroke[]>([]);
  const [redoStack, setRedoStack] = React.useState<Stroke[]>([]);
  const [layers, setLayers] = React.useState<Layer[]>(DEFAULT_LAYERS);
  
  // Custom tool states
  const [tool, setTool] = React.useState<ToolType>('pen');
  const [shapeType, setShapeType] = React.useState<ShapeType>('rectangle');
  const [brushSize, setBrushSize] = React.useState<number>(8);
  const [brushOpacity, setBrushOpacity] = React.useState<number>(0.9);
  const [brushColor, setBrushColor] = React.useState<string>('#334155');
  const [activeLayerId, setActiveLayerId] = React.useState<string>('layer-foreground');
  const [showGrid, setShowGrid] = React.useState<boolean>(true);
  
  // View states
  const [zoom, setZoom] = React.useState<number>(0.85);
  const [panX, setPanX] = React.useState<number>(0);
  const [panY, setPanY] = React.useState<number>(-20);

  // Gallery and layout states
  const [isGalleryOpen, setIsGalleryOpen] = React.useState<boolean>(false);
  const [isSaving, setIsSaving] = React.useState<boolean>(false);
  const [customColors, setCustomColors] = React.useState<string[]>(INITIAL_PRESET_COLORS);
  const [projectsList, setProjectsList] = React.useState<GalleryProject[]>([]);

  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  // Load project index list and first active project from local storage
  React.useEffect(() => {
    try {
      const storedProjects = localStorage.getItem('bloom_sketch_projects_list');
      if (storedProjects) {
        const parsed = JSON.parse(storedProjects) as GalleryProject[];
        setProjectsList(parsed);
        if (parsed.length > 0) {
          // Load the first available
          loadProject(parsed[0].id);
        } else {
          initializeFirstProject();
        }
      } else {
        initializeFirstProject();
      }
    } catch (e) {
      initializeFirstProject();
    }
  }, []);

  const initializeFirstProject = () => {
    const defaultStrokes = createDefaultStrokes('layer-foreground', 'layer-wash', 'layer-sketch');
    const firstProj: GalleryProject = {
      id: 'project-1',
      name: 'Spring_Vase_01',
      updatedAt: new Date().toISOString(),
      strokesCount: defaultStrokes.length
    };
    localStorage.setItem('bloom_sketch_projects_list', JSON.stringify([firstProj]));
    setProjectsList([firstProj]);
    
    // Set actual project data
    setActiveProjectId('project-1');
    setProjectName('Spring_Vase_01');
    setStrokes(defaultStrokes);
    setLayers(DEFAULT_LAYERS);
    saveProjectData('project-1', 'Spring_Vase_01', defaultStrokes, DEFAULT_LAYERS);
  };

  // Loads project data
  const loadProject = (id: string) => {
    try {
      const dataStr = localStorage.getItem(`bloom_sketch_data_${id}`);
      if (dataStr) {
        const parsed = JSON.parse(dataStr);
        setActiveProjectId(id);
        setProjectName(parsed.name || 'Untitled');
        setStrokes(parsed.strokes || []);
        setLayers(parsed.layers || DEFAULT_LAYERS);
        setRedoStack([]);
      }
    } catch (e) {
      console.error('Error loading project', e);
    }
  };

  // Saves project data and updates gallery lists
  const saveProjectData = (
    id: string, 
    name: string, 
    currentStrokes: Stroke[], 
    currentLayers: Layer[]
  ) => {
    setIsSaving(true);
    try {
      localStorage.setItem(`bloom_sketch_data_${id}`, JSON.stringify({
        name,
        strokes: currentStrokes,
        layers: currentLayers
      }));

      // Update index list
      const listStr = localStorage.getItem('bloom_sketch_projects_list');
      let currentList: GalleryProject[] = [];
      if (listStr) {
        currentList = JSON.parse(listStr);
      }

      const existingIdx = currentList.findIndex(p => p.id === id);
      const updatedProject: GalleryProject = {
        id,
        name,
        updatedAt: new Date().toISOString(),
        strokesCount: currentStrokes.length
      };

      if (existingIdx >= 0) {
        currentList[existingIdx] = updatedProject;
      } else {
        currentList.push(updatedProject);
      }

      localStorage.setItem('bloom_sketch_projects_list', JSON.stringify(currentList));
      setProjectsList(currentList);
    } catch (e) {
      console.error(e);
    }
    setTimeout(() => setIsSaving(false), 600);
  };

  // Trigger save whenever drawing strokes or layers modify
  React.useEffect(() => {
    if (!activeProjectId) return;
    const delayDebounce = setTimeout(() => {
      saveProjectData(activeProjectId, projectName, strokes, layers);
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [strokes, layers, projectName, activeProjectId]);

  const handleRenameProject = (newName: string) => {
    setProjectName(newName);
    saveProjectData(activeProjectId, newName, strokes, layers);
  };

  const handleAddStroke = (newStroke: Stroke) => {
    setStrokes(prev => [...prev, newStroke]);
    setRedoStack([]); // Clear redo
  };

  const handleRemoveStroke = (id: string) => {
    setStrokes(prev => prev.filter(s => s.id !== id));
  };

  // Undo / Redo engine
  const handleUndo = () => {
    if (strokes.length === 0) return;
    const last = strokes[strokes.length - 1];
    setStrokes(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, last]);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setStrokes(prev => [...prev, next]);
  };

  // Shortcut key bindings
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [strokes, redoStack]);

  // Swatch operations
  const handleAddCustomColor = (color: string) => {
    if (!customColors.includes(color)) {
      setCustomColors(prev => [...prev, color]);
    }
  };

  const handleRemoveCustomColor = (color: string) => {
    setCustomColors(prev => prev.filter(c => c !== color));
  };

  // Gallery Project Creation / Deletion / Navigation
  const handleSelectProject = (id: string) => {
    loadProject(id);
  };

  const handleDeleteProject = (id: string) => {
    localStorage.removeItem(`bloom_sketch_data_${id}`);
    const remaining = projectsList.filter(p => p.id !== id);
    localStorage.setItem('bloom_sketch_projects_list', JSON.stringify(remaining));
    setProjectsList(remaining);
    
    if (activeProjectId === id) {
      if (remaining.length > 0) {
        loadProject(remaining[0].id);
      } else {
        initializeFirstProject();
      }
    }
  };

  const handleCreateNewProject = () => {
    const newId = `project-${Date.now()}`;
    const defaultName = `Sketch_${projectsList.length + 1}`;
    
    setActiveProjectId(newId);
    setProjectName(defaultName);
    setStrokes([]);
    setLayers(DEFAULT_LAYERS);
    setRedoStack([]);
    
    saveProjectData(newId, defaultName, [], DEFAULT_LAYERS);
  };

  // Dynamic layers setup
  const handleToggleLayerVisibility = (id: string) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
  };

  const handleAddLayer = () => {
    const count = layers.length + 1;
    const newL: Layer = {
      id: `layer-${Date.now()}`,
      name: `Art Layer ${count}`,
      visible: true,
      opacity: 1.0
    };
    setLayers([newL, ...layers]); // Add to top
    setActiveLayerId(newL.id);
  };

  const handleRemoveLayer = (id: string) => {
    if (layers.length <= 1) return; // Retain at least one layer
    setLayers(prev => prev.filter(l => l.id !== id));
    // Fallback active layer if active layer is deleted
    if (activeLayerId === id) {
      const remaining = layers.filter(l => l.id !== id);
      setActiveLayerId(remaining[0].id);
    }
  };

  // Image export downloader
  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Create temporary download link anchor
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${projectName.toLowerCase().replace(/\s+/g, '_')}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleResetZoomAndPan = () => {
    setZoom(0.85);
    setPanX(0);
    setPanY(-20);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 font-sans overflow-hidden text-slate-800">
      {/* Header */}
      <AppHeader
        projectName={projectName}
        onRenameProject={handleRenameProject}
        canUndo={strokes.length > 0}
        canRedo={redoStack.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onExport={handleExport}
        onOpenGallery={() => setIsGalleryOpen(true)}
        isSaving={isSaving}
      />

      {/* Main Workspace */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Floating Tools Toolbar (Left) */}
        <Toolbar
          activeTool={tool}
          selectedShapeType={shapeType}
          onSelectTool={setTool}
          onSelectShapeType={setShapeType}
          showGrid={showGrid}
          onToggleGrid={() => setShowGrid(!showGrid)}
          onResetZoom={handleResetZoomAndPan}
          zoom={zoom}
        />

        {/* Center Canvas workspace */}
        <CanvasContainer
          tool={tool}
          shapeType={shapeType}
          brushSize={brushSize}
          brushOpacity={brushOpacity}
          brushColor={brushColor}
          activeLayerId={activeLayerId}
          layers={layers}
          strokes={strokes}
          onAddStroke={handleAddStroke}
          onRemoveStroke={handleRemoveStroke}
          showGrid={showGrid}
          zoom={zoom}
          onSetZoom={setZoom}
          panX={panX}
          onSetPanX={setPanX}
          panY={panY}
          onSetPanY={setPanY}
          canvasRef={canvasRef}
        />

        {/* Properties Sidebar Panel (Right) */}
        <aside className="w-72 h-full bg-white border-l border-slate-200 flex flex-col z-20 shrink-0 select-none">
          {/* Color palette wheel */}
          <SidebarColors
            currentColor={brushColor}
            onSelectColor={setBrushColor}
            presetColors={customColors}
            onAddCustomColor={handleAddCustomColor}
            onRemoveCustomColor={handleRemoveCustomColor}
          />

          {/* Sizing properties sliders */}
          <SidebarBrushes
            brushSize={brushSize}
            brushOpacity={brushOpacity}
            currentColor={brushColor}
            onChangeSize={setBrushSize}
            onChangeOpacity={setBrushOpacity}
            activeTool={tool}
          />

          {/* Layers settings card */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-1.5">
                <Layers size={14} className="text-slate-400" />
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Layers</h3>
              </div>
              <button 
                onClick={handleAddLayer}
                className="p-1 text-slate-400 hover:text-sky-500 hover:bg-slate-50 rounded-md transition-colors cursor-pointer"
                title="Create custom layer"
              >
                <Plus size={14} strokeWidth={2.5} />
              </button>
            </div>

            {/* Scrollable layer cards */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1.5 scrollbar-thin">
              {layers.map((layer) => {
                const isActive = layer.id === activeLayerId;
                return (
                  <div 
                    key={layer.id}
                    onClick={() => setActiveLayerId(layer.id)}
                    className={`flex items-center space-x-3 p-3 rounded-xl border transition-all duration-150 cursor-pointer ${
                      isActive 
                        ? 'bg-sky-50/70 border-sky-100' 
                        : 'bg-white border-slate-100 hover:bg-slate-50/40'
                    }`}
                  >
                    {/* Layer selection / dot */}
                    <div className={`w-2.5 h-2.5 rounded-full ${
                      isActive ? 'bg-sky-500' : 'bg-slate-200'
                    }`} />

                    {/* Layer details */}
                    <span className={`text-xs font-semibold flex-1 truncate ${
                      isActive ? 'text-sky-900 font-bold' : 'text-slate-600'
                    }`}>
                      {layer.name}
                    </span>

                    {/* Visibility & options action controls */}
                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleLayerVisibility(layer.id);
                        }}
                        className="p-1 text-slate-300 hover:text-slate-600 rounded cursor-pointer"
                        title="Toggle visibility"
                      >
                        {layer.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                      </button>

                      {/* Delete custom layers */}
                      {!['layer-foreground', 'layer-wash', 'layer-sketch'].includes(layer.id) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveLayer(layer.id);
                          }}
                          className="p-1 text-slate-300 hover:text-rose-500 rounded cursor-pointer"
                          title="Delete custom layer"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </main>

      {/* Gallery Modal overlay list */}
      <ProjectGallery
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        projects={projectsList}
        activeProjectId={activeProjectId}
        onSelectProject={handleSelectProject}
        onDeleteProject={handleDeleteProject}
        onCreateNewProject={handleCreateNewProject}
      />

      {/* Footer Details */}
      <footer className="h-8 bg-white border-t border-slate-200 px-6 flex items-center justify-between text-[10px] text-slate-400 font-medium shrink-0 z-20 select-none">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <span>Zoom:</span>
            <span className="text-slate-500 font-semibold">{Math.round(zoom * 100)}%</span>
          </div>
          <span className="text-slate-200">|</span>
          <div className="flex items-center space-x-1">
            <span>Canvas:</span>
            <span className="text-slate-500 font-semibold">2000 x 1500 px</span>
          </div>
        </div>
        <div className="flex items-center space-x-1 text-slate-400 font-semibold tracking-wide">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
          <span>Cloud Sandbox Active</span>
        </div>
      </footer>
    </div>
  );
}
