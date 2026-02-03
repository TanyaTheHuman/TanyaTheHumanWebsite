"use client";

import type { CellType } from "@/lib/crossword-data";

/* =============================================================================
   GRAIN TEXTURE SETTINGS
   =============================================================================
   Adjust these values to change the newspaper-grain effect on letter cells.
   
   To test changes visually, the preview block with sliders is still available
   in CrosswordSection.tsx - remove it when done experimenting.
   ============================================================================= */

// GRAIN CONFIGURATION - adjust these values:
const GRAIN_CONFIG = {
  particleCount: 60,        // Number of grain particles per cell (higher = denser)
  minSize: 0.15,            // Minimum particle base size in pixels
  maxSize: 0.5,             // Maximum particle base size in pixels
  whiteRatio: 0.3,          // Ratio of white vs dark particles (0-1)
  opacity: {
    whiteMin: 0.05,         // White particle min opacity
    whiteMax: 0.45,         // White particle max opacity  
    darkMin: 0.1,           // Dark particle min opacity
    darkMax: 0.6,           // Dark particle max opacity
  },
  holeChance: 0.2,          // Chance a particle has a hole (0-1)
  colors: {
    dark: "#57534e",        // stone-600
    light: "#ffffff",       // white
  },
};

// Seeded pseudo-random function - round to avoid hydration mismatch between server/client
function hash(n: number, seed: number): number {
  const x = Math.sin(n * seed) * 10000;
  const result = x - Math.floor(x);
  // Round to 8 decimal places to ensure consistent results between server and client
  return Math.round(result * 100000000) / 100000000;
}

// Generate irregular blob path with sharp edges
function generateBlobPath(cx: number, cy: number, baseSize: number, uniqueId: number): string {
  const points = 5 + Math.floor(hash(uniqueId, 9.1) * 4); // 5-8 vertices
  const vertices: string[] = [];
  
  for (let j = 0; j < points; j++) {
    const angle = (j / points) * Math.PI * 2;
    // Random radius variation for each vertex
    const radiusVariation = 0.4 + hash(uniqueId * 100 + j, 3.3) * 1.2;
    const r = baseSize * radiusVariation;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    vertices.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  
  return `M${vertices.join('L')}Z`;
}

// Generate hole path inside blob
function generateHolePath(cx: number, cy: number, blobSize: number, uniqueId: number): string | null {
  // Check against configured hole chance
  if (hash(uniqueId, 11.7) > GRAIN_CONFIG.holeChance) return null;
  
  const holeSize = blobSize * (0.2 + hash(uniqueId, 12.3) * 0.3);
  const offsetX = (hash(uniqueId, 13.1) - 0.5) * blobSize * 0.5;
  const offsetY = (hash(uniqueId, 14.7) - 0.5) * blobSize * 0.5;
  const holeCx = cx + offsetX;
  const holeCy = cy + offsetY;
  
  const points = 3 + Math.floor(hash(uniqueId, 15.9) * 3); // 3-5 vertices for hole
  const vertices: string[] = [];
  
  for (let j = 0; j < points; j++) {
    const angle = (j / points) * Math.PI * 2;
    const r = holeSize * (0.6 + hash(uniqueId * 100 + j + 50, 4.4) * 0.8);
    const x = holeCx + Math.cos(angle) * r;
    const y = holeCy + Math.sin(angle) * r;
    vertices.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  
  return `M${vertices.join('L')}Z`;
}

// Generate grain particles for a cell (scaled for cell size)
function generateGrainParticles(cellId: number, cellSize: number) {
  const { particleCount, minSize, maxSize, whiteRatio, opacity, holeChance, colors } = GRAIN_CONFIG;
  const size = cellSize;
  const particles = [];
  
  for (let i = 0; i < particleCount; i++) {
    const uniqueId = cellId * 1000 + i;
    
    // Random position across the cell
    const px = hash(uniqueId, 1.1) * size;
    const py = hash(uniqueId, 2.3) * size;
    const isWhite = hash(uniqueId, 3.7) < whiteRatio;
    
    // Random size within configured range
    const baseSize = minSize + hash(uniqueId, 4.9) * (maxSize - minSize);
    
    // Generate blob path
    const blobPath = generateBlobPath(px, py, baseSize, uniqueId);
    const holePath = generateHolePath(px, py, baseSize, uniqueId);
    
    // Combine paths (hole cuts out from blob using fill-rule)
    const fullPath = holePath ? `${blobPath} ${holePath}` : blobPath;
    
    // Opacity with wide variation - round to 4 decimal places to avoid hydration mismatch
    const particleOpacity = isWhite 
      ? opacity.whiteMin + hash(uniqueId, 7.1) * (opacity.whiteMax - opacity.whiteMin)
      : opacity.darkMin + hash(uniqueId, 8.9) * (opacity.darkMax - opacity.darkMin);
    
    particles.push({
      key: i,
      path: fullPath,
      fill: isWhite ? colors.light : colors.dark,
      opacity: Math.round(particleOpacity * 10000) / 10000,
      hasHole: !!holePath,
    });
  }
  
  return particles;
}

interface CrosswordCellProps {
  row: number;
  col: number;
  cellType: CellType;
  letter?: string;
  userInput?: string;
  number?: number;
  isSelected: boolean;
  isInActiveWord: boolean;
  showAnswers: boolean;
  onSelect: (row: number, col: number) => void;
}

export function CrosswordCell({
  row,
  col,
  cellType,
  letter,
  userInput,
  number,
  isSelected,
  isInActiveWord,
  showAnswers,
  onSelect,
}: CrosswordCellProps) {
  if (cellType === "black") {
    return (
      <div
        className="shrink-0 crossword-cell crossword-cell-black"
        style={{ 
          backgroundColor: "#1a1a1a",
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 2px,
            rgba(87,83,78,0.15) 2px,
            rgba(87,83,78,0.15) 3px
          )`
        }}
        aria-hidden
      />
    );
  }

  const bgClass = isSelected
    ? "bg-mustard-300"
    : isInActiveWord
      ? "bg-mustard-100"
      : "bg-cream";

  // Generate unique grain for this cell based on position
  // Default to 31px for SSR, will be adjusted via CSS media query
  const cellId = row * 100 + col;
  const grainParticles = generateGrainParticles(cellId, 31);

  return (
    <button
      type="button"
      onClick={() => onSelect(row, col)}
      className={`shrink-0 cursor-pointer relative font-serif font-medium uppercase crossword-cell ${bgClass} focus:outline-none overflow-hidden`}
      tabIndex={-1}
      aria-label={`Cell ${row + 1}, ${col + 1}${number ? `, clue ${number}` : ""}${letter ? `, ${letter}` : ""}`}
    >
      {/* Grain overlay */}
      <svg 
        className="absolute inset-0 pointer-events-none crossword-cell-svg"
        aria-hidden
      >
        {grainParticles.map((p) => (
          <path
            key={p.key}
            d={p.path}
            fill={p.fill}
            opacity={p.opacity}
            fillRule={p.hasHole ? "evenodd" : "nonzero"}
          />
        ))}
      </svg>
      
      {number && (
        <span
          className="absolute font-serif text-stone-600 crossword-cell-number"
          style={{ top: 1, left: 1, fontSize: 10, fontWeight: 600, lineHeight: 1, zIndex: 1 }}
        >
          {number}
        </span>
      )}
      <span 
        className="crossword-cell-letter"
        style={{ 
          fontSize: 14, 
          lineHeight: "18px", 
          position: "relative", 
          zIndex: 1,
          fontWeight: 600
        }}
      >
        {showAnswers ? letter : userInput ?? ""}
      </span>
    </button>
  );
}
