/**
 * Main Application Component
 * Serves as the root component for the SVG Design Processor frontend
 * Handles routing, navigation, and global UI elements
 */

// React core library for component creation and state management
import React from 'react';
/**
 * React Router DOM imports for navigation and routing
 * BrowserRouter: Wraps the app and enables HTML5 history API
 * Routes: Container for route definitions (replaces Switch in v6)
 * Route: Defines individual route paths and their components
 * Link: Client-side navigation component (prevents page refresh)
 */
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
/**
 * react-hot-toast for notification system
 * Toaster component renders toast containers
 * Provides non-intrusive feedback for user actions
 */
import { Toaster } from 'react-hot-toast';
// Page component imports for different routes
import Upload from './Upload';        // SVG upload and processing page
import Designs from './Designs';      // List of all processed designs
import DesignView from './DesignView'; // Detailed view of a single design

/**
 * Main App Component
 * Sets up the application structure including:
 * - Routing configuration
 * - Navigation bar
 * - Toast notification system
 * 
 * @returns JSX element representing the entire application
 */
function App() {
  return (
    /**
     * BrowserRouter enables client-side routing
     * Uses the HTML5 history API to keep UI in sync with URL
     * Must be the outermost routing component
     */
    <BrowserRouter>
      {/* 
        Main application container
        min-h-screen: Ensures content fills at least the full viewport height
        bg-gray-100: Light gray background for subtle contrast
      */}
      <div className="min-h-screen bg-gray-100">
        {/* 
          Navigation Bar
          Fixed/sticky navigation for consistent access to main sections
          shadow-md: Adds subtle depth below the navbar
          p-4: Padding for comfortable touch targets
        */}
        <nav className="bg-white shadow-md p-4">
          {/* 
            Container with max-width and auto margins
            Ensures content doesn't stretch too wide on large screens
            flex: Enables horizontal layout for navigation links
            gap-4: Consistent spacing between navigation items
          */}
          <div className="container mx-auto flex gap-4">
            {/* 
              Navigation Links
              Link prevents full page reload, enabling SPA behavior
              hover effects provide visual feedback on interaction
            */}
            <Link 
              to="/" 
              className="text-blue-500 hover:text-blue-700 transition-colors"
            >
              Upload
            </Link>
            <Link 
              to="/designs" 
              className="text-blue-500 hover:text-blue-700 transition-colors"
            >
              Designs
            </Link>
          </div>
        </nav>

        {/* 
          Main Content Container
          container: Centers content and provides responsive max-width
          mx-auto: Auto margins for horizontal centering
          p-4: Padding to prevent content from touching edges
        */}
        <div className="container mx-auto p-4">
          {/*
            Routes Configuration
            Routes component looks through child Route elements
            Renders the first match (or nothing if no match)
          */}
          <Routes>
            {/* 
              Individual Route Definitions
              path: URL pattern to match
              element: Component to render when route matches
            */}
            <Route path="/" element={<Upload />} />
            <Route path="/designs" element={<Designs />} />
            <Route path="/designs/:id" element={<DesignView />} />
          </Routes>
        </div>

        {/*
          Toast Notification Container
          position="top-right": Notifications appear in top-right corner
          Renders all toast notifications from react-hot-toast
          Automatically handles stacking and animations
        */}
        <Toaster position="top-right" />
      </div>
    </BrowserRouter>
  );
}

// Export App as default for use in index.tsx/main entry point
export default App;