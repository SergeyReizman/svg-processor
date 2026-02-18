import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Upload: React.FC = () => {
  const navigate = useNavigate();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('svg', file);

    toast.loading('Uploading...', { id: 'upload' });

    try {
      const res = await axios.post('http://localhost:5000/api/designs/upload', formData);
      toast.success('Upload successful!', { id: 'upload' });
      navigate('/designs');
    } catch (error) {
      toast.error('Upload failed!', { id: 'upload' });
    }
  }, [navigate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/svg+xml': ['.svg']
    },
    maxFiles: 1
  });

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Upload SVG</h1>
      
      <div
        {...getRootProps()}
        className={`border-4 border-dashed rounded-lg p-12 text-center cursor-pointer
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
      >
        <input {...getInputProps()} />
        <p className="text-xl text-gray-600">
          {isDragActive 
            ? 'Drop the file here' 
            : 'Drag & drop an SVG file, or click to select'}
        </p>
      </div>

      <div className="mt-4">
        <h2 className="font-bold mb-2">Example SVG:</h2>
        <pre className="bg-gray-800 text-white p-4 rounded text-sm">
{`<svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect x="50" y="50" width="200" height="200" fill="red" />
  <rect x="300" y="100" width="200" height="200" fill="blue" />
</svg>`}
        </pre>
      </div>
    </div>
  );
};

export default Upload;