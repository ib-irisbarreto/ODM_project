// DRAWING MODULE
// Handles canvas drawing operations, brush styles, shapes, and the undo/redo stack.

window.App.Drawing = {
    // Configures the 2D context drawing style (thickness, composite operations, colors).
    configureBrushStyle: function(pressure = 0.5) {
        const ctx = window.App.Contexts.drawing;
        const state = window.App.State;
        const thickness = Number(window.App.DOM.thicknessInput.value);

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const pressureMultiplier = Number.isFinite(pressure) ? Math.max(0.35, pressure) : 1;
        ctx.lineWidth = thickness * state.qualityScale * pressureMultiplier;

        if (state.currentTool === 'eraser') {
            // Eraser creates transparent pixels
            ctx.globalCompositeOperation = 'destination-out';
            ctx.strokeStyle = 'rgba(0,0,0,1)';
        } else {
            ctx.globalCompositeOperation = 'source-over';
            
            // Check if current brush color is a gradient object
            if (typeof state.brushColor === 'object' && state.brushColor.colors) {
                const canvas = window.App.DOM.drawingCanvas;
                const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                grad.addColorStop(0, state.brushColor.colors[0]);
                grad.addColorStop(1, state.brushColor.colors[1]);
                ctx.strokeStyle = grad;
            } else {
                ctx.strokeStyle = state.brushColor;
            }
        }
    },

    // Resolves the pointer position in canvas internal coordinates.
    getCanvasPosition: function(event) {
        const rect = window.App.DOM.drawingCanvas.getBoundingClientRect();
        const scaleX = window.App.DOM.drawingCanvas.width / rect.width;
        const scaleY = window.App.DOM.drawingCanvas.height / rect.height;

        return {
            x: (event.clientX - rect.left) * scaleX,
            y: (event.clientY - rect.top) * scaleY
        };
    },

    // Snaps coordinate point to the nearest 9x11 grid cell boundary lines
    snapToGrid: function(point) {
        const state = window.App.State;
        if (!state.snapToGrid) return point;

        // Obtain pixel-per-mm density scale measured at startup
        const pxPerMm = state.pixelsPerMm || 3.78;
        const marginDisplay = 5 * pxPerMm;
        const gutterDisplay = 5 * pxPerMm;

        const canvas = window.App.DOM.drawingCanvas;
        const scale = state.qualityScale;

        // Convert display scale measurements to internal canvas coordinates
        const marginInt = marginDisplay * scale;
        const gutterInt = gutterDisplay * scale;

        const colWidthInt = (canvas.width - 2 * marginInt - 8 * gutterInt) / 9;
        const rowHeightInt = (canvas.height - 2 * marginInt - 10 * gutterInt) / 11;

        // Collect grid border snapping coordinates
        const xLines = [0, canvas.width];
        for (let i = 0; i < 9; i++) {
            const left = marginInt + i * (colWidthInt + gutterInt);
            const right = left + colWidthInt;
            xLines.push(left, right);
        }

        const yLines = [0, canvas.height];
        for (let j = 0; j < 11; j++) {
            const top = marginInt + j * (rowHeightInt + gutterInt);
            const bottom = top + rowHeightInt;
            yLines.push(top, bottom);
        }

        // Apply snapping threshold of 14 display pixels
        const threshold = 14 * scale;
        let snappedX = point.x;
        let snappedY = point.y;

        let minDiffX = Infinity;
        for (const x of xLines) {
            const diff = Math.abs(point.x - x);
            if (diff < minDiffX && diff < threshold) {
                minDiffX = diff;
                snappedX = x;
            }
        }

        let minDiffY = Infinity;
        for (const y of yLines) {
            const diff = Math.abs(point.y - y);
            if (diff < minDiffY && diff < threshold) {
                minDiffY = diff;
                snappedY = y;
            }
        }

        return { x: snappedX, y: snappedY };
    },

    // Draws a freehand stroke between two points.
    drawLine: function(start, end, pressure = 0.5) {
        const ctx = window.App.Contexts.drawing;
        this.configureBrushStyle(pressure);

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
    },

    // Saves the current canvas drawing pixels as a temporary snapshot (used during shape drag preview).
    saveSnapshot: function() {
        const ctx = window.App.Contexts.drawing;
        const canvas = window.App.DOM.drawingCanvas;
        window.App.State.drawingSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    },

    // Restores the temporary snapshot.
    restoreSnapshot: function() {
        const ctx = window.App.Contexts.drawing;
        if (window.App.State.drawingSnapshot) {
            ctx.putImageData(window.App.State.drawingSnapshot, 0, 0);
        }
    },

    // Draws a geometric shape (line, rectangle, or circle) from start to end coordinates.
    drawGeoShape: function(start, end, tool, pressure = 0.5) {
        const ctx = window.App.Contexts.drawing;
        this.configureBrushStyle(pressure);
        ctx.beginPath();

        if (tool === 'line') {
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
        } else if (tool === 'rectangle') {
            const width = end.x - start.x;
            const height = end.y - start.y;
            ctx.rect(start.x, start.y, width, height);
        } else if (tool === 'triangle') {
            ctx.moveTo((start.x + end.x) / 2, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.lineTo(start.x, end.y);
            ctx.closePath();
        } else if (tool === 'circle') {
            const radius = Math.hypot(end.x - start.x, end.y - start.y);
            ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
        }

        ctx.stroke();
    },

    // Clears the drawing board and resets the undo/redo stack.
    clear: function() {
        const ctx = window.App.Contexts.drawing;
        const canvas = window.App.DOM.drawingCanvas;
        const state = window.App.State;

        // Clear all pixels (canvas becomes transparent)
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Reset stacks
        state.undoStack = [];
        state.redoStack = [];
        this.updateUndoRedoButtons();

        window.App.Pattern.render();
    },

    // --- UNDO / REDO CONTROLS ---

    // Pushes the current canvas image state onto the undo stack.
    saveState: function() {
        const ctx = window.App.Contexts.drawing;
        const canvas = window.App.DOM.drawingCanvas;
        const state = window.App.State;

        state.undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        if (state.undoStack.length > state.maxUndoDepth) {
            state.undoStack.shift();
        }
        // Wipe redo stack on new action
        state.redoStack = [];
        this.updateUndoRedoButtons();
    },

    // Reverts to the previous drawing state.
    undo: function() {
        const state = window.App.State;
        if (state.undoStack.length === 0) return;

        const ctx = window.App.Contexts.drawing;
        const canvas = window.App.DOM.drawingCanvas;

        // Push current state to redo stack
        state.redoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));

        // Restore previous state
        const prevState = state.undoStack.pop();
        ctx.putImageData(prevState, 0, 0);

        window.App.Pattern.render();
        this.updateUndoRedoButtons();
    },

    // Re-applies an undone drawing state.
    redo: function() {
        const state = window.App.State;
        if (state.redoStack.length === 0) return;

        const ctx = window.App.Contexts.drawing;
        const canvas = window.App.DOM.drawingCanvas;

        // Push current state to undo stack
        state.undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));

        // Restore next state
        const nextState = state.redoStack.pop();
        ctx.putImageData(nextState, 0, 0);

        window.App.Pattern.render();
        this.updateUndoRedoButtons();
    },

    // Updates the disabled state of undo/redo buttons.
    updateUndoRedoButtons: function() {
        const state = window.App.State;
        const dom = window.App.DOM;

        if (dom.undoBtn) {
            dom.undoBtn.disabled = state.undoStack.length === 0;
        }
        if (dom.redoBtn) {
            dom.redoBtn.disabled = state.redoStack.length === 0;
        }
    }
};
