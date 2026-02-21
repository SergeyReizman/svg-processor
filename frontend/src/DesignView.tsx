// frontend/src/DesignView.tsx

// React core + hooks
// useEffect → lifecycle side effects
// useState → component state
// useRef → reference to canvas DOM element
import React, { useEffect, useState, useRef } from 'react';

// Router utilities
// useParams → read dynamic URL parameter (design id)
// Link → navigation component
import { useParams, Link } from 'react-router-dom';

// Axios for HTTP requests
import axios from 'axios';

/**
 * Rectangle interface
 * Represents one rectangle extracted from SVG.
 */
interface Rectangle {
  x: number;       // X position inside SVG coordinate system
  y: number;       // Y position inside SVG coordinate system
  width: number;   // Rectangle width
  height: number;  // Rectangle height
  fill: string;    // Fill color
  issue?: string;  // Optional issue (e.g. OUT_OF_BOUNDS)
}

/**
 * Design interface
 * Represents full design data returned from backend.
 */
interface Design {
  _id: string;
  originalName: string;
  status: string;
  svgWidth: number;
  svgHeight: number;
  items: Rectangle[];
  itemsCount: number;
  coverageRatio: number;
  issues: string[];
  createdAt: string;
}

/**
 * DesignView Component
 * Displays:
 *  - Canvas visualization of rectangles
 *  - Design metadata
 *  - Hover interaction details
 */
const DesignView: React.FC = () => {

  // Read design ID from route: /designs/:id
  const { id } = useParams();

  // Design state (null until loaded)
  const [design, setDesign] = useState<Design | null>(null);

  // Loading state
  const [loading, setLoading] = useState(true);

  // Currently hovered rectangle (for highlight + info panel)
  const [hoveredRect, setHoveredRect] = useState<Rectangle | null>(null);

  // Canvas DOM reference
  const canvasRef = useRef<HTMLCanvasElement>(null);


  /**
   * Fetch design when component mounts or ID changes
   */
  useEffect(() => {
    fetchDesign();
  }, [id]);


  /**
   * Redraw canvas whenever:
   *  - design loads
   *  - hovered rectangle changes
   */
  useEffect(() => {
    if (design && canvasRef.current) {
      drawCanvas();
    }
  }, [design, hoveredRect]);


  /**
   * Fetch design data from backend API
   */
  const fetchDesign = async () => {
    try {
      const res = await axios.get(
        `https://svg-processor-peach.vercel.app/api/designs/${id}`
      );

      setDesign(res.data);
    } catch (error) {
      console.error('Failed to fetch design');
    } finally {
      setLoading(false);
    }
  };


  /**
   * Draw canvas visualization
   *
   * Responsibilities:
   *  - Set canvas size
   *  - Scale SVG content to fit
   *  - Draw rectangles
   *  - Highlight hovered rectangle
   *  - Mark issues visually
   */
  const drawCanvas = () => {

    const canvas = canvasRef.current;
    if (!canvas || !design) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fixed canvas resolution
    canvas.width = 600;
    canvas.height = 300;

    // Clear previous frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background color
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    /**
     * Calculate scale so SVG fits inside canvas with padding
     */
    const padding = 20;

    const scale = Math.min(
      (canvas.width - padding * 2) / design.svgWidth,
      (canvas.height - padding * 2) / design.svgHeight
    );

    /**
     * Center drawing inside canvas
     */
    const offsetX = (canvas.width - design.svgWidth * scale) / 2;
    const offsetY = (canvas.height - design.svgHeight * scale) / 2;


    /**
     * Draw each rectangle
     */
    design.items.forEach((rect) => {

      // Convert SVG coordinates → canvas coordinates
      const x = offsetX + rect.x * scale;
      const y = offsetY + rect.y * scale;
      const w = rect.width * scale;
      const h = rect.height * scale;

      // Fill rectangle
      ctx.fillStyle = rect.fill;
      ctx.fillRect(x, y, w, h);

      /**
       * Border style depends on issue
       */
      if (rect.issue === 'OUT_OF_BOUNDS') {
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 3;
      } else {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
      }

      ctx.strokeRect(x, y, w, h);

      /**
       * Highlight rectangle if hovered
       */
      if (hoveredRect === rect) {
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, w, h);
      }
    });
  };


  /**
   * Handle mouse movement over canvas
   *
   * Detects which rectangle (if any) the cursor is inside.
   */
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {

    if (!design || !canvasRef.current) return;

    const canvas = canvasRef.current;

    // Mouse position relative to canvas
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    /**
     * Recalculate same scale & offsets used during drawing
     * (Important for accurate hit detection)
     */
    const padding = 20;

    const scale = Math.min(
      (canvas.width - padding * 2) / design.svgWidth,
      (canvas.height - padding * 2) / design.svgHeight
    );

    const offsetX = (canvas.width - design.svgWidth * scale) / 2;
    const offsetY = (canvas.height - design.svgHeight * scale) / 2;


    /**
     * Find rectangle under cursor
     */
    let found: Rectangle | null = null;

    for (const rect of design.items) {

      const x = offsetX + rect.x * scale;
      const y = offsetY + rect.y * scale;
      const w = rect.width * scale;
      const h = rect.height * scale;

      if (
        mouseX >= x &&
        mouseX <= x + w &&
        mouseY >= y &&
        mouseY <= y + h
      ) {
        found = rect;
        break;
      }
    }

    setHoveredRect(found);
  };


  /**
   * Loading states
   */
  if (loading) return <div className="text-center">Loading...</div>;
  if (!design) return <div className="text-center">Design not found</div>;


  /**
   * Main UI
   */
  return (
    <div>

      {/* Back navigation */}
      <Link
        to="/designs"
        className="text-blue-500 hover:text-blue-700 mb-4 block"
      >
        ← Back
      </Link>

      {/* Title */}
      <h1 className="text-3xl font-bold mb-4">
        {design.originalName}
      </h1>


      {/* Layout grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Canvas Section */}
        <div className="md:col-span-2">
          <canvas
            ref={canvasRef}
            className="border border-gray-300 rounded-lg shadow-lg w-full"

            // Mouse hover detection
            onMouseMove={handleCanvasMouseMove}

            // Clear hover when leaving canvas
            onMouseLeave={() => setHoveredRect(null)}
          />
        </div>


        {/* Info Panel */}
        <div className="bg-white p-4 rounded-lg shadow">

          <h2 className="font-bold text-lg mb-4">
            Details
          </h2>

          <div className="space-y-2">

            <p>
              <span className="text-gray-600">Dimensions:</span>
              {' '}
              {design.svgWidth} × {design.svgHeight}
            </p>

            <p>
              <span className="text-gray-600">Rectangles:</span>
              {' '}
              {design.itemsCount}
            </p>

            <p>
              <span className="text-gray-600">Coverage:</span>
              {' '}
              {(design.coverageRatio * 100).toFixed(1)}%
            </p>


            {/* Global issues list */}
            {design.issues.length > 0 && (
              <div>
                <p className="text-gray-600">Issues:</p>
                <ul className="list-disc list-inside">
                  {design.issues.map((issue, i) => (
                    <li key={i} className="text-red-600">
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}


            {/* Hovered rectangle details */}
            {hoveredRect && (
              <div className="mt-4 p-3 bg-gray-50 rounded">

                <p className="font-bold mb-2">
                  Hovered Rectangle
                </p>

                <p>
                  Position: ({hoveredRect.x}, {hoveredRect.y})
                </p>

                <p>
                  Size: {hoveredRect.width} × {hoveredRect.height}
                </p>

                <p>
                  Color:
                  {' '}
                  <span style={{ color: hoveredRect.fill }}>
                    {hoveredRect.fill}
                  </span>
                </p>

                {hoveredRect.issue === 'OUT_OF_BOUNDS' && (
                  <p className="text-red-600 font-bold">
                    ⚠ Out of bounds!
                  </p>
                )}

              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default DesignView;