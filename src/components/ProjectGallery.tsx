import { Plus, FolderOpen, Trash2, X, Calendar } from 'lucide-react';

export interface GalleryProject {
  id: string;
  name: string;
  updatedAt: string;
  strokesCount: number;
}

interface ProjectGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  projects: GalleryProject[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onCreateNewProject: () => void;
}

export default function ProjectGallery({
  isOpen,
  onClose,
  projects,
  activeProjectId,
  onSelectProject,
  onDeleteProject,
  onCreateNewProject
}: ProjectGalleryProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-fade-in flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <FolderOpen className="text-sky-500" size={18} />
            <h2 className="text-base font-bold text-slate-800">My Artwork Gallery</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Action Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
          <span className="text-xs text-slate-500 font-medium">{projects.length} Saved Projects</span>
          <button
            onClick={() => {
              onCreateNewProject();
              onClose();
            }}
            className="flex items-center space-x-1 bg-sky-500 hover:bg-sky-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer"
          >
            <Plus size={14} />
            <span>Create New Canvas</span>
          </button>
        </div>

        {/* Project List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {projects.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-12 h-12 bg-sky-50 text-sky-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Plus size={24} />
              </div>
              <p className="text-slate-700 text-sm font-semibold">No sketch files found</p>
              <p className="text-slate-400 text-xs mt-1">Create your first minimalist project to start sketching!</p>
            </div>
          ) : (
            projects.map((project) => {
              const isActive = project.id === activeProjectId;
              return (
                <div 
                  key={project.id}
                  onClick={() => {
                    onSelectProject(project.id);
                    onClose();
                  }}
                  className={`flex items-center space-x-4 p-4.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? 'bg-sky-50/70 border-sky-200 shadow-sm' 
                      : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50/30'
                  }`}
                >
                  {/* Thumbnail Placeholder */}
                  <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 border ${
                    isActive ? 'bg-white border-sky-300' : 'bg-slate-50 border-slate-100'
                  }`}>
                    <div 
                      className={`w-4 h-4 rounded-full ${isActive ? 'bg-sky-500 animate-pulse' : 'bg-slate-300'}`} 
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-800 truncate mb-1 leading-none">
                      {project.name}
                    </h4>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar size={10} /> {new Date(project.updatedAt).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span>{project.strokesCount} strokes</span>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
                        onDeleteProject(project.id);
                      }
                    }}
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                    title="Delete Project"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
