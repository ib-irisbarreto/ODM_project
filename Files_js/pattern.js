
//PATTERN MODULE
//Handles tiling the drawing canvas contents to create seamless repeats on the screen preview and export canvases.


// Create offscreen canvas for high-quality pattern exports
const exportCanvas = document.createElement('canvas');
const exportCtx = exportCanvas.getContext('2d');

window.App.DOM.exportCanvas = exportCanvas;
window.App.Contexts.export = exportCtx;

window.App.Pattern = {

    // Fills a target 2D context canvas with the repeated pattern.
    //Customizes backgrounds, scales, and densities dynamically.

    fill: function (context, canvasWidth, canvasHeight, isExport = false) {
        const state = window.App.State;
        const dom = window.App.DOM;

        // Clear canvas context
        context.clearRect(0, 0, canvasWidth, canvasHeight);

        // Fill solid background color
        context.fillStyle = state.bgColor;
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
    }
};
