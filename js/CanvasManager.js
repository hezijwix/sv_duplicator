import { DuplicatorAnimation } from './DuplicatorAnimation.js';

export class FlexibleCanvasManager {
    constructor() {
        this.canvas = document.getElementById('main-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.wrapper = document.getElementById('canvas-wrapper');
        this.canvasInfo = document.getElementById('canvas-info');

        this.width = 800;
        this.height = 600;
        this.backgroundColor = '#ffffff';
        this.isTransparent = false;
        this.backgroundImage = null;
        this.foregroundImage = null;

        this.animationId = null;
        this.isExporting = false;
        this.mediaRecorder = null;
        this.recordedChunks = [];

        // Initialize Duplicator Animation
        this.duplicatorAnimation = new DuplicatorAnimation(this);

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateCanvasSize();
        this.startAnimation();
    }

    setupEventListeners() {
        // Canvas size controls
        document.getElementById('canvas-width').addEventListener('input', (e) => {
            this.width = parseInt(e.target.value);
            this.updateCanvasSize();
        });

        document.getElementById('canvas-height').addEventListener('input', (e) => {
            this.height = parseInt(e.target.value);
            this.updateCanvasSize();
        });

        // Preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const [width, height] = e.target.dataset.size.split(',').map(Number);
                this.width = width;
                this.height = height;
                document.getElementById('canvas-width').value = width;
                document.getElementById('canvas-height').value = height;
                this.updateCanvasSize();

                // Update active preset
                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Background controls
        document.getElementById('bg-color').addEventListener('input', (e) => {
            this.backgroundColor = e.target.value;
        });

        document.getElementById('bg-transparency').addEventListener('change', (e) => {
            this.isTransparent = e.target.value === 'transparent';
        });

        // Background image upload
        document.getElementById('bg-upload-btn').addEventListener('click', (e) => {
            // Only trigger file input if clicking on the button itself, not the X
            if (!e.target.classList.contains('remove-image')) {
                document.getElementById('bg-image-input').click();
            }
        });

        document.getElementById('bg-image-input').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                        this.backgroundImage = img;
                        this.updateImageButtonState('bg', true);
                    };
                    img.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });

        // Background image removal
        document.getElementById('bg-remove-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.backgroundImage = null;
            this.updateImageButtonState('bg', false);
            document.getElementById('bg-image-input').value = '';
        });

        // Foreground image upload
        document.getElementById('fg-upload-btn').addEventListener('click', (e) => {
            // Only trigger file input if clicking on the button itself, not the X
            if (!e.target.classList.contains('remove-image')) {
                document.getElementById('fg-image-input').click();
            }
        });

        document.getElementById('fg-image-input').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                        this.foregroundImage = img;
                        this.updateImageButtonState('fg', true);
                    };
                    img.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });

        // Foreground image removal
        document.getElementById('fg-remove-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.foregroundImage = null;
            this.updateImageButtonState('fg', false);
            document.getElementById('fg-image-input').value = '';
        });

        // Export controls
        document.getElementById('export-btn').addEventListener('click', () => {
            document.getElementById('exportModal').style.display = 'flex';
            document.getElementById('exportSizeDisplay').textContent = `${this.width} × ${this.height}`;
        });

        document.getElementById('closeExportModal').addEventListener('click', () => {
            document.getElementById('exportModal').style.display = 'none';
        });

        document.getElementById('cancelExport').addEventListener('click', () => {
            document.getElementById('exportModal').style.display = 'none';
        });

        document.getElementById('startExport').addEventListener('click', () => {
            this.handleExport();
        });

        // Click outside modal to close
        document.getElementById('exportModal').addEventListener('click', (e) => {
            if (e.target.id === 'exportModal') {
                document.getElementById('exportModal').style.display = 'none';
            }
        });

        this.setupDuplicatorControls();

        // Window resize
        window.addEventListener('resize', () => this.updateCanvasDisplay());
    }

    setupDuplicatorControls() {
        // Image upload
        document.getElementById('duplicator-upload-btn').addEventListener('click', (e) => {
            if (!e.target.classList.contains('remove-image')) {
                document.getElementById('duplicator-image-input').click();
            }
        });

        document.getElementById('duplicator-image-input').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                        this.duplicatorAnimation.setSourceImage(img);
                        this.updateImageButtonState('duplicator', true);
                    };
                    img.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });

        document.getElementById('duplicator-remove-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.duplicatorAnimation.setSourceImage(null);
            this.updateImageButtonState('duplicator', false);
            document.getElementById('duplicator-image-input').value = '';
        });

        // Text input controls
        document.getElementById('text-input').addEventListener('input', (e) => {
            this.duplicatorAnimation.setParameter('textContent', e.target.value);
        });

        document.getElementById('font-weight-slider').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.duplicatorAnimation.setParameter('fontWeight', value);
            document.getElementById('font-weight-value').textContent = value;
        });

        document.getElementById('font-size-slider').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.duplicatorAnimation.setParameter('fontSize', value);
            document.getElementById('font-size-value').textContent = value + 'px';
        });

        document.getElementById('text-color').addEventListener('input', (e) => {
            this.duplicatorAnimation.setParameter('textColor', e.target.value);
        });

        document.getElementById('text-color-end').addEventListener('input', (e) => {
            this.duplicatorAnimation.setParameter('textColorEnd', e.target.value);
        });

        // Text outline controls
        document.getElementById('outline-thickness-slider').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.duplicatorAnimation.setParameter('outlineThickness', value);
            document.getElementById('outline-thickness-value').textContent = value + 'px';
        });

        document.getElementById('outline-color').addEventListener('input', (e) => {
            this.duplicatorAnimation.setParameter('outlineColor', e.target.value);
        });

        // Font family selector
        document.getElementById('font-family').addEventListener('change', (e) => {
            this.duplicatorAnimation.setParameter('fontFamily', e.target.value);
        });

        // Image size slider
        document.getElementById('image-size-slider').addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.duplicatorAnimation.setParameter('imageSize', value);
            document.getElementById('image-size-value').textContent = Math.round(value * 100) + '%';
        });

        // Duplicates slider
        document.getElementById('duplicates-slider').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.duplicatorAnimation.setParameter('duplicates', value);
            document.getElementById('duplicates-value').textContent = value;
        });

        // Scale offset slider
        document.getElementById('scale-offset-slider').addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.duplicatorAnimation.setParameter('scaleOffset', value);
            document.getElementById('scale-offset-value').textContent = value.toFixed(2);
        });

        // Rotation offset slider
        document.getElementById('rotation-offset-slider').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.duplicatorAnimation.setParameter('rotationOffset', value);
            document.getElementById('rotation-offset-value').textContent = value + '°';
        });

        // Position X slider
        document.getElementById('position-x-slider').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.duplicatorAnimation.setParameter('positionXOffset', value);
            document.getElementById('position-x-value').textContent = value + 'px';
        });

        // Position Y slider
        document.getElementById('position-y-slider').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.duplicatorAnimation.setParameter('positionYOffset', value);
            document.getElementById('position-y-value').textContent = value + 'px';
        });

        // Multi-Parameter Animation Controls
        this.initializeAnimationControls();

        // Time offset slider (global)
        document.getElementById('time-offset-slider').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.duplicatorAnimation.setParameter('timeOffset', value);
            document.getElementById('time-offset-value').textContent = value + ' frames';
        });
    }

    initializeAnimationControls() {
        const parameters = ['scale', 'rotation', 'positionX', 'positionY'];

        parameters.forEach(param => {
            // Checkbox to enable/disable animation
            const checkbox = document.getElementById(`anim-${param}-enable`);
            checkbox.addEventListener('change', (e) => {
                const enabled = e.target.checked;
                this.duplicatorAnimation.setParameter(`${param}-enabled`, enabled);

                // Show/hide controls when checkbox is toggled
                const controls = document.getElementById(`${param}-controls`);
                const toggle = document.querySelector(`[aria-controls="${param}-controls"]`);

                if (enabled) {
                    // Auto-expand when enabled
                    this.expandParameterControls(param);
                } else {
                    // Auto-collapse when disabled
                    this.collapseParameterControls(param);
                }

                // Update parameter container visual state
                const paramElement = document.querySelector(`[data-parameter="${param}"]`);
                if (enabled) {
                    paramElement.classList.remove('disabled');
                } else {
                    paramElement.classList.add('disabled');
                }
            });

            // Toggle button to expand/collapse controls
            const toggle = document.querySelector(`[aria-controls="${param}-controls"]`);
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
                if (isExpanded) {
                    this.collapseParameterControls(param);
                } else {
                    this.expandParameterControls(param);
                }
            });

            // Header click to toggle expand/collapse
            const header = toggle.closest('.parameter-header');
            header.addEventListener('click', (e) => {
                // Don't trigger if clicking the checkbox or its label
                if (e.target.type === 'checkbox' || e.target.tagName === 'LABEL') return;

                const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
                if (isExpanded) {
                    this.collapseParameterControls(param);
                } else {
                    this.expandParameterControls(param);
                }
            });

            // Frequency slider
            const frequencySlider = document.getElementById(`${param}-frequency`);
            frequencySlider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                this.duplicatorAnimation.setParameter(`${param}-frequency`, value);
                document.getElementById(`${param}-frequency-value`).textContent = value.toFixed(1) + ' Hz';
            });

            // Amplitude slider
            const amplitudeSlider = document.getElementById(`${param}-amplitude`);
            amplitudeSlider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                this.duplicatorAnimation.setParameter(`${param}-amplitude`, value);
                document.getElementById(`${param}-amplitude-value`).textContent = value;
            });
        });
    }

    expandParameterControls(param) {
        const controls = document.getElementById(`${param}-controls`);
        const toggle = document.querySelector(`[aria-controls="${param}-controls"]`);

        controls.style.display = 'block';
        toggle.setAttribute('aria-expanded', 'true');
    }

    collapseParameterControls(param) {
        const controls = document.getElementById(`${param}-controls`);
        const toggle = document.querySelector(`[aria-controls="${param}-controls"]`);

        controls.style.display = 'none';
        toggle.setAttribute('aria-expanded', 'false');
    }

    updateCanvasSize() {
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvasInfo.textContent = `${this.width} × ${this.height} px`;
        this.updateCanvasDisplay();
    }

    updateCanvasDisplay() {
        const containerWidth = this.wrapper.parentElement.clientWidth - 40; // padding
        const containerHeight = this.wrapper.parentElement.clientHeight - 40;

        const canvasAspect = this.width / this.height;
        const containerAspect = containerWidth / containerHeight;

        let displayWidth, displayHeight;

        if (canvasAspect > containerAspect) {
            // Canvas is wider - fit to width
            displayWidth = Math.min(containerWidth, this.width);
            displayHeight = displayWidth / canvasAspect;
        } else {
            // Canvas is taller - fit to height
            displayHeight = Math.min(containerHeight, this.height);
            displayWidth = displayHeight * canvasAspect;
        }

        this.wrapper.style.width = displayWidth + 'px';
        this.wrapper.style.height = displayHeight + 'px';
    }

    startAnimation() {
        const animate = () => {
            this.render();
            this.animationId = requestAnimationFrame(animate);
        };
        animate();
    }

    render() {
        const time = Date.now() * 0.001;
        this.renderFrame(time);
    }

    renderFrame(time) {
        // Set background
        if (this.isTransparent) {
            // For transparent background, only clear (don't draw checkers for export)
            this.ctx.clearRect(0, 0, this.width, this.height);
            // Only draw checkers for display, not for export
            if (!this.isExporting) {
                this.drawTransparencyCheckers();
            }
        } else if (this.backgroundImage) {
            this.ctx.drawImage(this.backgroundImage, 0, 0, this.width, this.height);
        } else {
            this.ctx.fillStyle = this.backgroundColor;
            this.ctx.fillRect(0, 0, this.width, this.height);
        }

        // Duplicator Animation
        this.duplicatorAnimation.render(this.ctx, this.width, this.height, time);

        // Draw foreground image if exists
        if (this.foregroundImage) {
            this.ctx.drawImage(this.foregroundImage, 0, 0, this.width, this.height);
        }
    }

    drawTransparencyCheckers() {
        const checkerSize = 20;
        const lightGray = '#C0C0C0';
        const darkGray = '#808080';

        for (let x = 0; x < this.width; x += checkerSize) {
            for (let y = 0; y < this.height; y += checkerSize) {
                const isEven = (Math.floor(x / checkerSize) + Math.floor(y / checkerSize)) % 2 === 0;
                this.ctx.fillStyle = isEven ? lightGray : darkGray;
                this.ctx.fillRect(x, y, checkerSize, checkerSize);
            }
        }
    }

    updateImageButtonState(type, hasImage) {
        const button = document.getElementById(`${type}-upload-btn`);
        const removeBtn = document.getElementById(`${type}-remove-btn`);
        const uploadText = button.querySelector('.upload-text');

        if (hasImage) {
            button.classList.add('has-image');
            removeBtn.style.display = 'flex';
            if (type === 'bg') {
                uploadText.textContent = 'BG Loaded';
            } else if (type === 'fg') {
                uploadText.textContent = 'FG Loaded';
            } else if (type === 'duplicator') {
                uploadText.textContent = 'Image Loaded';
            }
        } else {
            button.classList.remove('has-image');
            removeBtn.style.display = 'none';
            if (type === 'bg') {
                uploadText.textContent = 'Upload BG';
            } else if (type === 'fg') {
                uploadText.textContent = 'Upload FG';
            } else if (type === 'duplicator') {
                uploadText.textContent = 'Upload Image';
            }
        }
    }

    // Export functionality - keeping the export methods from the original file
    handleExport() {
        const format = document.getElementById('exportFormat').value;
        const duration = parseInt(document.getElementById('exportDuration').value) || 5;

        document.getElementById('exportModal').style.display = 'none';

        if (format === 'png') {
            this.exportPNG();
        } else if (format === 'mp4') {
            this.exportMP4(duration);
        } else if (format === 'png-sequence') {
            this.exportPNGSequence(duration);
        }
    }

    exportPNG() {
        const dataURL = this.canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `duplicator-export-${Date.now()}.png`;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    async exportPNGSequence(duration) {
        const exportBtn = document.getElementById('export-btn');
        const originalText = exportBtn.textContent;

        try {
            const fps = parseInt(document.getElementById('exportFPS').value);
            const frames = duration * fps;
            const zip = new JSZip();

            exportBtn.textContent = 'Exporting...';
            exportBtn.disabled = true;
            this.isExporting = true;

            // Generate README
            const readmeContent = `PNG Sequence Export
===========================

Total Frames: ${frames}
Duration: ${duration} seconds
Frame Rate: ${fps} FPS
Resolution: ${this.width} × ${this.height}

Export includes alpha channel support for transparency.
Compatible with Adobe After Effects, Premiere Pro, and other video editing software.

Generated by Duplicator Tool
Timestamp: ${new Date().toISOString()}`;

            zip.file('README.txt', readmeContent);

            for (let frame = 0; frame < frames; frame++) {
                const time = frame / fps;

                // Clear canvas completely to ensure transparency
                this.ctx.clearRect(0, 0, this.width, this.height);

                // Render frame with correct time for animation
                this.renderFrame(time);

                // Get frame data with alpha channel
                const dataURL = this.canvas.toDataURL('image/png');
                const base64Data = dataURL.split(',')[1];

                // Add frame to zip with zero-padded filename
                const frameNumber = String(frame + 1).padStart(4, '0');
                zip.file(`frame_${frameNumber}.png`, base64Data, { base64: true });

                // Update progress
                const progress = Math.round((frame / frames) * 100);
                exportBtn.textContent = `Exporting... ${progress}%`;

                // Allow UI to update
                await new Promise(resolve => setTimeout(resolve, 1));
            }

            exportBtn.textContent = 'Creating ZIP...';

            // Generate ZIP file
            const blob = await zip.generateAsync({ type: 'blob' });

            // Download ZIP
            const link = document.createElement('a');
            link.download = `duplicator-sequence-${Date.now()}.zip`;
            link.href = URL.createObjectURL(blob);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setTimeout(() => URL.revokeObjectURL(link.href), 1000);

        } catch (error) {
            console.error('Export error:', error);
            alert('Export failed. Please try again.');
        }

        exportBtn.textContent = originalText;
        exportBtn.disabled = false;
        this.isExporting = false;
    }

    async exportMP4(duration) {
        const exportBtn = document.getElementById('export-btn');
        const originalText = exportBtn.textContent;

        try {
            exportBtn.textContent = 'Starting Export...';
            exportBtn.disabled = true;
            this.isExporting = true;

            const fps = parseInt(document.getElementById('exportFPS').value);
            const stream = this.canvas.captureStream(fps);

            // Improved format detection with better MP4 support
            const formats = [
                { mimeType: 'video/mp4; codecs="avc1.42E01E"', extension: 'mp4' },
                { mimeType: 'video/mp4; codecs="avc1.4D4028"', extension: 'mp4' },
                { mimeType: 'video/mp4; codecs="avc1.640028"', extension: 'mp4' },
                { mimeType: 'video/mp4', extension: 'mp4' },
                { mimeType: 'video/webm; codecs="vp9,opus"', extension: 'webm' },
                { mimeType: 'video/webm; codecs="vp8,opus"', extension: 'webm' },
                { mimeType: 'video/webm', extension: 'webm' }
            ];

            let selectedFormat = null;
            for (const format of formats) {
                if (MediaRecorder.isTypeSupported(format.mimeType)) {
                    selectedFormat = format;
                    break;
                }
            }

            if (!selectedFormat) {
                throw new Error('No supported video format found');
            }

            const options = {
                mimeType: selectedFormat.mimeType
            };

            if (selectedFormat.extension === 'mp4') {
                options.videoBitsPerSecond = 2500000;
            }

            this.mediaRecorder = new MediaRecorder(stream, options);
            this.recordedChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                try {
                    const blob = new Blob(this.recordedChunks, {
                        type: selectedFormat.mimeType
                    });

                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');

                    const timestamp = Date.now();
                    const filename = `duplicator-video-${timestamp}.${selectedFormat.extension}`;

                    link.download = filename;
                    link.href = url;

                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    setTimeout(() => URL.revokeObjectURL(url), 1000);

                } catch (error) {
                    console.error('Error creating download:', error);
                    alert('Error saving video file. Please try again.');
                }

                exportBtn.textContent = originalText;
                exportBtn.disabled = false;
                this.isExporting = false;
            };

            this.mediaRecorder.onerror = (event) => {
                console.error('MediaRecorder error:', event.error);
                alert('Recording error occurred. Please try again.');
                exportBtn.textContent = originalText;
                exportBtn.disabled = false;
                this.isExporting = false;
            };

            this.mediaRecorder.start(200);

            setTimeout(() => {
                this.mediaRecorder.stop();
            }, duration * 1000);

        } catch (error) {
            console.error('Export error:', error);
            alert('Video export failed. Please try again.');
            exportBtn.textContent = originalText;
            exportBtn.disabled = false;
            this.isExporting = false;
        }
    }
}