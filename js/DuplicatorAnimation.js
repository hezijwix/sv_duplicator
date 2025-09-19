export class DuplicatorAnimation {
    constructor(canvasManager) {
        this.manager = canvasManager;
        this.sourceImage = null;

        // Parameters
        this.duplicates = 5;
        this.scaleOffset = 0;
        this.rotationOffset = 0;
        this.positionXOffset = 10;
        this.positionYOffset = 10;
        this.imageSize = 1.0; // Scale factor for the uploaded image

        // Multi-parameter animation system
        this.animations = {
            scale: { enabled: false, frequency: 1.0, amplitude: 50 },
            rotation: { enabled: false, frequency: 1.0, amplitude: 50 },
            positionX: { enabled: false, frequency: 1.0, amplitude: 50 },
            positionY: { enabled: false, frequency: 1.0, amplitude: 50 }
        };
        this.timeOffset = 5; // frames (global)
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
            case 'timeOffset':
                this.timeOffset = parseFloat(value);
                break;
            case 'imageSize':
                this.imageSize = parseFloat(value);
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

    disableAllAnimations() {
        Object.keys(this.animations).forEach(param => {
            this.animations[param].enabled = false;
        });
    }

    render(ctx, width, height, time) {
        if (!this.sourceImage) return;

        // Render duplicates from highest index to lowest (bottom to top)
        for (let i = this.duplicates - 1; i >= 0; i--) {
            ctx.save();

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
            ctx.scale(baseScale * animatedScale, baseScale * animatedScale);

            // Draw image centered with image size scaling
            const imgWidth = this.sourceImage.width * this.imageSize;
            const imgHeight = this.sourceImage.height * this.imageSize;
            ctx.drawImage(this.sourceImage, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);

            ctx.restore();
        }
    }
}