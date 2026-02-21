// Import React and useCallback hook
// useCallback is used to memoize the onDrop function to prevent unnecessary re-renders
import React, { useCallback } from 'react';

// React Dropzone handles drag & drop file uploads easily
import { useDropzone } from 'react-dropzone';

// Axios for HTTP requests
import axios from 'axios';

// Toast notifications for user feedback
import toast from 'react-hot-toast';

// Navigation hook from React Router
import { useNavigate } from 'react-router-dom';


/**
 * Upload Component
 *
 * Provides:
 *  - Drag & drop SVG upload
 *  - File selection via click
 *  - Upload progress feedback
 *  - Navigation after success
 */
const Upload: React.FC = () => {

  // React Router navigation function
  const navigate = useNavigate();


  /**
   * Called when user drops or selects a file
   *
   * useCallback ensures stable function reference
   * (important because react-dropzone depends on it)
   */
  const onDrop = useCallback(async (acceptedFiles: File[]) => {

    // Only allow a single file
    const file = acceptedFiles[0];
    if (!file) return;

    /**
     * Create FormData for multipart upload
     * Backend expects field name "svg"
     */
    const formData = new FormData();
    formData.append('svg', file);

    // Show loading toast (with ID so we can update it later)
    toast.loading('Uploading...', { id: 'upload' });

    try {

      /**
       * Send file to backend API
       */
      const res = await axios.post(
        'https://svg-processor-peach.vercel.app/api/designs/upload',
        formData
      );

      // Success notification
      toast.success('Upload successful!', { id: 'upload' });

      /**
       * Redirect user to designs list page
       */
      navigate('/designs');

    } catch (error) {

      // Error notification
      toast.error('Upload failed!', { id: 'upload' });
    }

  }, [navigate]);


  /**
   * Configure Dropzone behavior
   *
   * accept → only SVG files allowed
   * maxFiles → limit to 1 file
   */
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,

    accept: {
      'image/svg+xml': ['.svg']
    },

    maxFiles: 1
  });


  /**
   * Component UI
   */
  return (
    <div className="max-w-xl mx-auto">

      {/* Page title */}
      <h1 className="text-3xl font-bold mb-8">
        Upload SVG
      </h1>


      {/* Dropzone container */}
      <div
        {...getRootProps()}

        className={`
          border-4 border-dashed
          rounded-lg
          p-12
          text-center
          cursor-pointer
          ${isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300'
          }
        `}
      >

        {/* Hidden file input handled by Dropzone */}
        <input {...getInputProps()} />

        {/* Dynamic instruction text */}
        <p className="text-xl text-gray-600">
          {isDragActive
            ? 'Drop the file here'
            : 'Drag & drop an SVG file, or click to select'}
        </p>
      </div>


      {/* Example SVG Section */}
      <div className="mt-4">

        <h2 className="font-bold mb-2">
          Example SVG:
        </h2>

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