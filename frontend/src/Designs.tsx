// Import React core functionality and hooks
// useEffect → for lifecycle side effects (fetching data on mount)
// useState → for managing component state
import React, { useEffect, useState } from 'react';

// Link component from react-router-dom for client-side navigation
import { Link } from 'react-router-dom';

// Axios for making HTTP requests to backend API
import axios from 'axios';

/**
 * TypeScript interface describing the structure of a Design object
 * received from the backend API.
 */
interface Design {
  _id: string;          // Unique identifier for the design (MongoDB ID)
  originalName: string; // Original filename uploaded by the user
  status: string;       // Processing status (e.g., pending, error, complete)
  itemsCount: number;   // Number of detected rectangles/items in the design
  issues: string[];     // Array of detected issues (e.g., OUT_OF_BOUNDS, EMPTY)
  createdAt: string;    // Timestamp when the design was created
}

/**
 * Designs component
 * Displays a list of uploaded designs in a table format.
 */
const Designs: React.FC = () => {

  // State for storing designs fetched from API
  const [designs, setDesigns] = useState<Design[]>([]);

  // State to track loading state while fetching data
  const [loading, setLoading] = useState(true);

  /**
   * useEffect runs once when component mounts (empty dependency array).
   * It triggers the data fetch from backend.
   */
  useEffect(() => {
    fetchDesigns();
  }, []);

  /**
   * Fetch designs from backend API.
   * Handles loading state and error logging.
   */
  const fetchDesigns = async () => {
    try {
      // Perform GET request to backend endpoint
      const res = await axios.get('https://svg-processor-peach.vercel.app/api/designs');

      // Store returned data into component state
      setDesigns(res.data);
    } catch (error) {
      // Log error if request fails
      console.error('Failed to fetch designs');
    } finally {
      // Always stop loading spinner after request completes
      setLoading(false);
    }
  };

  /**
   * Returns Tailwind CSS color classes depending on status and issues.
   * This determines the badge color shown in UI.
   */
  const getStatusColor = (status: string, issues: string[]) => {
    if (status === 'error') return 'bg-red-100 text-red-800';
    if (status === 'pending') return 'bg-yellow-100 text-yellow-800';
    if (issues.includes('OUT_OF_BOUNDS')) return 'bg-orange-100 text-orange-800';
    if (issues.includes('EMPTY')) return 'bg-gray-100 text-gray-800';

    // Default = valid design
    return 'bg-green-100 text-green-800';
  };

  /**
   * Returns human-readable text for status badge.
   * Logic mirrors getStatusColor for consistency.
   */
  const getStatusText = (status: string, issues: string[]) => {
    if (status === 'error') return 'Error';
    if (status === 'pending') return 'Processing';
    if (issues.includes('OUT_OF_BOUNDS')) return 'Out of Bounds';
    if (issues.includes('EMPTY')) return 'Empty';

    // Default = valid
    return 'Valid';
  };

  /**
   * Show loading indicator while API request is in progress.
   */
  if (loading) return <div className="text-center">Loading...</div>;

  /**
   * Main component UI
   */
  return (
    <div>
      {/* Page title */}
      <h1 className="text-3xl font-bold mb-8">Designs</h1>

      {/* Conditional rendering when there are no designs */}
      {designs.length === 0 ? (
        <p className="text-gray-500">No designs yet</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">

          {/* Designs table */}
          <table className="w-full">

            {/* Table header */}
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">Filename</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Rectangles</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>

            {/* Table body */}
            <tbody>
              {designs.map(design => (
                <tr
                  key={design._id}
                  className="border-t hover:bg-gray-50"
                >
                  {/* Filename column */}
                  <td className="px-6 py-4">
                    {design.originalName}
                  </td>

                  {/* Status badge column */}
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                        design.status,
                        design.issues
                      )}`}
                    >
                      {getStatusText(design.status, design.issues)}
                    </span>
                  </td>

                  {/* Items count column */}
                  <td className="px-6 py-4">
                    {design.itemsCount}
                  </td>

                  {/* Actions column */}
                  <td className="px-6 py-4">
                    <Link
                      to={`/designs/${design._id}`} // Navigate to design details page
                      className="text-blue-500 hover:text-blue-700"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}
    </div>
  );
};

// Export component for use in routing or other parts of app
export default Designs;