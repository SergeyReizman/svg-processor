/**
 * SVG Processing Module
 * Handles parsing and analysis of SVG files to extract rectangle elements
 * and calculate various metrics about the design.
 */

// Import XML parser for handling SVG content (SVG is a subset of XML)
import { parseStringPromise } from 'xml2js';
// Import rectangle interface for consistent data structure across the application
import { IRectangle } from '../models/Design';

/**
 * Interface representing the result of SVG processing
 * Contains all extracted data and calculated metrics from an SVG file
 */
export interface ProcessedSVG {
  svgWidth: number;        // Width of the SVG canvas in pixels/units
  svgHeight: number;       // Height of the SVG canvas in pixels/units
  items: IRectangle[];     // Array of successfully extracted rectangles
  itemsCount: number;      // Total number of rectangles found (redundant but convenient)
  coverageRatio: number;   // Ratio of canvas area covered by rectangles (0-1)
  issues: string[];        // Array of warning/error codes encountered during processing
}

/**
 * Main SVG processing function
 * Parses SVG content, extracts rectangle elements, validates them,
 * and calculates coverage metrics.
 * 
 * @param fileContent - Raw SVG file content as string
 * @returns Promise with processed SVG data and metrics
 * @throws Error if SVG parsing fails or no SVG root element found
 */
export async function processSVG(fileContent: string): Promise<ProcessedSVG> {
  try {
    // Log file size for debugging and monitoring purposes
    console.log('Processing SVG content, length:', fileContent.length);

    /**
     * Parse SVG content using xml2js library
     * The promise-based parser converts XML to a JavaScript object
     * Using simplest options for maximum compatibility
     */
    const result = await parseStringPromise(fileContent);
    console.log('Result keys:', Object.keys(result));

    /**
     * Access the root SVG element
     * In parsed XML, root element becomes the key at the top level
     * The structure is: { svg: { $: attributes, rect: [rectangles] } }
     */
    const svg = result.svg;

    // Validate that we have a proper SVG root element
    if (!svg) {
      // Log partial result for debugging if SVG root is missing
      console.error('Full result:', JSON.stringify(result).substring(0, 200));
      throw new Error('No svg root element found');
    }

    /**
     * Extract SVG attributes
     * xml2js puts attributes in a special '$' property
     * Provide fallback values if width/height are missing
     */
    const attrs = svg.$ || {};
    // Parse width/height as floats, default to common SVG dimensions if missing/invalid
    const svgWidth = parseFloat(attrs.width) || 800;
    const svgHeight = parseFloat(attrs.height) || 600;

    console.log(`SVG size: ${svgWidth}x${svgHeight}`);

    /**
     * Extract rectangle elements
     * Rectangles can be in svg.rect which might be an array or single element
     * Handle both cases by normalizing to an array
     */
    const rects = svg.rect || [];
    const rectArray = Array.isArray(rects) ? rects : [rects];

    console.log(`Found ${rectArray.length} rectangles`);

    // Initialize result containers
    const items: IRectangle[] = [];
    const issues: string[] = [];
    let totalArea = 0;  // Track total area covered by rectangles for coverage calculation

    /**
     * Process each rectangle found in the SVG
     * Extract properties, validate dimensions, and check for boundary issues
     */
    for (const rect of rectArray) {
      // Skip rectangles without attributes (malformed elements)
      if (!rect.$) continue;

      // Extract rectangle attributes with fallback values
      const r = rect.$;
      const x = parseFloat(r.x) || 0;           // X position, default to 0
      const y = parseFloat(r.y) || 0;           // Y position, default to 0
      const width = parseFloat(r.width) || 0;    // Width, default to 0
      const height = parseFloat(r.height) || 0;  // Height, default to 0
      const fill = r.fill || '#000000';          // Fill color, default to black

      /**
       * Validate rectangle has positive dimensions
       * Skip rectangles with zero or negative dimensions as they're invalid
       */
      if (width > 0 && height > 0) {
        // Create rectangle object matching the IRectangle interface
        const rectangle: IRectangle = { x, y, width, height, fill };

        /**
         * Check if rectangle extends beyond SVG canvas boundaries
         * This could indicate design issues or misalignment
         */
        if (x + width > svgWidth || y + height > svgHeight) {
          rectangle.issue = 'OUT_OF_BOUNDS';
          // Add to issues list only once to avoid duplicates
          if (!issues.includes('OUT_OF_BOUNDS')) {
            issues.push('OUT_OF_BOUNDS');
          }
        }

        // Add valid rectangle to results
        items.push(rectangle);
        // Accumulate area for coverage calculation
        totalArea += width * height;

        // Log each rectangle for debugging purposes
        console.log(`Rect: ${x},${y} ${width}x${height} ${fill}`);
      }
    }

    /**
     * Check if any valid rectangles were found
     * If not, add EMPTY issue for downstream handling
     */
    if (items.length === 0) {
      issues.push('EMPTY');
    }

    /**
     * Calculate coverage ratio
     * Total rectangle area divided by total SVG area
     * Prevent division by zero by checking SVG dimensions
     */
    const coverageRatio = (svgWidth * svgHeight) > 0 ? totalArea / (svgWidth * svgHeight) : 0;

    /**
     * Return complete processed SVG data
     * All metrics and extracted items ready for storage or further processing
     */
    return {
      svgWidth,
      svgHeight,
      items,
      itemsCount: items.length,
      coverageRatio,
      issues
    };
  } catch (error) {
    /**
     * Error handling wrapper
     * Log the error for debugging and throw a user-friendly error message
     */
    console.error('Error processing SVG:', error);
    throw new Error('Failed to process SVG');
  }
}