// Combined JavaScript file for Duplicator Tool
// Works without server (no ES6 modules)

class DuplicatorAnimation {
    constructor(canvasManager) {
        this.manager = canvasManager;
        this.sourceImage = null;
        this.textImage = null; // Generated text image
        this.currentMode = 'image'; // Track the currently active mode

        // Parameters
        this.duplicates = 5;
        this.scaleOffset = 0;
        this.rotationOffset = 0;
        this.positionXOffset = 10;
        this.positionYOffset = 10;
        this.imageSize = 1.0; // Scale factor for the uploaded image

        // Text parameters
        this.textContent = '';
        this.fontSize = 48;
        this.fontWeight = 400;
        this.textColor = '#ffffff';
        this.fontFamily = 'Wix Madefor Display';

        // Multi-parameter animation system
        this.animations = {
            scale: { enabled: false, frequency: 1.0, amplitude: 50 },
            rotation: { enabled: false, frequency: 1.0, amplitude: 50 },
            positionX: { enabled: false, frequency: 1.0, amplitude: 50 },
            positionY: { enabled: false, frequency: 1.0, amplitude: 50 }
        };
        this.timeOffset = 5; // frames (global)

        // Drop shadow properties
        this.dropShadow = {
            enabled: false,
            distance: 10,
            blur: 5,
            opacity: 0.5,
            angle: 45
        };
    }

    setSourceImage(image) {
        this.sourceImage = image;
    }

    setCurrentMode(mode) {
        this.currentMode = mode;
    }

    getCurrentMode() {
        return this.currentMode;
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
            case 'timeOffset':
                this.timeOffset = parseFloat(value);
                break;
            case 'imageSize':
                this.imageSize = parseFloat(value);
                break;
            // Drop shadow parameters
            case 'dropShadowEnabled':
                this.dropShadow.enabled = value;
                break;
            case 'dropShadowDistance':
                this.dropShadow.distance = parseFloat(value);
                break;
            case 'dropShadowBlur':
                this.dropShadow.blur = parseFloat(value);
                break;
            case 'dropShadowOpacity':
                this.dropShadow.opacity = parseFloat(value) / 100; // Convert percentage to decimal
                break;
            case 'dropShadowAngle':
                this.dropShadow.angle = parseFloat(value);
                break;
            // Text parameters
            case 'textContent':
                this.textContent = value;
                this.generateTextImage();
                break;
            case 'fontSize':
                this.fontSize = parseFloat(value);
                this.generateTextImage();
                break;
            case 'fontWeight':
                this.fontWeight = parseInt(value);
                this.generateTextImage();
                break;
            case 'textColor':
                this.textColor = value;
                this.generateTextImage();
                break;
            case 'fontFamily':
                this.fontFamily = value;
                this.generateTextImage();
                break;
            // Multi-parameter animation controls
            default:
                this.setAnimationParameter(key, value);
                break;
        }
    }

    setAnimationParameter(key, value) {
        // Handle animation enable/disable: "scale-enabled", "rotation-enabled", etc.
        if (key.endsWith('-enabled')) {
            const param = key.replace('-enabled', '');
            if (this.animations[param]) {
                this.animations[param].enabled = value;
            }
        }
        // Handle animation frequency: "scale-frequency", "rotation-frequency", etc.
        else if (key.endsWith('-frequency')) {
            const param = key.replace('-frequency', '');
            if (this.animations[param]) {
                this.animations[param].frequency = parseFloat(value);
            }
        }
        // Handle animation amplitude: "scale-amplitude", "rotation-amplitude", etc.
        else if (key.endsWith('-amplitude')) {
            const param = key.replace('-amplitude', '');
            if (this.animations[param]) {
                this.animations[param].amplitude = parseFloat(value);
            }
        }
        // Legacy support for old single animation system
        else if (key === 'animationProperty') {
            // Convert old system to new system
            this.disableAllAnimations();
            if (value !== 'none' && this.animations[value]) {
                this.animations[value].enabled = true;
            }
        }
        else if (key === 'frequency') {
            // Apply to all enabled animations for legacy support
            Object.keys(this.animations).forEach(param => {
                if (this.animations[param].enabled) {
                    this.animations[param].frequency = parseFloat(value);
                }
            });
        }
        else if (key === 'amplitude') {
            // Apply to all enabled animations for legacy support
            Object.keys(this.animations).forEach(param => {
                if (this.animations[param].enabled) {
                    this.animations[param].amplitude = parseFloat(value);
                }
            });
        }
    }

    generateTextImage() {
        if (!this.textContent || this.textContent.trim() === '') {
            this.textImage = null;
            return;
        }

        // Create off-screen canvas for text rendering
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        // Set font properties with variable font weight
        tempCtx.font = `${this.fontWeight} ${this.fontSize}px 'Wix Madefor Display', sans-serif`;
        tempCtx.textAlign = 'center';
        tempCtx.textBaseline = 'middle';
        tempCtx.fillStyle = this.textColor;

        // Measure text to determine canvas size
        const lines = this.textContent.split('\n');
        const lineHeight = this.fontSize * 1.2;
        const maxWidth = Math.max(...lines.map(line => tempCtx.measureText(line).width));
        const totalHeight = lines.length * lineHeight;

        // Set canvas size with padding
        const padding = 20;
        tempCanvas.width = maxWidth + (padding * 2);
        tempCanvas.height = totalHeight + (padding * 2);

        // Re-set font properties (canvas resize clears context)
        tempCtx.font = `${this.fontWeight} ${this.fontSize}px 'Wix Madefor Display', sans-serif`;
        tempCtx.textAlign = 'center';
        tempCtx.textBaseline = 'middle';
        tempCtx.fillStyle = this.textColor;

        // Draw each line of text
        const centerX = tempCanvas.width / 2;
        const startY = tempCanvas.height / 2 - ((lines.length - 1) * lineHeight / 2);

        lines.forEach((line, index) => {
            const y = startY + (index * lineHeight);
            tempCtx.fillText(line, centerX, y);
        });

        // Convert canvas to image
        const img = new Image();
        img.onload = () => {
            this.textImage = img;
        };
        img.src = tempCanvas.toDataURL();

        // For immediate use, also set textImage directly
        this.textImage = tempCanvas;
    }

    disableAllAnimations() {
        Object.keys(this.animations).forEach(param => {
            this.animations[param].enabled = false;
        });
    }

    render(ctx, width, height, time) {
        // Check what content we should render based on current mode
        const hasImage = this.sourceImage;
        const hasText = this.textContent && this.textContent.trim() !== '';

        // Mode-based rendering: render only the content for the current mode
        let shouldRenderImage = false;
        let shouldRenderText = false;

        if (this.currentMode === 'image') {
            shouldRenderImage = hasImage;
        } else if (this.currentMode === 'text') {
            shouldRenderText = hasText;
        }

        // If current mode has no content, don't render anything
        if (!shouldRenderImage && !shouldRenderText) return;

        // Render duplicates from highest index to lowest (bottom to top)
        for (let i = this.duplicates - 1; i >= 0; i--) {
            ctx.save();

            // Apply drop shadow if enabled
            if (this.dropShadow.enabled) {
                // Convert angle to radians and calculate shadow offset
                const angleRad = (this.dropShadow.angle - 90) * Math.PI / 180; // -90 to make 0° point up
                const shadowX = Math.cos(angleRad) * this.dropShadow.distance;
                const shadowY = Math.sin(angleRad) * this.dropShadow.distance;

                ctx.shadowColor = `rgba(0, 0, 0, ${this.dropShadow.opacity})`;
                ctx.shadowBlur = this.dropShadow.blur;
                ctx.shadowOffsetX = shadowX;
                ctx.shadowOffsetY = shadowY;
            }

            // Calculate base cumulative transformations
            const baseScale = Math.pow(1 + this.scaleOffset, i);
            const baseRotation = this.rotationOffset * i * Math.PI / 180;
            let baseX = width / 2 + this.positionXOffset * i;
            let baseY = height / 2 + this.positionYOffset * i;

            // Calculate animated offsets
            let animatedX = 0;
            let animatedY = 0;
            let animatedRotation = 0;
            let animatedScale = 1;

            Object.keys(this.animations).forEach(animParam => {
                const anim = this.animations[animParam];
                if (anim.enabled) {
                    const animPhase = time - (i * this.timeOffset / 60);
                    const animValue = anim.amplitude * Math.sin(anim.frequency * animPhase * Math.PI * 2);

                    switch(animParam) {
                        case 'scale':
                            animatedScale *= 1 + (animValue / 100); // Convert to scale factor
                            break;
                        case 'rotation':
                            animatedRotation += animValue * Math.PI / 180; // Convert to radians
                            break;
                        case 'positionX':
                            animatedX += animValue;
                            break;
                        case 'positionY':
                            animatedY += animValue;
                            break;
                    }
                }
            });

            // Apply transformations in correct order to maintain center point
            // 1. Position (base + animated)
            ctx.translate(baseX + animatedX, baseY + animatedY);
            // 2. Rotation (base + animated)
            ctx.rotate(baseRotation + animatedRotation);
            // 3. Scale (base * animated)
            const finalScale = baseScale * animatedScale;
            ctx.scale(finalScale, finalScale);

            if (shouldRenderImage) {
                // Draw image centered with image size scaling
                const imgWidth = this.sourceImage.width * this.imageSize;
                const imgHeight = this.sourceImage.height * this.imageSize;
                ctx.drawImage(this.sourceImage, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
            } else if (shouldRenderText) {
                // Render text directly at the appropriate size for crisp rendering
                this.renderTextDirect(ctx, finalScale);
            }

            ctx.restore();
        }
    }

    renderTextDirect(ctx, scale) {
        // Calculate scaled font size for crisp rendering
        const scaledFontSize = this.fontSize * scale;

        // Set font properties with variable font support
        let fontString;
        if (this.fontFamily === 'Wix Madefor Display' || this.fontFamily === 'Inter') {
            // Use font-variation-settings for variable fonts
            fontString = `${scaledFontSize}px '${this.fontFamily}'`;
            ctx.font = fontString;
            // Apply font weight using canvas font-variation-settings (if supported)
            // For better compatibility, we use the weight in the font string
            ctx.font = `${this.fontWeight} ${scaledFontSize}px '${this.fontFamily}'`;
        } else {
            // Standard font string for non-variable fonts
            ctx.font = `${this.fontWeight} ${scaledFontSize}px '${this.fontFamily}', sans-serif`;
        }

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = this.textColor;

        // Split text into lines and render each line
        const lines = this.textContent.split('\n');
        const lineHeight = scaledFontSize * 1.2;
        const startY = -((lines.length - 1) * lineHeight / 2);

        lines.forEach((line, index) => {
            const y = startY + (index * lineHeight);
            ctx.fillText(line, 0, y);
        });
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

        // Drop Shadow Controls
        this.initializeDropShadowControls();
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

    initializeDropShadowControls() {
        // Drop shadow enable checkbox
        const shadowCheckbox = document.getElementById('drop-shadow-enable');
        shadowCheckbox.addEventListener('change', (e) => {
            const enabled = e.target.checked;
            this.duplicatorAnimation.setParameter('dropShadowEnabled', enabled);

            // Show/hide controls when checkbox is toggled
            const controls = document.getElementById('drop-shadow-controls');
            const toggle = document.querySelector('[aria-controls="drop-shadow-controls"]');

            if (enabled) {
                // Auto-expand when enabled
                controls.style.display = 'block';
                toggle.setAttribute('aria-expanded', 'true');
                toggle.querySelector('.toggle-icon').textContent = '▼';
            } else {
                // Auto-collapse when disabled
                controls.style.display = 'none';
                toggle.setAttribute('aria-expanded', 'false');
                toggle.querySelector('.toggle-icon').textContent = '▶';
            }
        });

        // Toggle button to expand/collapse controls
        const toggle = document.querySelector('[aria-controls="drop-shadow-controls"]');
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
            const controls = document.getElementById('drop-shadow-controls');

            if (isExpanded) {
                controls.style.display = 'none';
                toggle.setAttribute('aria-expanded', 'false');
                toggle.querySelector('.toggle-icon').textContent = '▶';
            } else {
                controls.style.display = 'block';
                toggle.setAttribute('aria-expanded', 'true');
                toggle.querySelector('.toggle-icon').textContent = '▼';
            }
        });

        // Distance slider
        document.getElementById('shadow-distance').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.duplicatorAnimation.setParameter('dropShadowDistance', value);
            document.getElementById('shadow-distance-value').textContent = value + 'px';
        });

        // Blur slider
        document.getElementById('shadow-blur').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.duplicatorAnimation.setParameter('dropShadowBlur', value);
            document.getElementById('shadow-blur-value').textContent = value + 'px';
        });

        // Opacity slider
        document.getElementById('shadow-opacity').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.duplicatorAnimation.setParameter('dropShadowOpacity', value);
            document.getElementById('shadow-opacity-value').textContent = value + '%';
        });

        // Angle slider
        document.getElementById('shadow-angle').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.duplicatorAnimation.setParameter('dropShadowAngle', value);
            document.getElementById('shadow-angle-value').textContent = value + '°';
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
            this.isExporting = true;

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
        this.isExporting = false;
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
    window.canvasManager = canvasManager; // For debugging

    // Initialize mode switching
    initModeSwitch();
});