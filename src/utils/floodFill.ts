/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

function hexToRgba(hex: string): RGBA {
  // Supports #rgb, #rgba, #rrggbb, #rrggbbaa
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(char => char + char).join('');
  }
  
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  const a = cleanHex.length >= 8 ? parseInt(cleanHex.substring(6, 8), 16) : 255;
  
  return { r, g, b, a };
}

function colorsMatch(c1: RGBA, c2: RGBA, tolerance: number): boolean {
  if (tolerance === 0) {
    return c1.r === c2.r && c1.g === c2.g && c1.b === c2.b && c1.a === c2.a;
  }
  
  return (
    Math.abs(c1.r - c2.r) <= tolerance &&
    Math.abs(c1.g - c2.g) <= tolerance &&
    Math.abs(c1.b - c2.b) <= tolerance &&
    Math.abs(c1.a - c2.a) <= tolerance
  );
}

export function performFloodFill(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  fillColorHex: string,
  tolerance: number = 30
): void {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  
  // Clean coordinates
  const x = Math.floor(startX);
  const y = Math.floor(startY);
  
  if (x < 0 || x >= width || y < 0 || y >= height) return;
  
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  const fillColor = hexToRgba(fillColorHex);
  const targetColorIndex = (y * width + x) * 4;
  const targetColor: RGBA = {
    r: data[targetColorIndex],
    g: data[targetColorIndex + 1],
    b: data[targetColorIndex + 2],
    a: data[targetColorIndex + 3],
  };
  
  // If target color is already very close to the fill color, return
  if (colorsMatch(targetColor, fillColor, 2)) return;
  
  // BFS algorithm using flat indexing for speed and lower memory usage
  const queue: number[] = [];
  const visited = new Uint8Array(width * height);
  
  queue.push(y * width + x);
  visited[y * width + x] = 1;
  
  while (queue.length > 0) {
    const idx = queue.shift()!;
    const currY = Math.floor(idx / width);
    const currX = idx % width;
    
    // Fill current pixel
    const pixelPos = idx * 4;
    data[pixelPos] = fillColor.r;
    data[pixelPos + 1] = fillColor.g;
    data[pixelPos + 2] = fillColor.b;
    data[pixelPos + 3] = fillColor.a;
    
    // Check neighbors
    const neighbors = [
      { nx: currX + 1, ny: currY },
      { nx: currX - 1, ny: currY },
      { nx: currX, ny: currY + 1 },
      { nx: currX, ny: currY - 1 },
    ];
    
    for (const { nx, ny } of neighbors) {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nIdx = ny * width + nx;
        if (visited[nIdx] === 0) {
          const nPos = nIdx * 4;
          const neighborColor: RGBA = {
            r: data[nPos],
            g: data[nPos + 1],
            b: data[nPos + 2],
            a: data[nPos + 3],
          };
          
          if (colorsMatch(targetColor, neighborColor, tolerance)) {
            queue.push(nIdx);
            visited[nIdx] = 1;
          }
        }
      }
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
}
