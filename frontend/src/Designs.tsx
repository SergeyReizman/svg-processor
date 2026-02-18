import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface Design {
  _id: string;
  originalName: string;
  status: string;
  itemsCount: number;
  issues: string[];
  createdAt: string;
}

const Designs: React.FC = () => {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDesigns();
  }, []);

  const fetchDesigns = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/designs');
      setDesigns(res.data);
    } catch (error) {
      console.error('Failed to fetch designs');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string, issues: string[]) => {
    if (status === 'error') return 'bg-red-100 text-red-800';
    if (status === 'pending') return 'bg-yellow-100 text-yellow-800';
    if (issues.includes('OUT_OF_BOUNDS')) return 'bg-orange-100 text-orange-800';
    if (issues.includes('EMPTY')) return 'bg-gray-100 text-gray-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (status: string, issues: string[]) => {
    if (status === 'error') return 'Error';
    if (status === 'pending') return 'Processing';
    if (issues.includes('OUT_OF_BOUNDS')) return 'Out of Bounds';
    if (issues.includes('EMPTY')) return 'Empty';
    return 'Valid';
  };

  if (loading) return <div className="text-center">Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Designs</h1>
      
      {designs.length === 0 ? (
        <p className="text-gray-500">No designs yet</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">Filename</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Rectangles</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {designs.map(design => (
                <tr key={design._id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4">{design.originalName}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(design.status, design.issues)}`}>
                      {getStatusText(design.status, design.issues)}
                    </span>
                  </td>
                  <td className="px-6 py-4">{design.itemsCount}</td>
                  <td className="px-6 py-4">
                    <Link 
                      to={`/designs/${design._id}`}
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

export default Designs;