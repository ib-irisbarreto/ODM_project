
//PATTERN MODULE
//Handles tiling the drawing canvas contents to create seamless repeats on the screen preview and export canvases.


// Create offscreen canvas for high-quality pattern exports
const exportCanvas = document.createElement('canvas');
const exportCtx = exportCanvas.getContext('2d');

window.App.DOM.exportCanvas = exportCanvas;
window.App.Contexts.export = exportCtx;

window.App.Pattern = {

    // Helper to resolve either a solid hex string or gradient background object to a canvas fillStyle
    resolveBgStyle: function (context, width, height) {
        const state = window.App.State;
        if (typeof state.bgColor === 'object' && state.bgColor.colors) {
            const grad = context.createLinearGradient(0, 0, width, height);
            grad.addColorStop(0, state.bgColor.colors[0]);
            grad.addColorStop(1, state.bgColor.colors[1]);
            return grad;
        }
        return state.bgColor;
    },

    // Fills a target 2D context canvas with the repeated pattern.
    //Customizes backgrounds, scales, and densities dynamically.

    fill: function (context, canvasWidth, canvasHeight, isExport = false) {
        const state = window.App.State;
        const dom = window.App.DOM;

        // Clear canvas context
        context.clearRect(0, 0, canvasWidth, canvasHeight);

        // Fill solid/gradient background color
        context.fillStyle = this.resolveBgStyle(context, canvasWidth, canvasHeight);
        context.fillRect(0, 0, canvasWidth, canvasHeight);

        // Create repeat pattern from the drawing canvas
        const pattern = context.createPattern(dom.drawingCanvas, 'repeat');

        if (pattern) {
            // Apply scale transformation to match the configured pattern density
            if (typeof DOMMatrix !== 'undefined') {
                const density = state.patternDensity || 3;
                const tileWidth = canvasWidth / density;
                const scaleAdjust = tileWidth / dom.drawingCanvas.width;

                pattern.setTransform(new DOMMatrix().scale(scaleAdjust, scaleAdjust));
            }

            context.fillStyle = pattern;
            context.fillRect(0, 0, canvasWidth, canvasHeight);
        }
    },

    //Re-renders both the on-screen preview pattern and offscreen HD export buffer.

    render: function () {
        const dom = window.App.DOM;
        const contexts = window.App.Contexts;
        const state = window.App.State;

        if (!dom.drawingCanvas || !dom.patternCanvas) return;

        // Draw screen preview pattern
        this.fill(contexts.pattern, dom.patternCanvas.width, dom.patternCanvas.height, false);

        // Draw high quality export buffer
        const selectedRes = state.resolutions[state.selectedResolution] || state.resolutions['4K'];

        dom.exportCanvas.width = selectedRes.width;
        dom.exportCanvas.height = selectedRes.height;

        contexts.export.imageSmoothingEnabled = true;
        contexts.export.imageSmoothingQuality = 'high';

        this.fill(contexts.export, dom.exportCanvas.width, dom.exportCanvas.height, true);
    },

    // Renders the repeating pattern onto the high-resolution flyer print canvas
    renderPrintCanvas: function () {
        const state = window.App.State;
        const dom = window.App.DOM;
        const canvas = document.getElementById('canvas-print-page1');
        if (!canvas) return;

        const context = canvas.getContext('2d');
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';

        // Clear canvas context
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Fill solid/gradient background color
        context.fillStyle = this.resolveBgStyle(context, canvas.width, canvas.height);
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Create repeat pattern from the drawing canvas
        const pattern = context.createPattern(dom.drawingCanvas, 'repeat');

        if (pattern) {
            const density = state.patternDensity || 3;
            // Match the horizontal density exactly
            const tileWidth = canvas.width / density;
            const scaleAdjust = tileWidth / dom.drawingCanvas.width;

            if (typeof DOMMatrix !== 'undefined') {
                pattern.setTransform(new DOMMatrix().scale(scaleAdjust, scaleAdjust));
            }

            context.fillStyle = pattern;
            context.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Overlay the flyer image on top
        if (window.App.Assets && window.App.Assets.folheto01) {
            context.drawImage(window.App.Assets.folheto01, 0, 0, canvas.width, canvas.height);
        }
    }
};
