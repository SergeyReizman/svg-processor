// Import React core library
// Required to use JSX and React components
import React from 'react';

// ReactDOM is responsible for rendering React components into the actual DOM
import ReactDOM from 'react-dom/client';

// Global stylesheet (utility classes + base styles)
import './index.css';

// Root application component
import App from './App';


/**
 * Create React root
 *
 * React 18 introduced createRoot() instead of the older ReactDOM.render().
 * This enables concurrent features and improved rendering performance.
 *
 * We cast the element as HTMLElement because TypeScript cannot guarantee
 * that getElementById returns a non-null value.
 */
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);


/**
 * Render application
 *
 * React.StrictMode is a development-only wrapper that:
 *  - Detects unsafe lifecycle usage
 *  - Highlights potential problems
 *  - Helps prepare components for future React features
 *
 * It does NOT affect production behavior.
 */
root.render(
  <React.StrictMode>
    {/* Main App component */}
    <App />
  </React.StrictMode>
);