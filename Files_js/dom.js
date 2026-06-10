// DOM MODULE (Document Object Model)
// Queries and caches page elements by their IDs and classes, and sets up 2D drawing contexts.

// Canvas elements
window.App.DOM.drawingCanvas = document.getElementById('canvas-drawing');
window.App.DOM.patternCanvas = document.getElementById('canvas-pattern');

// Primary color, background color, and brush thickness inputs
window.App.DOM.colorInput = document.getElementById('color');
window.App.DOM.bgColorInput = document.getElementById('bg-color');
window.App.DOM.thicknessInput = document.getElementById('thickness');
window.App.DOM.thicknessValue = document.getElementById('thickness-value');

// Top color: preview circles
window.App.DOM.brushColorPreview = document.getElementById('brush-color-preview');
window.App.DOM.bgColorPreview = document.getElementById('bg-color-preview');

// Top color: target selection containers
window.App.DOM.targetBrush = document.getElementById('target-brush');
window.App.DOM.targetBg = document.getElementById('target-bg');

// Single palette swatches row
window.App.DOM.paletteSwatches = document.getElementById('palette-swatches');

// Control Buttons
window.App.DOM.undoBtn = document.getElementById('btn-undo');
window.App.DOM.redoBtn = document.getElementById('btn-redo');
window.App.DOM.clearBtn = document.getElementById('btn-clear');
window.App.DOM.exportBtn = document.getElementById('btn-export');
window.App.DOM.printBtn = document.getElementById('btn-print');

// Tool / Shape selectors
window.App.DOM.toolButtons = document.querySelectorAll('.btn-tool[data-tool]');

// Color Palette select dropdown
window.App.DOM.paletteSelect = document.getElementById('palette-select');

// Pattern customization
window.App.DOM.densityInput = document.getElementById('pattern-density');
window.App.DOM.densityValue = document.getElementById('pattern-density-value');
window.App.DOM.gridGuidesToggle = document.getElementById('grid-guides-toggle');
window.App.DOM.eraserToggle = document.getElementById('eraser-toggle');
window.App.DOM.resolutionSelect = document.getElementById('export-resolution');
window.App.DOM.openPreviewBtn = document.getElementById('btn-open-preview');
window.App.DOM.previewModal = document.getElementById('preview-modal');
window.App.DOM.modalCloseBtn = document.getElementById('modal-close');

// Contexts
window.App.Contexts.drawing = window.App.DOM.drawingCanvas.getContext('2d');
window.App.Contexts.pattern = window.App.DOM.patternCanvas.getContext('2d');
