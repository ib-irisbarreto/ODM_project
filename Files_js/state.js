// STATE MODULE (Application State & Configuration)
// Manages runtime variables, drawing histories, and user settings.

window.App.State = {
    // DYNAMIC STATE
    drawing: false,          // True if the user is actively drawing
    prevPoint: null,         // Remembers the last {x, y} coordinate
    currentTool: 'free',     // Active tool: 'free', 'line', 'rectangle', 'circle', 'eraser'
    drawingSnapshot: null,   // Saves screen state during geometric drag operations
    
    // UNDO / REDO SYSTEM 
    undoStack: [],           // Stores previous canvas states
    redoStack: [],           // Stores undone canvas states
    maxUndoDepth: 20,        // Max undo history limit
    
    // COLOR PALETTE SYSTEM (Colors requested: #1E1E1E, #DA4914, #E3CFB5, #F1E8DE)
    brushColor: '#1E1E1E',   // Active brush: can be hex string or gradient object
    bgColor: '#F1E8DE',      // Active background: can be hex string or gradient object
    activeColorTarget: 'brush', // Current selected target for palette swatches: 'brush' or 'bg'
    
    brushPresets: {
        solids: ['#1E1E1E', '#DA4914', '#E3CFB5', '#F1E8DE'],
        gradients: [
            { name: 'Tinta Vulcânica', colors: ['#1E1E1E', '#DA4914'] },
            { name: 'Brilho do Pôr do Sol', colors: ['#DA4914', '#E3CFB5'] },
            { name: 'Areia e Creme', colors: ['#E3CFB5', '#F1E8DE'] },
            { name: 'Creme Noir', colors: ['#1E1E1E', '#F1E8DE'] }
        ]
    },
    
    bgPresets: {
        solids: ['#ffffff', '#F1E8DE', '#E3CFB5', '#1E1E1E'],
        gradients: [
            { name: 'Gradiente Quente', colors: ['#F1E8DE', '#E3CFB5'] },
            { name: 'Gradiente da Marca', colors: ['#DA4914', '#F1E8DE'] },
            { name: 'Gradiente de Contraste', colors: ['#E3CFB5', '#1E1E1E'] },
            { name: 'Explosão Vulcânica', colors: ['#1E1E1E', '#DA4914'] }
        ]
    },

    // CANVAS SETTINGS
    showGrid: true,          // Renders visual alignment grid lines on the drawing canvas
    snapToGrid: false,       // Snap to grid is disabled (button removed from UI)
    supersamplingFactor: 4,  // High quality drawing factor
    patternDensity: 3,       // Number of repeats horizontally

    // QUALITY SCALING
    get qualityScale() {
        const canvas = window.App.DOM.drawingCanvas;
        // Base coordinate size for 9:11 drawing canvas is 405 width
        return canvas.width / (canvas.clientWidth || 405);
    },

    // PRINT / EXPORT RESOLUTIONS
    resolutions: {
        '4K': { width: 3840, height: 2160 },
        '8K': { width: 7680, height: 4320 },
        '1080p': { width: 1920, height: 1080 }
    },
    selectedResolution: '4K'
};
