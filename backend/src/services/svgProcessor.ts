import { parseStringPromise } from 'xml2js';
import { IRectangle } from '../models/Design';
import fs from 'fs/promises';

export interface ProcessedSVG {
  svgWidth: number;
  svgHeight: number;
  items: IRectangle[];
  itemsCount: number;
  coverageRatio: number;
  issues: string[];
}

export async function processSVG(filePath: string): Promise<ProcessedSVG> {
  try {
    // Read the SVG file
    const fileContent = await fs.readFile(filePath, 'utf-8');
    console.log('File content:', fileContent.substring(0, 100) + '...');
    
    // Parse with simplest options
    const result = await parseStringPromise(fileContent);
    console.log('Result keys:', Object.keys(result));
    
    // Get SVG element - it should be the root
    const svg = result.svg;
    
    if (!svg) {
      console.error('Full result:', JSON.stringify(result).substring(0, 200));
      throw new Error('No svg root element found');
    }

    // Get attributes - they're in svg.$
    const attrs = svg.$ || {};
    const svgWidth = parseFloat(attrs.width) || 800;
    const svgHeight = parseFloat(attrs.height) || 600;
    
    console.log(`SVG size: ${svgWidth}x${svgHeight}`);

    // Get rectangles - they might be in svg.rect as array
    const rects = svg.rect || [];
    const rectArray = Array.isArray(rects) ? rects : [rects];
    
    console.log(`Found ${rectArray.length} rectangles`);

    const items: IRectangle[] = [];
    const issues: string[] = [];
    let totalArea = 0;

    for (const rect of rectArray) {
      if (!rect.$) continue;
      
      const r = rect.$;
      const x = parseFloat(r.x) || 0;
      const y = parseFloat(r.y) || 0;
      const width = parseFloat(r.width) || 0;
      const height = parseFloat(r.height) || 0;
      const fill = r.fill || '#000000';

      if (width > 0 && height > 0) {
        const rectangle: IRectangle = { x, y, width, height, fill };
        
        if (x + width > svgWidth || y + height > svgHeight) {
          rectangle.issue = 'OUT_OF_BOUNDS';
          if (!issues.includes('OUT_OF_BOUNDS')) {
            issues.push('OUT_OF_BOUNDS');
          }
        }

        items.push(rectangle);
        totalArea += width * height;
        console.log(`Rect: ${x},${y} ${width}x${height} ${fill}`);
      }
    }

    if (items.length === 0) {
      issues.push('EMPTY');
    }

    const coverageRatio = (svgWidth * svgHeight) > 0 ? totalArea / (svgWidth * svgHeight) : 0;

    return {
      svgWidth,
      svgHeight,
      items,
      itemsCount: items.length,
      coverageRatio,
      issues
    };
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to process SVG');
  }
}