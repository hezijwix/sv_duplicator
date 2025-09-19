// Combined JavaScript file for Duplicator Tool
// Works without server (no ES6 modules)

class DuplicatorAnimation {
    constructor(canvasManager) {
        this.manager = canvasManager;
        this.sourceImage = null;

        // Parameters
        this.duplicates = 5;
        this.scaleOffset = 0;
        this.rotationOffset = 0;
        this.positionXOffset = 10;
        this.positionYOffset = 10;

        // Animation
        this.animationProperty = 'none';
        this.frequency = 1.0;
        this.amplitude = 50;
        this.timeOffset = 5; // frames
    }

    setSourceImage(image) {
        this.sourceImage = image;
    }

    setParameter(key, value) {
        switch(key) {
            case 'duplicates':
                this.duplicates = parseInt(value);
                break;
            case 'scaleOffset':
                this.scaleOffset = parseFloat(value);
                break;
            case 'rotationOffset':
                this.rotationOffset = parseFloat(value);
                break;
            case 'positionXOffset':
                this.positionXOffset = parseFloat(value);
                break;
            case 'positionYOffset':
                this.positionYOffset = parseFloat(value);
                break;
            case 'animationProperty':
                this.animationProperty = value;
                break;
            case 'frequency':
                this.frequency = parseFloat(value);
                break;
            case 'amplitude':
                this.amplitude = parseFloat(value);
                break;
            case 'timeOffset':
                this.timeOffset = parseFloat(value);
                break;
        }
    }

    render(ctx, width, height, time) {
        if (!this.sourceImage) return;

        for (let i = 0; i < this.duplicates; i++) {
            ctx.save();

            // Calculate cumulative transformation
            const scale = Math.pow(1 + this.scaleOffset, i);
            const rotation = this.rotationOffset * i * Math.PI / 180;
            let x = width / 2 + this.positionXOffset * i;
            let y = height / 2 + this.positionYOffset * i;

            // Apply transformations
            ctx.translate(x, y);
            ctx.rotate(rotation);
            ctx.scale(scale, scale);

            // Apply animation (after base transformations)
            if (this.animationProperty !== 'none') {
                const animPhase = time - (i * this.timeOffset / 60);
                const animValue = this.amplitude * Math.sin(this.frequency * animPhase * Math.PI * 2);

                switch(this.animationProperty) {
                    case 'scale':
                        const animScale = 1 + (animValue / 100); // Convert to scale factor
                        ctx.scale(animScale, animScale);
                        break;
                    case 'rotation':
                        ctx.rotate(animValue * Math.PI / 180); // Convert to radians
                        break;
                    case 'positionX':
                        ctx.translate(animValue, 0);
                        break;
                    case 'positionY':
                        ctx.translate(0, animValue);
                        break;
                }
            }

            // Draw image centered
            const imgWidth = this.sourceImage.width;
            const imgHeight = this.sourceImage.height;
            ctx.drawImage(this.sourceImage, -imgWidth / 2, -imgHeight / 2);

            ctx.restore();
        }
    }
}

class FlexibleCanvasManager {
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

        // Animation property dropdown
        document.getElementById('animation-property').addEventListener('change', (e) => {
            this.duplicatorAnimation.setParameter('animationProperty', e.target.value);
        });

        // Frequency slider
        document.getElementById('frequency-slider').addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.duplicatorAnimation.setParameter('frequency', value);
            document.getElementById('frequency-value').textContent = value.toFixed(1) + ' Hz';
        });

        // Amplitude slider
        document.getElementById('amplitude-slider').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.duplicatorAnimation.setParameter('amplitude', value);
            document.getElementById('amplitude-value').textContent = value;
        });

        // Time offset slider
        document.getElementById('time-offset-slider').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.duplicatorAnimation.setParameter('timeOffset', value);
            document.getElementById('time-offset-value').textContent = value + ' frames';
        });
    }

    updateCanvasSize() {
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvasInfo.textContent = `${this.width} × ${this.height} px`;
        this.updateCanvasDisplay();
    }

    updateCanvasDisplay() {
        const containerWidth = this.wrapper.parentElement.clientWidth - 40;
        const containerHeight = this.wrapper.parentElement.clientHeight - 40;

        const canvasAspect = this.width / this.height;
        const containerAspect = containerWidth / containerHeight;

        let displayWidth, displayHeight;

        if (canvasAspect > containerAspect) {
            displayWidth = Math.min(containerWidth, this.width);
            displayHeight = displayWidth / canvasAspect;
        } else {
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
        // Set background
        if (this.isTransparent) {
            this.ctx.clearRect(0, 0, this.width, this.height);
            this.drawTransparencyCheckers();
        } else if (this.backgroundImage) {
            this.ctx.drawImage(this.backgroundImage, 0, 0, this.width, this.height);
        } else {
            this.ctx.fillStyle = this.backgroundColor;
            this.ctx.fillRect(0, 0, this.width, this.height);
        }

        // Duplicator Animation
        const time = Date.now() * 0.001;
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

    // Export functionality
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
            const fps = 30;
            const frames = duration * fps;
            const zip = new JSZip();

            exportBtn.textContent = 'Exporting...';
            exportBtn.disabled = true;

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
                this.render();

                const dataURL = this.canvas.toDataURL('image/png');
                const base64Data = dataURL.split(',')[1];

                const frameNumber = String(frame + 1).padStart(4, '0');
                zip.file(`frame_${frameNumber}.png`, base64Data, { base64: true });

                const progress = Math.round((frame / frames) * 100);
                exportBtn.textContent = `Exporting... ${progress}%`;

                await new Promise(resolve => setTimeout(resolve, 1));
            }

            exportBtn.textContent = 'Creating ZIP...';

            const blob = await zip.generateAsync({ type: 'blob' });

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
    }

    async exportMP4(duration) {
        const exportBtn = document.getElementById('export-btn');
        const originalText = exportBtn.textContent;

        try {
            exportBtn.textContent = 'Starting Export...';
            exportBtn.disabled = true;
            this.isExporting = true;

            const stream = this.canvas.captureStream(30);

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

            const options = { mimeType: selectedFormat.mimeType };
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

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const canvasManager = new FlexibleCanvasManager();
    window.canvasManager = canvasManager; // For debugging
});