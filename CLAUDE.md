# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Duplicator is a generative design tool for graphic designers who aren't animators. Built with HTML5 Canvas, it creates After Effects-style "repeater" effects by duplicating uploaded images with cumulative transformations and optional sine wave animations. The tool enables designers to create complex spiral, tunnel, and wave patterns with simple parameter controls.

## Quick Start

### Using the Tool
```bash
# Open the Duplicator tool directly in browser
open start_template.html

# Or serve with a local server for full functionality
python -m http.server 8000
# Then navigate to http://localhost:8000/start_template.html
```

### Basic Workflow
1. **Upload an image** (JPEG/PNG with alpha support)
2. **Adjust duplicates** (1-50 copies)
3. **Set transformation offsets** to create patterns:
   - Scale Offset: Growing/shrinking effects
   - Rotation Offset: Spiral patterns
   - Position X/Y: Linear or curved arrangements
4. **Add animation** (optional) with sine wave modulation
5. **Export** as PNG, MP4, or PNG sequence

## Project Structure

### File Organization
```
Duplicator/
├── start_template.html           # Main tool file with integrated functionality
├── styles/                       # CSS design system
│   ├── variables.css             # CSS custom properties and theming
│   ├── base.css                  # Base typography and layout
│   ├── layout.css                # Grid and container layouts
│   ├── controls.css              # Form controls and sliders
│   ├── buttons.css               # Button styles and states
│   ├── modal.css                 # Export modal styling
│   └── utils.css                 # Utility classes
├── CLAUDE.md                     # This guidance file
└── .mcp.json                     # MCP configuration
```

### Key Components

#### Core System
- **FlexibleCanvasManager**: Handles canvas operations, sizing, background/foreground images
- **DuplicatorAnimation**: Main duplication engine with transformation and animation logic
- **Export System**: Integrated PNG, MP4, and PNG sequence export with alpha support
- **UI Controls**: Real-time parameter adjustment with visual feedback

#### Duplication System
- **Image Upload**: FileReader API for JPEG/PNG with transparency support
- **Cumulative Transformations**: Each duplicate builds upon the previous transformation
- **Animation Engine**: Sine wave modulation with time-offset delays
- **Export Integration**: Works seamlessly with all export formats

## Development Guide

### Understanding the Duplicator Engine

#### Core Concepts
The Duplicator tool works by creating multiple copies of an uploaded image, where each copy has **cumulative transformations** applied:

1. **Copy 0**: Original position/scale/rotation
2. **Copy 1**: Original + 1× offset values
3. **Copy 2**: Original + 2× offset values
4. **Copy N**: Original + N× offset values

This creates exponential patterns like spirals, tunnels, and waves.

#### DuplicatorAnimation Class Structure
```javascript
class DuplicatorAnimation {
    constructor(canvasManager) {
        this.sourceImage = null;       // Uploaded image
        this.duplicates = 5;           // Number of copies (1-50)
        this.scaleOffset = 0;          // Scale change per duplicate
        this.rotationOffset = 0;       // Rotation change per duplicate
        this.positionXOffset = 10;     // X position change per duplicate
        this.positionYOffset = 10;     // Y position change per duplicate

        // Animation system
        this.animationProperty = 'none'; // What to animate
        this.frequency = 1.0;            // Animation speed (Hz)
        this.amplitude = 50;             // Animation intensity
        this.timeOffset = 5;             // Frame delay between duplicates
    }
}
```

#### Parameter Effects
- **Scale Offset**: `Math.pow(1 + scaleOffset, i)` - Creates growing/shrinking tunnels
- **Rotation Offset**: `rotationOffset * i` - Creates spirals
- **Position Offsets**: `basePosition + offset * i` - Creates linear arrangements
- **Animation**: Sine wave modulation on selected property with time delays

### Creating Patterns

#### Common Pattern Types

**Spiral Pattern:**
- Duplicates: 20-30
- Rotation Offset: 15-30°
- Position X: 5-15px
- Position Y: 0-5px
- Creates clockwise spirals

**Tunnel Effect:**
- Duplicates: 15-25
- Scale Offset: -0.05 to -0.15
- Position X/Y: 0px
- Creates inward tunneling effect

**Wave Pattern:**
- Duplicates: 10-20
- Position X: 20-40px
- Position Y: 0px
- Animation: Position Y with amplitude 30-60

**Grid Array:**
- Duplicates: 9-16
- Position X: 80px, Position Y: 0px
- Use Position Y animation with low frequency for wave effect

#### Animation Combinations
**Pulsing Spiral:**
- Base spiral pattern + Scale animation
- Frequency: 0.5-1.5 Hz
- Amplitude: 20-40

**Orbiting Copies:**
- Position X: 50px + Position X animation
- Position Y: 0px + Position Y animation
- Same frequency, 90° phase difference

**Breathing Tunnel:**
- Tunnel pattern + Scale animation
- Low frequency (0.3-0.8 Hz)
- High amplitude (60-80)

## Export System

### Export Formats
- **PNG**: Single frame image export
- **MP4**: Video export with browser-supported codecs
- **PNG Sequence**: Frame-by-frame export in ZIP archive

### Export Features
- **Alpha Channel Support**: PNG sequences preserve transparency
- **Custom Duration**: Set video/sequence length
- **Progress Indicators**: Real-time export progress
- **Cross-browser Compatibility**: Automatic codec detection

### Export Implementation
Export functionality is automatically handled by `ExportManager`. Animations only need to implement:
- `renderFrame(ctx, width, height, time)` for frame-specific rendering
- The export system handles timing, file creation, and downloads

## CSS Architecture

### Design System (main.css)
- **CSS Custom Properties**: Centralized theming system
- **Component-based**: Modular CSS structure
- **Dark Theme**: Professional dark UI
- **Responsive**: Adapts to different screen sizes

### Control Styles (controls.css)
- **Range Sliders**: Styled input[type="range"] with consistent theming
- **Form Controls**: Label positioning and value display formatting
- **Button States**: Upload button styling with image loaded states
- **Responsive Layout**: Mobile-friendly control panel organization

## Best Practices

### Design Workflow
1. **Start Small**: Begin with 5-10 duplicates to see the pattern
2. **Incremental Adjustments**: Make small changes to see their cumulative effect
3. **Test Export Early**: Verify your pattern exports correctly with transparency
4. **Save Variations**: Screenshot interesting configurations for reference
5. **Consider Final Use**: Match canvas size to intended output format

### Pattern Creation
1. **Understand Cumulative Effects**: Each duplicate builds on the previous transformation
2. **Balance Complexity**: Too many duplicates can create visual chaos
3. **Use Animation Sparingly**: Static patterns often work better for print
4. **Mind the Edges**: High position offsets may push duplicates off-canvas
5. **Alpha Channel Matters**: Use PNG upload for best results

### Performance Optimization
1. **Monitor Duplicate Count**: 50 duplicates is the maximum for smooth performance
2. **Canvas Size Impact**: Larger canvases require more processing power
3. **Animation Complexity**: Multiple animated properties can slow rendering
4. **Export File Sizes**: PNG sequences can become large with many frames
5. **Browser Compatibility**: Test exports across different browsers

## Usage Examples

### Design Workflow Patterns
#### Logo Multiplication
1. Upload your logo (PNG with transparency)
2. Set duplicates to 8-12
3. Apply small rotation offset (10-20°)
4. Add subtle position offsets (5-10px)
5. Export as PNG for use in presentations

#### Pattern Generation
1. Upload a simple shape or icon
2. High duplicate count (30-50)
3. Combine rotation + scale offsets for complex patterns
4. Use PNG sequence export for After Effects

#### Motion Graphics Preview
1. Upload design element
2. Set up desired transformation pattern
3. Add animation (scale or rotation)
4. Export MP4 for client preview
5. Use PNG sequence for final production

### Technical Implementation

#### Render Loop Structure
```javascript
render() {
    // 1. Background system (preserved)
    if (this.isTransparent) {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.drawTransparencyCheckers();
    } else if (this.backgroundImage) {
        this.ctx.drawImage(this.backgroundImage, 0, 0, this.width, this.height);
    } else {
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    // 2. Duplicator animation (our tool)
    const time = Date.now() * 0.001;
    this.duplicatorAnimation.render(this.ctx, this.width, this.height, time);

    // 3. Foreground overlay (preserved)
    if (this.foregroundImage) {
        this.ctx.drawImage(this.foregroundImage, 0, 0, this.width, this.height);
    }
}
```

#### Parameter Control Integration
The tool integrates with the existing canvas template's control system:
- Uses existing CSS classes for consistent styling
- Leverages FlexibleCanvasManager for sizing and export
- Maintains all background/foreground functionality
- Preserves responsive display scaling

## Tool Architecture

### Integration Approach
The Duplicator tool is built as an **integrated enhancement** to the existing canvas template:

1. **Zero Breaking Changes**: All existing functionality preserved
2. **DuplicatorAnimation Class**: Self-contained duplication engine
3. **UI Integration**: Seamlessly blends with existing control panels
4. **Export Compatibility**: Works with all existing export formats

### Key Features
- **Single File Solution**: Everything contained in start_template.html
- **No Dependencies**: Pure JavaScript implementation
- **Alpha Channel Support**: Full transparency preservation
- **Responsive Design**: Adapts to different screen sizes
- **Professional Export**: PNG, MP4, PNG sequences with metadata

### Design Philosophy
Built specifically for **graphic designers who aren't animators**, the tool focuses on:
- **Simplicity**: Intuitive controls that map to familiar design concepts
- **Power**: Creates complex After Effects-style patterns with simple inputs
- **Integration**: Works within existing design workflows
- **Quality**: Professional-grade export suitable for client work

This focused approach makes complex generative design accessible to designers without requiring animation or coding knowledge.