export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  id: string;
  points: Point[];
  color: string;
  size: number;
  opacity: number;
  tool: 'pen' | 'brush' | 'highlighter' | 'eraser' | 'shape';
  shapeType?: 'rectangle' | 'circle' | 'line' | 'arrow' | 'star';
  layerId: string;
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
}

export type ToolType = 'select' | 'pen' | 'brush' | 'highlighter' | 'eraser' | 'shape';
export type ShapeType = 'rectangle' | 'circle' | 'line' | 'arrow' | 'star';

export interface CanvasConfig {
  tool: ToolType;
  shapeType: ShapeType;
  brushSize: number;
  brushOpacity: number;
  brushColor: string;
  activeLayerId: string;
  showGrid: boolean;
  zoom: number;
}
