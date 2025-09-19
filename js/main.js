import { FlexibleCanvasManager } from './CanvasManager.js';

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const canvasManager = new FlexibleCanvasManager();

    // Make canvasManager globally available for debugging if needed
    window.canvasManager = canvasManager;
});