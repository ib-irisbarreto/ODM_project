// EVENTS MODULE
// Binds mouse, pointer, and button click listeners to execute studio logic.

window.App.Events = {
    // Dynamic palettes using the requested colors and matching variations
    palettes: {
        atelier: {
            solids: ['#1E1E1E', '#DA4914', '#E3CFB5', '#F1E8DE'],
            gradients: [
                { name: 'Tinta Vulcânica', colors: ['#1E1E1E', '#DA4914'] },
                { name: 'Brilho do Pôr do Sol', colors: ['#DA4914', '#E3CFB5'] },
                { name: 'Areia e Creme', colors: ['#E3CFB5', '#F1E8DE'] },
                { name: 'Creme Noir', colors: ['#1E1E1E', '#F1E8DE'] }
            ]
        },
        forest: {
            solids: ['#223326', '#4A6B53', '#8FA895', '#C2D1C6'],
            gradients: [
                { name: 'Sombra da Floresta', colors: ['#223326', '#4A6B53'] },
                { name: 'Musgo e Sálvia', colors: ['#4A6B53', '#8FA895'] },
                { name: 'Sálvia e Creme', colors: ['#8FA895', '#F1E8DE'] },
                { name: 'Floresta Profunda', colors: ['#223326', '#F1E8DE'] }
            ]
        }
    },

    setup: function() {
        const dom = window.App.DOM;
        const drawing = window.App.Drawing;
        const state = window.App.State;
        const pattern = window.App.Pattern;

        // CALIBRATE PIXELS PER MILLIMETER ON STARTUP
        const calibratePixelsPerMm = () => {
            const div = document.createElement('div');
            div.style.width = '1mm';
            div.style.display = 'block';
            document.body.appendChild(div);
            const px = div.getBoundingClientRect().width;
            document.body.removeChild(div);
            state.pixelsPerMm = px || 3.78;
        };
        calibratePixelsPerMm();

        // GENERATE 9x11 GRID CELL ELEMENTS DYNAMICALLY
        const generateGridOverlay = () => {
            const overlay = document.querySelector('.grid-overlay');
            if (!overlay) return;
            overlay.innerHTML = '';
            for (let i = 0; i < 99; i++) {
                overlay.appendChild(document.createElement('div'));
            }
        };
        generateGridOverlay();

        // BRUSH THICKNESS CHANGED
        dom.thicknessInput.addEventListener('input', () => {
            dom.thicknessValue.textContent = `${dom.thicknessInput.value}px`;
        });

        // NATIVE COLOR PICKER INPUTS
        dom.colorInput.addEventListener('input', (e) => {
            if (state.activeColorTarget === 'brush') {
                document.querySelectorAll('#palette-swatches .swatch').forEach(s => s.classList.remove('active'));
                state.brushColor = e.target.value;
                dom.brushColorPreview.style.background = state.brushColor;
            }
        });

        dom.bgColorInput.addEventListener('input', (e) => {
            if (state.activeColorTarget === 'bg') {
                document.querySelectorAll('#palette-swatches .swatch').forEach(s => s.classList.remove('active'));
                state.bgColor = e.target.value;
                dom.bgColorPreview.style.background = state.bgColor;
                dom.drawingCanvas.style.background = state.bgColor;
                pattern.render();
            }
        });

        // APPLY SELECTED SWATCH COLOR TO THE ACTIVE TARGET (BRUSH OR BG)
        const applySelectedColor = (colorVal) => {
            if (state.activeColorTarget === 'brush') {
                state.brushColor = colorVal;
                if (typeof colorVal === 'object' && colorVal.colors) {
                    dom.brushColorPreview.style.background = `linear-gradient(135deg, ${colorVal.colors[0]} 0%, ${colorVal.colors[1]} 100%)`;
                } else {
                    dom.brushColorPreview.style.background = colorVal;
                    dom.colorInput.value = colorVal;
                }
            } else {
                state.bgColor = colorVal;
                if (typeof colorVal === 'object' && colorVal.colors) {
                    dom.bgColorPreview.style.background = `linear-gradient(135deg, ${colorVal.colors[0]} 0%, ${colorVal.colors[1]} 100%)`;
                    dom.drawingCanvas.style.background = `linear-gradient(135deg, ${colorVal.colors[0]} 0%, ${colorVal.colors[1]} 100%)`;
                } else {
                    dom.bgColorPreview.style.background = colorVal;
                    dom.bgColorInput.value = colorVal;
                    dom.drawingCanvas.style.background = colorVal;
                }
                pattern.render();
            }
        };

        // DYNAMICALLY BUILD A SINGLE ROW OF SWATCHES (SOLID & GRADIENTS) FOR SELECTED PALETTE
        const buildSwatches = (paletteName) => {
            const palette = this.palettes[paletteName] || this.palettes.atelier;
            dom.paletteSwatches.innerHTML = '';

            // Render Solid swatches
            palette.solids.forEach(color => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'swatch';
                btn.style.backgroundColor = color;
                btn.title = `Sólido: ${color}`;

                const activeColor = state.activeColorTarget === 'brush' ? state.brushColor : state.bgColor;
                if (activeColor === color) btn.classList.add('active');

                btn.addEventListener('click', () => {
                    document.querySelectorAll('#palette-swatches .swatch').forEach(s => s.classList.remove('active'));
                    btn.classList.add('active');
                    applySelectedColor(color);
                });
                dom.paletteSwatches.appendChild(btn);
            });

            // Render Gradient swatches
            palette.gradients.forEach(grad => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'swatch';
                btn.style.background = `linear-gradient(135deg, ${grad.colors[0]} 0%, ${grad.colors[1]} 100%)`;
                btn.title = `Gradiente: ${grad.name}`;

                const activeColor = state.activeColorTarget === 'brush' ? state.brushColor : state.bgColor;
                if (activeColor && activeColor.name === grad.name) btn.classList.add('active');

                btn.addEventListener('click', () => {
                    document.querySelectorAll('#palette-swatches .swatch').forEach(s => s.classList.remove('active'));
                    btn.classList.add('active');
                    applySelectedColor(grad);
                });
                dom.paletteSwatches.appendChild(btn);
            });
        };

        // ACTIVE COLOR TARGET PICKERS SELECTION
        dom.targetBrush.addEventListener('click', () => {
            if (state.activeColorTarget === 'brush') {
                dom.colorInput.click(); // Open picker if clicked again
            } else {
                state.activeColorTarget = 'brush';
                dom.targetBrush.classList.add('active');
                dom.targetBg.classList.remove('active');
                buildSwatches(dom.paletteSelect.value);
            }
        });

        dom.targetBg.addEventListener('click', () => {
            if (state.activeColorTarget === 'bg') {
                dom.bgColorInput.click(); // Open picker if clicked again
            } else {
                state.activeColorTarget = 'bg';
                dom.targetBg.classList.add('active');
                dom.targetBrush.classList.remove('active');
                buildSwatches(dom.paletteSelect.value);
            }
        });

        // PALETTE SELECTOR DROPDOWN CHANGED
        dom.paletteSelect.addEventListener('change', (e) => {
            buildSwatches(e.target.value);
        });

        // Build swatches for default palette on load
        buildSwatches('atelier');

        // TOOL SELECTION (Grid of Buttons)
        dom.toolButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                dom.toolButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.currentTool = btn.getAttribute('data-tool');
                if (dom.eraserToggle) {
                    dom.eraserToggle.checked = false;
                }
            });
        });

        // ERASER TOGGLE
        if (dom.eraserToggle) {
            dom.eraserToggle.addEventListener('change', () => {
                if (dom.eraserToggle.checked) {
                    if (state.currentTool !== 'eraser') {
                        state.lastDrawingTool = state.currentTool;
                    }
                    state.currentTool = 'eraser';
                    dom.toolButtons.forEach(b => b.classList.remove('active'));
                } else {
                    state.currentTool = state.lastDrawingTool || 'free';
                    dom.toolButtons.forEach(b => {
                        if (b.getAttribute('data-tool') === state.currentTool) {
                            b.classList.add('active');
                        }
                    });
                }
            });
        }

        // UNDO / REDO BUTTONS
        dom.undoBtn.addEventListener('click', () => {
            drawing.undo();
        });

        dom.redoBtn.addEventListener('click', () => {
            drawing.redo();
        });

        // CLEAR DRAWING BUTTON
        dom.clearBtn.addEventListener('click', () => {
            drawing.clear();
        });

        // PRINT BUTTON
        dom.printBtn.addEventListener('click', () => {
            window.print();
        });

        // EXPORT BUTTON
        dom.exportBtn.addEventListener('click', () => {
            pattern.render();

            const link = document.createElement('a');
            link.href = dom.exportCanvas.toDataURL('image/png');
            link.download = `padrao-continuo-${state.selectedResolution.toLowerCase()}.png`;
            link.click();
        });

        // PATTERN DENSITY SLIDER CHANGED
        dom.densityInput.addEventListener('input', (e) => {
            state.patternDensity = parseFloat(e.target.value);
            dom.densityValue.textContent = `${state.patternDensity.toFixed(1)}x`;
            pattern.render();
        });

        // GRID GUIDES TOGGLE
        if (dom.gridGuidesToggle) {
            // Set initial state
            if (state.showGrid) {
                dom.gridGuidesToggle.classList.add('active');
                dom.drawingCanvas.parentElement.classList.add('show-grid');
            } else {
                dom.gridGuidesToggle.classList.remove('active');
                dom.drawingCanvas.parentElement.classList.remove('show-grid');
            }

            dom.gridGuidesToggle.addEventListener('click', () => {
                state.showGrid = !state.showGrid;
                const container = dom.drawingCanvas.parentElement;
                
                if (state.showGrid) {
                    container.classList.add('show-grid');
                    dom.gridGuidesToggle.classList.add('active');
                } else {
                    container.classList.remove('show-grid');
                    dom.gridGuidesToggle.classList.remove('active');
                }
            });
        }

        // RESOLUTION EXPORT SELECTOR CHANGED
        dom.resolutionSelect.addEventListener('change', (e) => {
            state.selectedResolution = e.target.value;
            pattern.render();
        });

        // MODAL PREVIEW EVENTS
        if (dom.openPreviewBtn && dom.previewModal) {
            dom.openPreviewBtn.addEventListener('click', () => {
                dom.previewModal.classList.add('show');
                pattern.render();
            });
        }

        if (dom.modalCloseBtn && dom.previewModal) {
            dom.modalCloseBtn.addEventListener('click', () => {
                dom.previewModal.classList.remove('show');
            });
        }

        if (dom.previewModal) {
            dom.previewModal.addEventListener('click', (e) => {
                if (e.target === dom.previewModal) {
                    dom.previewModal.classList.remove('show');
                }
            });
        }

        // ============================================
        // POINTER DRAWING LOGIC (SUPPORT COALESCED EVENTS)

        const startDrawing = (event) => {
            if (event.cancelable) event.preventDefault();

            dom.drawingCanvas.setPointerCapture(event.pointerId);
            state.drawing = true;

            let point = drawing.getCanvasPosition(event);
            if (state.snapToGrid) {
                point = drawing.snapToGrid(point);
            }
            state.prevPoint = point;

            drawing.saveState();

            if (state.currentTool === 'free' || state.currentTool === 'eraser') {
                drawing.drawLine(state.prevPoint, state.prevPoint, event.pressure || 0.5);
            } else {
                drawing.saveSnapshot();
            }

            pattern.render();
        };

        const continueDrawing = (event) => {
            if (!state.drawing) return;

            const events = typeof event.getCoalescedEvents === 'function'
                ? event.getCoalescedEvents()
                : [event];

            for (const item of events) {
                let point = drawing.getCanvasPosition(item);
                if (state.snapToGrid) {
                    point = drawing.snapToGrid(point);
                }
                const pressure = item.pressure || event.pressure || 0.5;

                if (state.currentTool === 'free' || state.currentTool === 'eraser') {
                    drawing.drawLine(state.prevPoint, point, pressure);
                    state.prevPoint = point;
                } else {
                    drawing.restoreSnapshot();
                    drawing.drawGeoShape(state.prevPoint, point, state.currentTool, pressure);
                }
            }

            pattern.render();
        };

        const endDrawing = (event) => {
            if (event && dom.drawingCanvas.hasPointerCapture(event.pointerId)) {
                dom.drawingCanvas.releasePointerCapture(event.pointerId);
            }

            state.drawing = false;
            state.prevPoint = null;
        };

        // Pointer event registration
        dom.drawingCanvas.addEventListener('pointerdown', startDrawing);
        dom.drawingCanvas.addEventListener('pointermove', continueDrawing);
        dom.drawingCanvas.addEventListener('pointerup', endDrawing);
        dom.drawingCanvas.addEventListener('pointerleave', endDrawing);
        dom.drawingCanvas.addEventListener('pointercancel', endDrawing);
    }
};
