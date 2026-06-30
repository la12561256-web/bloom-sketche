/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ToolType, BrushPreset } from '../types';

export const BRUSH_PRESETS: BrushPreset[] = [
  {
    id: 'pencil-thin',
    name: 'Fine Pencil',
    type: 'pencil',
    size: 2,
    opacity: 0.9,
    hardness: 0.95,
    smoothing: 0.4,
    icon: 'Edit2',
  },
  {
    id: 'pencil-sketch',
    name: 'Sketch Pencil',
    type: 'pencil',
    size: 5,
    opacity: 0.75,
    hardness: 0.7,
    smoothing: 0.3,
    icon: 'PenTool',
  },
  {
    id: 'brush-round',
    name: 'Round Brush',
    type: 'brush',
    size: 15,
    opacity: 1.0,
    hardness: 0.5,
    smoothing: 0.65,
    icon: 'Paintbrush',
  },
  {
    id: 'marker-flat',
    name: 'Flat Marker',
    type: 'marker',
    size: 25,
    opacity: 0.6,
    hardness: 0.9,
    smoothing: 0.5,
    icon: 'Highlighter',
  },
  {
    id: 'airbrush-soft',
    name: 'Soft Airbrush',
    type: 'airbrush',
    size: 50,
    opacity: 0.2,
    hardness: 0.05,
    smoothing: 0.8,
    icon: 'Cloud',
  },
  {
    id: 'eraser-hard',
    name: 'Hard Eraser',
    type: 'eraser',
    size: 20,
    opacity: 1.0,
    hardness: 1.0,
    smoothing: 0.2,
    icon: 'Eraser',
  },
  {
    id: 'eraser-kneaded',
    name: 'Soft Eraser',
    type: 'eraser',
    size: 35,
    opacity: 0.5,
    hardness: 0.2,
    smoothing: 0.4,
    icon: 'Eraser',
  },
];

export function setupContextForBrush(
  ctx: CanvasRenderingContext2D,
  settings: {
    type: ToolType;
    size: number;
    opacity: number;
    hardness: number;
    color: string;
  }
) {
  const { type, size, opacity, color } = settings;
  
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalAlpha = opacity;

  if (type === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = 'rgba(0,0,0,1)';
    ctx.fillStyle = 'rgba(0,0,0,1)';
  } else {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
  }

  ctx.lineWidth = size;
}

export function drawBrushStrokePoint(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  settings: {
    type: ToolType;
    size: number;
    opacity: number;
    hardness: number;
    color: string;
  },
  pressure: number = 1.0
) {
  const { type, size, hardness, color } = settings;
  const actualSize = size * (0.3 + pressure * 0.7);

  ctx.lineWidth = actualSize;

  if (type === 'airbrush') {
    // Airbrush creates soft splatters of dots or radial gradients
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const steps = Math.max(1, Math.floor(dist / (actualSize / 8)));
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const cx = x1 + (x2 - x1) * t;
      const cy = y1 + (y2 - y1) * t;
      
      // Draw radial soft dot
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, actualSize / 2);
      if (settings.type === 'eraser') {
        grad.addColorStop(0, `rgba(0,0,0,${hardness})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
      } else {
        // Parse hex/rgb into rgb to inject variable alpha for hardness
        const rgb = hexToRgb(color);
        grad.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},${hardness})`);
        grad.addColorStop(1, `rgba(${rgb.r},${rgb.g},${rgb.b},0)`);
      }
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, actualSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'marker') {
    // Marker has rigid edges and overlaps
    ctx.lineCap = 'square';
    ctx.lineJoin = 'miter';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  } else {
    // Pencil and round brushes
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}

// Convert HEX color to RGB object
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(char => char + char).join('');
  }
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  return { r, g, b };
}
