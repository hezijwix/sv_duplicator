import { FlexibleCanvasManager } from './CanvasManager.js';

// Mode switching functionality
function initModeSwitch() {
    const imageModeTab = document.getElementById('image-mode-tab');
    const textModeTab = document.getElementById('text-mode-tab');
    const imageModeContent = document.getElementById('image-mode-content');
    const textModeContent = document.getElementById('text-mode-content');

    function switchToMode(mode) {
        if (mode === 'image') {
            // Update tabs
            imageModeTab.classList.add('active');
            textModeTab.classList.remove('active');

            // Update content
            imageModeContent.style.display = 'block';
            textModeContent.style.display = 'none';
        } else {
            // Update tabs
            textModeTab.classList.add('active');
            imageModeTab.classList.remove('active');

            // Update content
            textModeContent.style.display = 'block';
            imageModeContent.style.display = 'none';
        }

        // Update the duplicator animation's current mode
        if (window.canvasManager && window.canvasManager.duplicatorAnimation) {
            window.canvasManager.duplicatorAnimation.setCurrentMode(mode);
        }
    }

    // Add event listeners
    imageModeTab.addEventListener('click', () => switchToMode('image'));
    textModeTab.addEventListener('click', () => switchToMode('text'));
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const canvasManager = new FlexibleCanvasManager();

    // Make canvasManager globally available for debugging if needed
    window.canvasManager = canvasManager;

    // Initialize mode switching
    initModeSwitch();
});