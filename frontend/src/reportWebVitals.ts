// Import the ReportCallback type from web-vitals package
// This defines the function signature used to receive performance metrics
import { ReportCallback } from 'web-vitals';


/**
 * reportWebVitals
 *
 * Utility function for measuring real-world performance metrics
 * of the application using Google's Web Vitals library.
 *
 * These metrics help evaluate user experience, including:
 *  - Loading performance
 *  - Interactivity
 *  - Visual stability
 *
 * This function is optional — it only runs if a callback is provided.
 */
const reportWebVitals = (onPerfEntry?: ReportCallback) => {

  /**
   * Ensure a valid callback function is provided.
   * This prevents unnecessary code execution if performance
   * tracking is not needed.
   */
  if (onPerfEntry && onPerfEntry instanceof Function) {

    /**
     * Dynamically import web-vitals library.
     *
     * Why dynamic import?
     *  - Reduces initial bundle size
     *  - Loads performance monitoring only when needed
     *  - Improves startup performance
     */
    import('web-vitals').then((
      {
        onCLS,  // Cumulative Layout Shift
        onINP,  // Interaction to Next Paint (modern replacement for FID)
        onFCP,  // First Contentful Paint
        onLCP,  // Largest Contentful Paint
        onTTFB  // Time To First Byte
      }
    ) => {

      /**
       * Register each metric with the callback.
       * Whenever a metric is measured, the callback is triggered.
       */

      onCLS(onPerfEntry);
      onINP(onPerfEntry);
      onFCP(onPerfEntry);
      onLCP(onPerfEntry);
      onTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;