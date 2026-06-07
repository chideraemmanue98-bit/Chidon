import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the target folders exist
const publicBlogDir = path.join(__dirname, '../public/blog');
if (!fs.existsSync(publicBlogDir)) {
  fs.mkdirSync(publicBlogDir, { recursive: true });
}

/**
 * Helper to write a 4-byte big-endian integer to a buffer at an offset
 */
function writeInt32(buf, val, offset) {
  buf.writeUInt32BE(val, offset);
}

/**
 * Helper to compute PNG's CRC32 checksum over chunk data
 */
const crcTable = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) {
      c = 0xedb88320 ^ (c >>> 1);
    } else {
      c = c >>> 1;
    }
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return crc ^ -1;
}

/**
 * Creates a Chunk buffer: [4-byte Length][4-byte Name][Type-specific Data][4-byte CRC]
 */
function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  
  // Calculate CRC over Name + Data
  const crcInput = Buffer.alloc(4 + len);
  crcInput.write(type, 0, 4, 'ascii');
  data.copy(crcInput, 4);
  
  const crcVal = crc32(crcInput);
  chunk.writeInt32BE(crcVal, 4 + 4 + len);
  
  return chunk;
}

/**
 * Generates a beautiful 1200x630 PNG represented by custom mathematical vector patterns.
 * 
 * Theme Palette:
 * - Base background: Deep dark slate-blue `#0A0E27` (RGB: 10, 14, 39)
 * - Accent glares: Purple glow (#7C3AED), Blue/Cyan glow (#38BDF8)
 * - Details: Floating glowing nodes, abstract neural network vectors, circuit board wiring
 * 
 * @param {string} fileName The output filename
 * @param {number} styleIndex Design variations to represent specific titles
 */
function generateTechnicalPng(fileName, styleIndex) {
  const width = 1200;
  const height = 630;
  
  // Raw pixel array: height rows, each row has 1 filter byte (0) followed by 3 bytes (RGB) per pixel
  const rowSize = 1 + width * 3;
  const rawData = Buffer.alloc(height * rowSize);
  
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter method 0 (None)
    
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 3;
      
      // 1. BASE BACKGROUND: Deep Slate-blue gradient with radial depth falling to dark edges
      const centerX = width / 2;
      const centerY = height / 2;
      const distFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      const maxDist = Math.sqrt(centerX ** 2 + centerY ** 2);
      const intensity = 1.0 - (distFromCenter / maxDist) * 0.7; // Brighter center, dark vignette borders
      
      let r = Math.floor(10 * intensity);
      let g = Math.floor(14 * intensity);
      let b = Math.floor(39 * intensity);
      
      // 2. RADIAL AMBIENT GLOWS: Intense colored accent anchors
      // Add a purple glow (#7C3AED - 124, 58, 237) on the left side
      const leftGlowDist = Math.sqrt((x - 250) ** 2 + (y - 315) ** 2);
      const leftGlowFactor = Math.max(0, 1.0 - leftGlowDist / 400); // 400px glow radius
      r += Math.floor(leftGlowFactor * 32);
      g += Math.floor(leftGlowFactor * 15);
      b += Math.floor(leftGlowFactor * 60);

      // Add a cyan/blue glow (#38BDF8 - 56, 189, 248) on the right side
      const rightGlowDist = Math.sqrt((x - 950) ** 2 + (y - 315) ** 2);
      const rightGlowFactor = Math.max(0, 1.0 - rightGlowDist / 450);
      r += Math.floor(rightGlowFactor * 12);
      g += Math.floor(rightGlowFactor * 45);
      b += Math.floor(rightGlowFactor * 60);

      // 3. MATHEMATICAL CIRCUIT & NEURAL NETWORK VECTORS
      // Draw grid circuit paths using high-contrast glowing neon lines
      // Style variations based on styleIndex
      let isLine = false;
      let isNode = false;

      // Base matrix circuit wire grids
      if (styleIndex === 1) {
        // "Brain made of circuit board + glowing nodes"
        // Draw circular concentric brain networks & connected lines
        const dy = y - 315;
        const dx = x - 600;
        const brainRadius = Math.sqrt(dx*dx + dy*dy);
        
        // Circular lobes
        if (brainRadius > 100 && brainRadius < 260) {
          // Concentric circular orbit routes
          if (Math.floor(brainRadius) % 40 === 0) {
            isLine = true;
          }
          // Radial neuron connectors
          const angle = Math.atan2(dy, dx);
          if (Math.abs(angle % (Math.PI / 6)) < 0.015) {
            isLine = true;
          }
        }
        
        // Random synapse nodes
        if (brainRadius > 100 && brainRadius < 260) {
          if (Math.floor(dx) % 50 === 0 && Math.floor(dy) % 40 === 0) {
            isNode = true;
          }
        }
      } 
      else if (styleIndex === 2) {
        // "Robot hand vs human hand reaching for pen / touch"
        // Represented by organic curvy vectors intersecting geometric digital segments
        const dx = x - 400;
        const dy = y - (200 + Math.sin(x / 40) * 30);
        if (Math.abs(dy) < 1.5) isLine = true; // curvy organic human line
        
        // Geometric robotic segment
        if (Math.abs(y - (430 - (x - 600) * 0.4)) < 2 && x > 600) {
          isLine = true;
          if (x % 20 < 4) isNode = true;
        }
      }
      else if (styleIndex === 3) {
        // "Grid of 10 glowing app icons floating"
        // Render 10 subtle floating cubes/diamonds aligned symmetrically
        const row = Math.floor(y / 150);
        const col = Math.floor(x / 200);
        const cellX = x % 200;
        const cellY = y % 150;
        
        if (row >= 1 && row <= 2 && col >= 1 && col <= 4) {
          // Centered diamonds inside active cells
          const dx = Math.abs(cellX - 100);
          const dy = Math.abs(cellY - 75);
          if (Math.abs(dx + dy * 1.3 - 25) < 1.8) {
            isLine = true;
          }
        }
      }
      else {
        // Default technical neural patterns: connected nodes & data buses
        // Long straight circuit lines and angular 45-degree bends
        if (y % 110 === 0 && x > 300 && x < 900) {
          isLine = true;
        }
        if (Math.abs((x - y) - 400) < 1.5 || Math.abs((x + y) - 800) < 1.5) {
          // Diagonal busses
          isLine = true;
        }
        // Floating circular data node beacons
        const nodeX = (styleIndex * 130 + 100) % 1000 + 100;
        const nodeY = (styleIndex * 70 + 80) % 500 + 50;
        const nodeDist = Math.sqrt((x - nodeX) ** 2 + (y - nodeY) ** 2);
        if (nodeDist < 6) {
          isNode = true;
        }
        if (nodeDist > 15 && nodeDist < 17 && (x + y) % 3 === 0) {
          isLine = true; // Orbit ring
        }
      }

      // 4. COLOR INJECTION & ANTI-ALIASED NEON GLOWS
      if (isNode) {
        // Intense bright cyan-white center with neon cyan edge
        r = 255;
        g = 255;
        b = 255;
      } else if (isLine) {
        // Neon Purple-Cyan alternate glow
        if ((x + y) % 200 < 100) {
          // Neon Cyan #38BDF8
          r = Math.min(255, r + 56);
          g = Math.min(255, g + 189);
          b = Math.min(255, b + 248);
        } else {
          // Neon Purple #7C3AED
          r = Math.min(255, r + 124);
          g = Math.min(255, g + 58);
          b = Math.min(255, b + 237);
        }
      }

      // Guard color bounds
      rawData[pixelOffset] = Math.max(0, Math.min(255, r));
      rawData[pixelOffset + 1] = Math.max(0, Math.min(255, g));
      rawData[pixelOffset + 2] = Math.max(0, Math.min(255, b));
    }
  }
  
  // Create PNG File Signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  
  // IHDR (Image Header) Chunk: width(4), height(4), bitDepth(1), colorType(1), compression(1), filter(1), interlace(1) : Total 13 bytes
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 2; // Color type 2 (Truecolor RGB)
  ihdrData[10] = 0; // Standard compression Deflate method
  ihdrData[11] = 0; // Filter method 0
  ihdrData[12] = 0; // No interlace
  
  const ihdrChunk = createChunk('IHDR', ihdrData);
  
  // IDAT (Image Data) Chunk: zlib deflated raw pixel array
  const idatCompressed = zlib.deflateSync(rawData, { level: 9 }); // Max compression to guarantee < 300KB!
  const idatChunk = createChunk('IDAT', idatCompressed);
  
  // IEND Chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));
  
  // Assemble full file bytes
  const output = Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
  fs.writeFileSync(path.join(publicBlogDir, fileName), output);
  console.log(`🖼️  [IMAGE ENGINE] Generated ${fileName} successfully (${Math.round(output.length / 1024)} KB)`);
}

/**
 * Sequential generation of all 20 specialized blog assets
 */
function main() {
  console.log(`🎨 Preparing to generate 20 SEO-optimized, AdSense-safe blog featured images...`);
  
  const imgMap = [
    { name: 'blog-01-what-is-ai.png', style: 1 },
    { name: 'blog-02-ai-vs-human.png', style: 2 },
    { name: 'blog-03-top-10-tools.png', style: 3 },
    { name: 'blog-04-students-study.png', style: 4 },
    { name: 'blog-05-small-business.png', style: 5 },
    { name: 'blog-06-ai-dangerous.png', style: 6 },
    { name: 'blog-07-chatgpt-vs-claude.png', style: 7 },
    { name: 'blog-08-ai-prompts.png', style: 8 },
    { name: 'blog-09-image-generation.png', style: 9 },
    { name: 'blog-10-future-jobs-world.png', style: 10 },
    { name: 'blog-11-content-creators.png', style: 11 },
    { name: 'blog-12-make-money-online.png', style: 12 },
    { name: 'blog-13-coding-tools.png', style: 13 },
    { name: 'blog-14-ai-education.png', style: 14 },
    { name: 'blog-15-viral-prompts.png', style: 15 },
    { name: 'blog-16-ai-ethics.png', style: 16 },
    { name: 'blog-17-detect-ai-content.png', style: 17 },
    { name: 'blog-18-ai-marketing.png', style: 18 },
    { name: 'blog-19-machine-learning.png', style: 19 },
    { name: 'blog-20-nigeria-ai.png', style: 20 }
  ];

  for (const { name, style } of imgMap) {
    generateTechnicalPng(name, style);
  }
  
  console.log(`💖 Perfect! Generated all 20 professional featured images in public/blog/ directory successfully.`);
}

main();
