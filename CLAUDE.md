# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Duplicator is a generative design tool for graphic designers who aren't animators. Built with HTML5 Canvas, it creates After Effects-style "repeater" effects by duplicating uploaded images or custom text with cumulative transformations and optional sine wave animations. The tool features dual modes (Image and Text) and enables designers to create complex spiral, tunnel, and wave patterns with simple parameter controls.

## Quick Start

### Using the Tool
```bash
# Open the Duplicator tool directly in browser (works immediately)
open index.html

# Alternative: For ES6 module development, serve with local server
python -m http.server 8000
# Then navigate to http://localhost:8000
```

### Basic Workflow
1. **Choose your mode**:
   - **Image Mode**: Upload an image (JPEG/PNG with alpha support)
   - **Text Mode**: Enter custom text with font selection
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
├── index.html                    # Main HTML file with UI structure
├── js/                           # JavaScript modules
│   ├── main.js                   # Application entry point (ES6 modules)
│   ├── CanvasManager.js          # Canvas management and event handling (ES6 modules)
│   ├── DuplicatorAnimation.js    # Core duplication engine (ES6 modules)
│   └── duplicator-combined.js    # Combined file for direct browser use
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
- **Mode System**: Dual-mode interface (Image Mode / Text Mode) with tab switching
- **Export System**: Integrated PNG, MP4, and PNG sequence export with alpha support
- **UI Controls**: Real-time parameter adjustment with visual feedback

#### Duplication System
- **Image Mode**: FileReader API for JPEG/PNG with transparency support
- **Text Mode**: Direct text rendering with multiple font families and variable font weights
- **Cumulative Transformations**: Each duplicate builds upon the previous transformation
- **Vector-like Text Rendering**: Text renders crisp at all scales without pixelation
- **Animation Engine**: Sine wave modulation with time-offset delays
- **Export Integration**: Works seamlessly with all export formats

## Development Guide

### Understanding the Duplicator Engine

#### Core Concepts
The Duplicator tool works by creating multiple copies of an uploaded image or custom text, where each copy has **cumulative transformations** applied:

1. **Copy 0**: Original position/scale/rotation
2. **Copy 1**: Original + 1× offset values
3. **Copy 2**: Original + 2× offset values
4. **Copy N**: Original + N× offset values

This creates exponential patterns like spirals, tunnels, and waves.

#### Mode System
The tool features two distinct modes:
- **Image Mode**: Traditional image upload and duplication with image size controls
- **Text Mode**: Text input with font selection, weight, size, and color controls
- **Priority System**: When both image and text are present, image takes precedence

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

        // Text parameters
        this.textContent = '';         // Text input content
        this.fontSize = 48;            // Base font size
        this.fontWeight = 400;         // Font weight (400-800 for variable fonts)
        this.textColor = '#ffffff';    // Text color
        this.fontFamily = 'Wix Madefor Display'; // Selected font family

        // Multi-parameter animation system
        this.animations = {
            scale: { enabled: false, frequency: 1.0, amplitude: 50 },
            rotation: { enabled: false, frequency: 1.0, amplitude: 50 },
            positionX: { enabled: false, frequency: 1.0, amplitude: 50 },
            positionY: { enabled: false, frequency: 1.0, amplitude: 50 }
        };
        this.timeOffset = 5;           // Frame delay between duplicates
    }
}
```

#### Parameter Effects
- **Scale Offset**: `Math.pow(1 + scaleOffset, i)` - Creates growing/shrinking tunnels
- **Rotation Offset**: `rotationOffset * i` - Creates spirals
- **Position Offsets**: `basePosition + offset * i` - Creates linear arrangements
- **Animation**: Sine wave modulation on selected property with time delays

### Creating Patterns

#### Font Support in Text Mode
- **Wix Madefor Display**: Variable font (400-800 weight range)
- **Inter**: Variable font (400-700 weight range)
- **Roboto**: Standard weights (300, 400, 500, 700)
- **Playfair Display**: Serif font (400, 500, 600, 700)
- **Space Mono**: Monospace font (400, 700)

#### Text Mode Advantages
- **Vector-like Quality**: Text renders crisp at all scales without pixelation
- **Font Size Control**: Font size acts as the "asset size" (no separate image size needed)
- **Typography Flexibility**: Multiple fonts and variable font weight support
- **Multi-line Support**: Text automatically handles line breaks

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
#### Logo Multiplication (Image Mode)
1. Upload your logo (PNG with transparency)
2. Set duplicates to 8-12
3. Apply small rotation offset (10-20°)
4. Add subtle position offsets (5-10px)
5. Export as PNG for use in presentations

#### Typography Effects (Text Mode)
1. Switch to Text Mode tab
2. Enter your text (supports multi-line)
3. Select appropriate font (Wix Madefor for variable weights)
4. Adjust font size and weight
5. Apply transformation patterns for dynamic text effects
6. Export as PNG or MP4 for motion graphics

#### Pattern Generation
1. Choose mode (Image: upload shape/icon, Text: enter text)
2. High duplicate count (30-50)
3. Combine rotation + scale offsets for complex patterns
4. Use PNG sequence export for After Effects

#### Motion Graphics Preview
1. Set up your asset (Image Mode: upload, Text Mode: enter text)
2. Configure desired transformation pattern
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

    // 2. Duplicator animation (supports both image and text)
    const time = Date.now() * 0.001;
    this.duplicatorAnimation.render(this.ctx, this.width, this.height, time);

    // 3. Foreground overlay (preserved)
    if (this.foregroundImage) {
        this.ctx.drawImage(this.foregroundImage, 0, 0, this.width, this.height);
    }
}
```

#### Text Rendering Implementation
The tool uses direct text rendering for crisp quality:
```javascript
renderTextDirect(ctx, scale) {
    // Calculate scaled font size for vector-like quality
    const scaledFontSize = this.fontSize * scale;

    // Apply font family and weight
    ctx.font = `${this.fontWeight} ${scaledFontSize}px '${this.fontFamily}'`;
    ctx.fillStyle = this.textColor;

    // Render each line with proper spacing
    const lines = this.textContent.split('\n');
    const lineHeight = scaledFontSize * 1.2;
    // ... render each line
}
```

#### Parameter Control Integration
The tool integrates with the existing canvas template's control system:
- **Tab System**: Clean mode switching between Image and Text modes
- **Font Integration**: Google Fonts loaded with variable font support
- **CSS Consistency**: Uses existing classes for consistent styling
- **Canvas Manager**: Leverages FlexibleCanvasManager for sizing and export
- **Legacy Support**: Maintains all background/foreground functionality
- **Responsive Design**: Preserves responsive display scaling

## Tool Architecture

### Integration Approach
The Duplicator tool is built as an **integrated enhancement** to the existing canvas template:

1. **Zero Breaking Changes**: All existing functionality preserved
2. **DuplicatorAnimation Class**: Self-contained duplication engine
3. **UI Integration**: Seamlessly blends with existing control panels
4. **Export Compatibility**: Works with all existing export formats

### Key Features
- **Dual Mode System**: Image Mode and Text Mode with clean tab interface
- **Vector-like Text**: Direct text rendering prevents pixelation at any scale
- **Variable Font Support**: Full support for Wix Madefor Display and Inter variable fonts
- **Multi-font Library**: 5 different fonts with appropriate weight ranges
- **Dual Architecture**: Both modular ES6 and combined approaches supported
- **Direct Browser Use**: Works immediately without server setup
- **Alpha Channel Support**: Full transparency preservation in both modes
- **Responsive Design**: Adapts to different screen sizes
- **Professional Export**: PNG, MP4, PNG sequences with metadata

### Architecture Approaches

#### Production Use (Default)
- Uses `duplicator-combined.js` for immediate browser compatibility
- No server required, works with `file://` protocol
- Single JavaScript file with all functionality
- Perfect for end users and distribution

#### Development Use (Optional)
- Switch to ES6 modules by editing `index.html`
- Change script tag to: `<script type="module" src="js/main.js"></script>`
- Requires local server for CORS compliance
- Clean modular structure for development and maintenance

### Design Philosophy
Built specifically for **graphic designers who aren't animators**, the tool focuses on:
- **Versatility**: Dual-mode system handles both images and typography
- **Simplicity**: Intuitive tab interface and controls that map to familiar design concepts
- **Quality**: Vector-like text rendering and professional image handling
- **Power**: Creates complex After Effects-style patterns with simple inputs
- **Typography**: Full variable font support for modern design workflows
- **Integration**: Works within existing design workflows
- **Professional Output**: Export suitable for client work and production

This focused approach makes complex generative design accessible to designers without requiring animation or coding knowledge, while providing advanced typography capabilities for modern design needs.