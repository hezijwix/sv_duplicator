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
            case 'imageSize':
                this.imageSize = parseFloat(value);
                break;
        }
    }

    render(ctx, width, height, time) {
        if (!this.sourceImage) return;

        // Render duplicates from highest index to lowest (bottom to top)
        for (let i = this.duplicates - 1; i >= 0; i--) {
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

            // Draw image centered with image size scaling
            const imgWidth = this.sourceImage.width * this.imageSize;
            const imgHeight = this.sourceImage.height * this.imageSize;
            ctx.drawImage(this.sourceImage, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);

            ctx.restore();
        }
    }
}