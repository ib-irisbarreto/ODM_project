
// MAIN INITIALIZATION MODULE
// Configures the drawing board resolutions, setups image smoothing filters, and initializes the pattern engine.


document.addEventListener('DOMContentLoaded', () => {
    const app = window.App;
    if (!app || !app.State) {
        console.error("Pattern Studio core modules failed to load.");
        return;
    }

    const dpi = app.State.supersamplingFactor || 4;

    // Set internal resolution of canvases based on display size and supersampling factor (DPI)
    app.DOM.drawingCanvas.width = 405 * dpi;
    app.DOM.drawingCanvas.height = 495 * dpi;

    app.DOM.patternCanvas.width = 880 * dpi;
    app.DOM.patternCanvas.height = 550 * dpi;

    // Apply smoothing overrides for rendering sharpness
    [app.Contexts.drawing, app.Contexts.pattern].forEach(ctx => {
        if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
        }
    });

    // Initialize drawing canvas element styling matching the background color
    app.DOM.drawingCanvas.style.backgroundColor = app.State.bgColor;

    // Run the UI events listeners assignment
    app.Events.setup();

    // Sync baseline thickness indicator text
    app.DOM.thicknessValue.textContent = `${app.DOM.thicknessInput.value}px`;

    // Initialize Undo/Redo button visual states
    app.Drawing.updateUndoRedoButtons();

    // Trigger initial render of the repeating pattern
    app.Pattern.render();
});