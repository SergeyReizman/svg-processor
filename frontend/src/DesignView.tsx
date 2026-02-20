// frontend/src/DesignView.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  issue?: string;
}

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

const DesignView: React.FC = () => {
  const { id } = useParams();
  const [design, setDesign] = useState<Design | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredRect, setHoveredRect] = useState<Rectangle | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetchDesign();
  }, [id]);

  useEffect(() => {
    if (design && canvasRef.current) {
      drawCanvas();
    }
  }, [design, hoveredRect]);

  const fetchDesign = async () => {
    try {
      const res = await axios.get(`https://svg-processor-peach.vercel.app/api/designs/${id}`);
      setDesign(res.data);
    } catch (error) {
      console.error('Failed to fetch design');
    } finally {
      setLoading(false);
    }
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !design) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas size
    canvas.width = 600;
    canvas.height = 300;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate scale to fit
    const padding = 20;
    const scale = Math.min(
      (canvas.width - padding * 2) / design.svgWidth,
      (canvas.height - padding * 2) / design.svgHeight
    );

    const offsetX = (canvas.width - design.svgWidth * scale) / 2;
    const offsetY = (canvas.height - design.svgHeight * scale) / 2;

    // Draw each rectangle
    design.items.forEach((rect, index) => {
      const x = offsetX + rect.x * scale;
      const y = offsetY + rect.y * scale;
      const w = rect.width * scale;
      const h = rect.height * scale;

      // Fill
      ctx.fillStyle = rect.fill;
      ctx.fillRect(x, y, w, h);

      // Border
      if (rect.issue === 'OUT_OF_BOUNDS') {
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 3;
      } else {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
      }
      ctx.strokeRect(x, y, w, h);

      // Highlight if hovered
      if (hoveredRect === rect) {
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, w, h);
      }
    });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!design || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate same scale as drawing
    const padding = 20;
    const scale = Math.min(
      (canvas.width - padding * 2) / design.svgWidth,
      (canvas.height - padding * 2) / design.svgHeight
    );
    const offsetX = (canvas.width - design.svgWidth * scale) / 2;
    const offsetY = (canvas.height - design.svgHeight * scale) / 2;

    // Find hovered rectangle
    let found = null;
    for (const rect of design.items) {
      const x = offsetX + rect.x * scale;
      const y = offsetY + rect.y * scale;
      const w = rect.width * scale;
      const h = rect.height * scale;

      if (mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h) {
        found = rect;
        break;
      }
    }

    setHoveredRect(found);
  };

  if (loading) return <div className="text-center">Loading...</div>;
  if (!design) return <div className="text-center">Design not found</div>;

  return (
    <div>
      <Link to="/designs" className="text-blue-500 hover:text-blue-700 mb-4 block">
        ← Back
      </Link>

      <h1 className="text-3xl font-bold mb-4">{design.originalName}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Canvas */}
        <div className="md:col-span-2">
          <canvas
            ref={canvasRef}
            className="border border-gray-300 rounded-lg shadow-lg w-full"
            onMouseMove={handleCanvasMouseMove}
            onMouseLeave={() => setHoveredRect(null)}
          />
        </div>

        {/* Info */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-bold text-lg mb-4">Details</h2>

          <div className="space-y-2">
            <p><span className="text-gray-600">Dimensions:</span> {design.svgWidth} × {design.svgHeight}</p>
            <p><span className="text-gray-600">Rectangles:</span> {design.itemsCount}</p>
            <p><span className="text-gray-600">Coverage:</span> {(design.coverageRatio * 100).toFixed(1)}%</p>

            {design.issues.length > 0 && (
              <div>
                <p className="text-gray-600">Issues:</p>
                <ul className="list-disc list-inside">
                  {design.issues.map((issue, i) => (
                    <li key={i} className="text-red-600">{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            {hoveredRect && (
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <p className="font-bold mb-2">Hovered Rectangle</p>
                <p>Position: ({hoveredRect.x}, {hoveredRect.y})</p>
                <p>Size: {hoveredRect.width} × {hoveredRect.height}</p>
                <p>Color: <span style={{ color: hoveredRect.fill }}>{hoveredRect.fill}</span></p>
                {hoveredRect.issue === 'OUT_OF_BOUNDS' && (
                  <p className="text-red-600 font-bold">⚠ Out of bounds!</p>
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