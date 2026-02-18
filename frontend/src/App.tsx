import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Upload from './Upload';
import Designs from './Designs';
import DesignView from './DesignView';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-md p-4">
          <div className="container mx-auto flex gap-4">
            <Link to="/" className="text-blue-500 hover:text-blue-700">Upload</Link>
            <Link to="/designs" className="text-blue-500 hover:text-blue-700">Designs</Link>
          </div>
        </nav>

        <div className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<Upload />} />
            <Route path="/designs" element={<Designs />} />
            <Route path="/designs/:id" element={<DesignView />} />
          </Routes>
        </div>

        <Toaster position="top-right" />
      </div>
    </BrowserRouter>
  );
}

export default App;