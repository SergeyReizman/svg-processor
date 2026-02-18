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
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const result = await parseStringPromise(fileContent, {
      explicitArray: true,
      mergeAttrs: true
    });

    const svg = result.svg;
    const svgWidth = parseFloat(svg.$.width);
    const svgHeight = parseFloat(svg.$.height);
    const canvasArea = svgWidth * svgHeight;

    const items: IRectangle[] = [];
    const issues: string[] = [];
    let totalRectArea = 0;

    if (!svg.rect || svg.rect.length === 0) {
      issues.push('EMPTY');
    } else {
      for (const rect of svg.rect) {
        const x = parseFloat(rect.$.x || '0');
        const y = parseFloat(rect.$.y || '0');
        const width = parseFloat(rect.$.width || '0');
        const height = parseFloat(rect.$.height || '0');
        const fill = rect.$.fill || '#000000';

        const rectangle: IRectangle = { x, y, width, height, fill };
        
        if (x + width > svgWidth || y + height > svgHeight) {
          rectangle.issue = 'OUT_OF_BOUNDS';
          if (!issues.includes('OUT_OF_BOUNDS')) {
            issues.push('OUT_OF_BOUNDS');
          }
        }

        items.push(rectangle);
        totalRectArea += width * height;
      }
    }

    const itemsCount = items.length;
    const coverageRatio = canvasArea > 0 ? totalRectArea / canvasArea : 0;

    return {
      svgWidth,
      svgHeight,
      items,
      itemsCount,
      coverageRatio,
      issues
    };
  } catch (error) {
    console.error('Error processing SVG:', error);
    throw new Error('Failed to process SVG file');
  }
}