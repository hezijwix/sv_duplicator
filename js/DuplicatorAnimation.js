export class DuplicatorAnimation {
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
        this.textColorEnd = '#ffffff';
        this.fontFamily = 'Wix Madefor Display';
        this.outlineThickness = 0;
        this.outlineColor = '#000000';

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
            case 'textColorEnd':
                this.textColorEnd = value;
                this.generateTextImage();
                break;
            case 'fontFamily':
                this.fontFamily = value;
                this.generateTextImage();
                break;
            case 'outlineThickness':
                this.outlineThickness = parseFloat(value);
                this.generateTextImage();
                break;
            case 'outlineColor':
                this.outlineColor = value;
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
                this.renderTextDirect(ctx, finalScale, i);
            }

            ctx.restore();
        }
    }

    renderTextDirect(ctx, scale, duplicateIndex) {
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

        // Calculate gradient color based on duplicate index
        const t = this.duplicates > 1 ? duplicateIndex / (this.duplicates - 1) : 0;
        const gradientColor = this.interpolateColor(this.textColor, this.textColorEnd, t);

        // Split text into lines and render each line
        const lines = this.textContent.split('\n');
        const lineHeight = scaledFontSize * 1.2;
        const startY = -((lines.length - 1) * lineHeight / 2);

        lines.forEach((line, index) => {
            const y = startY + (index * lineHeight);

            // Draw outline if thickness > 0
            if (this.outlineThickness > 0) {
                ctx.strokeStyle = this.outlineColor;
                ctx.lineWidth = (this.outlineThickness * 2) / scale; // Constant width regardless of scale
                ctx.lineJoin = 'round';
                ctx.miterLimit = 2;
                ctx.strokeText(line, 0, y);
            }

            // Draw fill text on top with gradient color
            ctx.fillStyle = gradientColor;
            ctx.fillText(line, 0, y);
        });
    }

    interpolateColor(color1, color2, t) {
        // Parse hex colors to RGB
        const r1 = parseInt(color1.slice(1, 3), 16);
        const g1 = parseInt(color1.slice(3, 5), 16);
        const b1 = parseInt(color1.slice(5, 7), 16);

        const r2 = parseInt(color2.slice(1, 3), 16);
        const g2 = parseInt(color2.slice(3, 5), 16);
        const b2 = parseInt(color2.slice(5, 7), 16);

        // Interpolate
        const r = Math.round(r1 + (r2 - r1) * t);
        const g = Math.round(g1 + (g2 - g1) * t);
        const b = Math.round(b1 + (b2 - b1) * t);

        // Convert back to hex
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }
}