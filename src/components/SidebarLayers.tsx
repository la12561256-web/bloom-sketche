/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Eye, EyeOff, Lock, Unlock, Plus, Trash2, 
  ChevronUp, ChevronDown, Edit3, Check, X, ArrowDownToLine, Layers 
} from 'lucide-react';
import { Layer } from '../types';

interface SidebarLayersProps {
  layers: Layer[];
  activeLayerId: string;
  onSelectLayer: (id: string) => void;
  onAddLayer: () => void;
  onDeleteLayer: (id: string) => void;
  onToggleVisible: (id: string) => void;
  onToggleLocked: (id: string) => void;
  onLayerOpacityChange: (id: string, opacity: number) => void;
  onRenameLayer: (id: string, name: string) => void;
  onMoveLayer: (id: string, direction: 'up' | 'down') => void;
  onMergeLayerDown: (id: string) => void;
  darkMode: boolean;
}

export default function SidebarLayers({
  layers,
  activeLayerId,
  onSelectLayer,
  onAddLayer,
  onDeleteLayer,
  onToggleVisible,
  onToggleLocked,
  onLayerOpacityChange,
  onRenameLayer,
  onMoveLayer,
  onMergeLayerDown,
  darkMode,
}: SidebarLayersProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const startRename = (layer: Layer) => {
    setEditingId(layer.id);
    setEditName(layer.name);
  };

  const saveRename = (id: string) => {
    if (editName.trim()) {
      onRenameLayer(id, editName.trim());
    }
    setEditingId(null);
  };

  const cancelRename = () => {
    setEditingId(null);
  };

  // Layers are stored bottom-to-top, so the first index in array is bottom layer,
  // and the last index is top layer. We want to display them TOP-to-BOTTOM in UI.
  const displayLayers = [...layers].reverse();

  return (
    <div className={`p-4 rounded-2xl border flex flex-col gap-4 ${darkMode ? 'bg-[#18181c]/95 border-gray-800 text-gray-100' : 'bg-white/95 border-slate-200 text-slate-800'} backdrop-blur-md shadow-lg`}>
      <div className="flex items-center justify-between border-b pb-2 border-gray-800/10">
        <div className="flex items-center gap-1.5 font-bold text-sm">
          <Layers className="w-4 h-4 text-pink-500" />
          <span>Layers Stack ({layers.length})</span>
        </div>
        <button
          id="add-layer-btn"
          onClick={onAddLayer}
          className="p-1.5 rounded-lg bg-pink-500 hover:bg-pink-600 active:scale-90 text-white shadow-md shadow-pink-500/15 cursor-pointer"
          title="Add New Layer"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Layers List - Top down */}
      <div className="space-y-2 flex-1 overflow-y-auto max-h-60 pr-1">
        {displayLayers.map((layer, reverseIndex) => {
          const actualIndex = layers.length - 1 - reverseIndex;
          const isActive = layer.id === activeLayerId;
          const canDelete = layers.length > 1;
          const canMergeDown = actualIndex > 0; // Layer index 0 is bottom, so indices > 0 can merge down

          return (
            <div
              key={layer.id}
              onClick={() => onSelectLayer(layer.id)}
              className={`p-2.5 rounded-xl border flex flex-col gap-2 transition-all cursor-pointer ${isActive ? 'border-pink-500 bg-pink-500/5 ring-1 ring-pink-500/10' : `${darkMode ? 'border-gray-800/60 bg-gray-900/30 hover:bg-gray-900/50 text-gray-300' : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-700'}`}`}
            >
              <div className="flex items-center justify-between gap-2">
                {/* Layer Name / Renamer */}
                <div className="flex-1 min-w-0" onClick={e => e.stopPropagation()}>
                  {editingId === layer.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        id={`rename-layer-input-${layer.id}`}
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className={`w-full px-2 py-0.5 text-xs border rounded focus:outline-none ${darkMode ? 'bg-gray-950 border-gray-700 text-white' : 'bg-white border-slate-200'}`}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveRename(layer.id);
                          if (e.key === 'Escape') cancelRename();
                        }}
                      />
                      <button
                        id={`save-rename-layer-${layer.id}`}
                        onClick={() => saveRename(layer.id)}
                        className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 group/name">
                      <span className={`text-xs font-semibold truncate ${isActive ? 'text-pink-500 font-bold' : ''}`}>
                        {layer.name}
                      </span>
                      <button
                        id={`rename-layer-btn-${layer.id}`}
                        onClick={() => startRename(layer)}
                        className="p-0.5 opacity-0 group-hover/name:opacity-100 transition-opacity rounded hover:bg-black/5"
                        title="Rename Layer"
                      >
                        <Edit3 className="w-3 h-3 opacity-60" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Layer Controls Row (Visible, Locked, Shift, Merge, Delete) */}
                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  {/* Visibility */}
                  <button
                    id={`toggle-visible-btn-${layer.id}`}
                    onClick={() => onToggleVisible(layer.id)}
                    className={`p-1 rounded-md transition-colors ${layer.visible ? 'text-pink-500 hover:bg-pink-500/5' : 'opacity-40 hover:bg-black/5'}`}
                    title={layer.visible ? 'Hide Layer' : 'Show Layer'}
                  >
                    {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>

                  {/* Lock */}
                  <button
                    id={`toggle-lock-btn-${layer.id}`}
                    onClick={() => onToggleLocked(layer.id)}
                    className={`p-1 rounded-md transition-colors ${layer.locked ? 'text-amber-500 hover:bg-amber-500/5' : 'opacity-40 hover:bg-black/5'}`}
                    title={layer.locked ? 'Unlock Layer' : 'Lock Layer'}
                  >
                    {layer.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>

                  {/* Move Up */}
                  <button
                    id={`move-layer-up-btn-${layer.id}`}
                    onClick={() => onMoveLayer(layer.id, 'up')}
                    disabled={actualIndex === layers.length - 1}
                    className="p-1 rounded-md opacity-50 hover:opacity-100 disabled:opacity-20 hover:bg-black/5"
                    title="Move Layer Up"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>

                  {/* Move Down */}
                  <button
                    id={`move-layer-down-btn-${layer.id}`}
                    onClick={() => onMoveLayer(layer.id, 'down')}
                    disabled={actualIndex === 0}
                    className="p-1 rounded-md opacity-50 hover:opacity-100 disabled:opacity-20 hover:bg-black/5"
                    title="Move Layer Down"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Merge Down */}
                  {canMergeDown && (
                    <button
                      id={`merge-layer-down-btn-${layer.id}`}
                      onClick={() => {
                        if (confirm(`Merge "${layer.name}" into "${layers[actualIndex - 1].name}"?`)) {
                          onMergeLayerDown(layer.id);
                        }
                      }}
                      className="p-1 rounded-md opacity-60 hover:opacity-100 hover:bg-black/5 text-pink-500"
                      title="Merge Down"
                    >
                      <ArrowDownToLine className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Delete */}
                  {canDelete && (
                    <button
                      id={`delete-layer-btn-${layer.id}`}
                      onClick={() => onDeleteLayer(layer.id)}
                      className="p-1 rounded-md text-rose-500 hover:bg-rose-500/5 opacity-60 hover:opacity-100"
                      title="Delete Layer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Layer Opacity Slider (Inside Accordion) */}
              <div className="flex items-center gap-2 pt-1 border-t border-gray-500/5" onClick={e => e.stopPropagation()}>
                <span className="text-[10px] opacity-50 font-semibold uppercase">Opacity</span>
                <input
                  id={`layer-opacity-slider-${layer.id}`}
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={layer.opacity}
                  onChange={(e) => onLayerOpacityChange(layer.id, parseFloat(e.target.value))}
                  className="flex-1 accent-pink-500 h-1 bg-slate-200 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] font-mono opacity-70 w-7 text-right">
                  {Math.round(layer.opacity * 100)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
