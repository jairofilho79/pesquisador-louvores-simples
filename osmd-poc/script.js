/**
 * OSMD Proof of Concept - Main JavaScript
 * Handles OpenSheetMusicDisplay integration and UI interactions
 */

class OSMDProofOfConcept {
    constructor() {
        this.osmd = null;
        this.currentSheet = null;
        this.isLoading = false;
        
        // DOM element references
        this.elements = {
            sheetSelect: document.getElementById('sheet-select'),
            renderBtn: document.getElementById('render-btn'),
            clearBtn: document.getElementById('clear-btn'),
            loading: document.getElementById('loading'),
            error: document.getElementById('error'),
            errorMessage: document.getElementById('error-message'),
            osmdContainer: document.getElementById('osmd-container'),
            sheetInfo: document.getElementById('sheet-info')
        };

        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        console.log('Initializing OSMD Proof of Concept...');
        
        // Wait for OSMD library to load
        this.waitForOSMD().then(() => {
            this.setupEventListeners();
            this.setupOSMD();
            console.log('OSMD PoC ready!');
        }).catch(error => {
            this.showError('Failed to load OpenSheetMusicDisplay library', error);
        });
    }

    /**
     * Wait for OSMD library to be available
     */
    waitForOSMD() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50;
            
            const checkOSMD = () => {
                attempts++;
                
                if (typeof opensheetmusicdisplay !== 'undefined') {
                    resolve();
                } else if (attempts >= maxAttempts) {
                    reject(new Error('OSMD library failed to load'));
                } else {
                    setTimeout(checkOSMD, 100);
                }
            };
            
            checkOSMD();
        });
    }

    /**
     * Setup event listeners for UI interactions
     */
    setupEventListeners() {
        // Sheet selection change
        this.elements.sheetSelect.addEventListener('change', (e) => {
            const selectedValue = e.target.value;
            this.elements.renderBtn.disabled = !selectedValue;
            
            if (selectedValue) {
                this.updateSheetInfo(selectedValue);
            } else {
                this.clearSheetInfo();
            }
        });

        // Render button click
        this.elements.renderBtn.addEventListener('click', () => {
            const selectedSheet = this.elements.sheetSelect.value;
            if (selectedSheet) {
                this.renderSheet(selectedSheet);
            }
        });

        // Clear button click
        this.elements.clearBtn.addEventListener('click', () => {
            this.clearSheet();
        });

        // Window resize handler for responsive design
        window.addEventListener('resize', () => {
            if (this.osmd && this.currentSheet) {
                // Debounce resize to avoid too many re-renders
                clearTimeout(this.resizeTimeout);
                this.resizeTimeout = setTimeout(() => {
                    this.handleResize();
                }, 300);
            }
        });

        console.log('Event listeners setup complete');
    }

    /**
     * Setup OSMD instance with optimal configuration
     */
    setupOSMD() {
        try {
            // Clear any existing content
            this.elements.osmdContainer.innerHTML = '<div class="placeholder"><div class="placeholder-icon">🎼</div><h3>No sheet selected</h3><p>Choose a sample music sheet from the dropdown above to begin</p></div>';

            // OSMD configuration for optimal display
            const osmdOptions = {
                autoResize: true,
                backend: 'svg',
                drawTitle: true,
                drawSubtitle: false,
                drawComposer: true,
                drawCredits: false,
                drawPartNames: true,
                coloringEnabled: true,
                defaultColorNotehead: '#1f77b4',
                defaultColorRest: '#d62728',
                defaultColorStem: '#2ca02c',
                followCursor: false,
                cursorsOptions: [{
                    type: 0, // VexFlow cursor
                    color: '#33e02f',
                    alpha: 0.7
                }]
            };

            // Initialize OSMD
            this.osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay(this.elements.osmdContainer, osmdOptions);
            
            console.log('OSMD instance created successfully');
        } catch (error) {
            console.error('Failed to setup OSMD:', error);
            this.showError('Failed to initialize OpenSheetMusicDisplay', error);
        }
    }

    /**
     * Render a music sheet from the sample data
     */
    async renderSheet(sheetKey) {
        if (this.isLoading) {
            console.log('Already loading a sheet, ignoring request');
            return;
        }

        try {
            this.setLoading(true);
            this.hideError();

            // Get sheet data
            const sheetData = window.SAMPLE_MUSICXML[sheetKey];
            if (!sheetData) {
                throw new Error(`Sheet data not found for key: ${sheetKey}`);
            }

            console.log(`Rendering sheet: ${sheetData.title}`);

            // Load the MusicXML
            await this.osmd.load(sheetData.xml);
            
            // Configure rendering options based on container size
            this.configureRenderingOptions();
            
            // Render the sheet
            this.osmd.render();

            // Update UI state
            this.currentSheet = sheetKey;
            this.elements.clearBtn.disabled = false;
            this.elements.osmdContainer.classList.add('osmd-loaded');
            this.elements.osmdContainer.classList.add('fade-in');

            // Update info panel
            this.updateSheetInfo(sheetKey);

            console.log('Sheet rendered successfully');

        } catch (error) {
            console.error('Failed to render sheet:', error);
            this.showError('Failed to render music sheet', error);
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Configure rendering options based on container size and content
     */
    configureRenderingOptions() {
        if (!this.osmd) return;

        const containerWidth = this.elements.osmdContainer.clientWidth;
        const containerHeight = this.elements.osmdContainer.clientHeight;

        // Adjust zoom based on container size
        let zoom = 1.0;
        if (containerWidth < 600) {
            zoom = 0.7; // Smaller zoom for mobile
        } else if (containerWidth < 900) {
            zoom = 0.85; // Medium zoom for tablets
        }

        try {
            this.osmd.Zoom = zoom;
            console.log(`Applied zoom: ${zoom} for container width: ${containerWidth}px`);
        } catch (error) {
            console.warn('Could not set zoom level:', error);
        }
    }

    /**
     * Handle window resize events
     */
    handleResize() {
        if (!this.osmd || !this.currentSheet) return;

        try {
            console.log('Handling resize event');
            
            // Clear and re-render with new dimensions
            this.osmd.clear();
            this.configureRenderingOptions();
            this.osmd.render();
            
        } catch (error) {
            console.error('Error handling resize:', error);
        }
    }

    /**
     * Clear the current sheet display
     */
    clearSheet() {
        try {
            if (this.osmd) {
                this.osmd.clear();
            }

            // Reset UI state
            this.currentSheet = null;
            this.elements.clearBtn.disabled = true;
            this.elements.sheetSelect.value = '';
            this.elements.renderBtn.disabled = true;
            this.elements.osmdContainer.classList.remove('osmd-loaded', 'fade-in');

            // Restore placeholder
            this.elements.osmdContainer.innerHTML = '<div class="placeholder"><div class="placeholder-icon">🎼</div><h3>No sheet selected</h3><p>Choose a sample music sheet from the dropdown above to begin</p></div>';

            // Clear info panel
            this.clearSheetInfo();

            console.log('Sheet cleared successfully');

        } catch (error) {
            console.error('Error clearing sheet:', error);
            this.showError('Error clearing sheet', error);
        }
    }

    /**
     * Update the sheet information panel
     */
    updateSheetInfo(sheetKey) {
        const sheetData = window.SAMPLE_MUSICXML[sheetKey];
        if (!sheetData) return;

        this.elements.sheetInfo.innerHTML = `
            <p><strong>Title:</strong> ${sheetData.title}</p>
            <p><strong>Description:</strong> ${sheetData.description}</p>
            <p><strong>Complexity:</strong> ${sheetData.complexity}</p>
            <p><strong>Musical Elements:</strong></p>
            <ul style="margin-left: 20px; line-height: 1.6;">
                ${sheetData.elements.map(element => `<li>${element}</li>`).join('')}
            </ul>
        `;
    }

    /**
     * Clear the sheet information panel
     */
    clearSheetInfo() {
        this.elements.sheetInfo.innerHTML = '<p>Select a sheet to view details</p>';
    }

    /**
     * Show loading state
     */
    setLoading(loading) {
        this.isLoading = loading;
        
        if (loading) {
            this.elements.loading.classList.remove('hidden');
            this.elements.renderBtn.disabled = true;
        } else {
            this.elements.loading.classList.add('hidden');
            this.elements.renderBtn.disabled = !this.elements.sheetSelect.value;
        }
    }

    /**
     * Show error message
     */
    showError(message, error = null) {
        console.error(message, error);
        
        this.elements.errorMessage.textContent = message;
        if (error && error.message) {
            this.elements.errorMessage.textContent += `: ${error.message}`;
        }
        
        this.elements.error.classList.remove('hidden');
        
        // Auto-hide error after 5 seconds
        setTimeout(() => {
            this.hideError();
        }, 5000);
    }

    /**
     * Hide error message
     */
    hideError() {
        this.elements.error.classList.add('hidden');
    }

    /**
     * Get current application state for debugging
     */
    getState() {
        return {
            hasOSMD: !!this.osmd,
            currentSheet: this.currentSheet,
            isLoading: this.isLoading,
            containerDimensions: {
                width: this.elements.osmdContainer.clientWidth,
                height: this.elements.osmdContainer.clientHeight
            },
            availableSheets: Object.keys(window.SAMPLE_MUSICXML || {})
        };
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, checking for dependencies...');
    
    // Load sample data first
    const script = document.createElement('script');
    script.src = 'samples/musicxml-samples.js';
    script.onload = () => {
        console.log('Sample data loaded, initializing PoC...');
        window.osmdPoc = new OSMDProofOfConcept();
    };
    script.onerror = () => {
        console.error('Failed to load sample data');
        document.getElementById('error-message').textContent = 'Failed to load sample MusicXML data';
        document.getElementById('error').classList.remove('hidden');
    };
    
    document.head.appendChild(script);
});

// Expose utilities for debugging
window.OSMDDebug = {
    getState: () => window.osmdPoc ? window.osmdPoc.getState() : null,
    clearSheet: () => window.osmdPoc ? window.osmdPoc.clearSheet() : null,
    renderSheet: (key) => window.osmdPoc ? window.osmdPoc.renderSheet(key) : null
};