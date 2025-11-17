class BeaconScannerApp {
    constructor() {
        this.scanner = new QRScanner();
        this.currentMacAddress = null;
        
        // Initialize DOM elements
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.resultsContainer = document.getElementById('resultsContainer');
        this.errorContainer = document.getElementById('errorContainer');
        this.macAddressElement = document.getElementById('macAddress');
        this.errorMessage = document.getElementById('errorMessage');
        this.copyFeedback = document.getElementById('copyFeedback');
        this.cameraContainer = document.getElementById('cameraContainer');
        
        this.initializeEventListeners();
        this.checkCompatibility();
    }

    initializeEventListeners() {
        // Scanner event handlers
        this.scanner.onQRCodeDetected = (macAddress) => {
            this.handleMACAddressDetected(macAddress);
        };

        this.scanner.onError = (error) => {
            this.showError(error);
        };

        // Button event listeners
        this.startBtn.addEventListener('click', () => this.startScanning());
        this.stopBtn.addEventListener('click', () => this.stopScanning());
        this.copyBtn.addEventListener('click', () => this.copyMACAddress());

        // Handle page visibility changes (pause scanning when app is hidden)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.scanner.scanning) {
                this.pauseScanning();
            } else if (!document.hidden && this.wasPaused) {
                this.resumeScanning();
            }
        });
    }

    async checkCompatibility() {
        if (!QRScanner.isSupported()) {
            this.showError('Your browser does not support camera access or QR code scanning. Please use a modern mobile browser.');
            this.startBtn.disabled = true;
            return;
        }

        if (!clipboardManager.isClipboardSupported()) {
            console.warn('Clipboard functionality may not be available');
        }

        // Check detailed camera support
        try {
            const support = await QRScanner.checkCameraSupport();
            console.log('Camera support details:', support);
            
            if (support.cameras.length === 0) {
                this.showError('No cameras detected. Please ensure your device has a camera and try again.');
                this.startBtn.disabled = true;
                return;
            }
        } catch (error) {
            console.warn('Could not check camera support:', error);
        }

        this.showCameraPlaceholder();
    }

    showCameraPlaceholder() {
        this.cameraContainer.innerHTML = `
            <div class="camera-placeholder">
                <div class="icon">📷</div>
                <p><strong>Camera Ready</strong></p>
                <p>Tap "Start Scanner" to begin scanning QR codes</p>
            </div>
        `;
    }

    async startScanning() {
        try {
            this.hideError();
            this.hideResults();
            
            // Update button states
            this.startBtn.style.display = 'none';
            this.stopBtn.style.display = 'inline-block';
            this.startBtn.disabled = true;

            // Show loading state
            this.stopBtn.innerHTML = '<span class="loading-spinner"></span> Initializing Camera...';

            // Ensure video element exists and is connected
            let videoElement = document.getElementById('qrVideo');
            if (!videoElement) {
                console.log('Restoring camera container...');
                this.restoreCameraContainer();
                videoElement = document.getElementById('qrVideo');
            }
            
            if (!videoElement) {
                throw new Error('Could not create video element');
            }

            // Make sure scanner has the video element
            this.scanner.video = videoElement;
            console.log('Video element ready:', videoElement);

            // Request camera permission and start scanning
            this.stopBtn.innerHTML = '<span class="loading-spinner"></span> Requesting Camera...';
            
            const cameraInitialized = await this.scanner.requestCameraPermission();
            
            if (!cameraInitialized) {
                throw new Error('Failed to initialize camera');
            }
            
            // Update button to show camera is loading
            this.stopBtn.innerHTML = '<span class="loading-spinner"></span> Starting Scanner...';
            
            // Small delay to ensure video stream is ready
            setTimeout(() => {
                console.log('Starting scan loop...');
                this.scanner.startScanning();
                
                // Update stop button
                this.stopBtn.innerHTML = 'Stop Scanner';
                
                console.log('Scanning started successfully');
            }, 1000);

        } catch (error) {
            console.error('Failed to start scanning:', error);
            this.showError(error.message || 'Failed to access camera. Please check permissions and try again.');
            this.resetButtonStates();
        }
    }

    stopScanning() {
        this.scanner.stopScanning();
        this.resetButtonStates();
        this.showCameraPlaceholder();
        console.log('Scanning stopped');
    }

    pauseScanning() {
        if (this.scanner.scanning) {
            this.wasPaused = true;
            this.scanner.stopScanning();
        }
    }

    resumeScanning() {
        if (this.wasPaused) {
            this.wasPaused = false;
            this.scanner.startScanning();
        }
    }

    resetButtonStates() {
        this.startBtn.style.display = 'inline-block';
        this.stopBtn.style.display = 'none';
        this.startBtn.disabled = false;
        this.startBtn.innerHTML = 'Start Scanner';
        this.stopBtn.innerHTML = 'Stop Scanner';
    }

    restoreCameraContainer() {
        this.cameraContainer.innerHTML = `
            <video id="qrVideo" autoplay muted playsinline></video>
            <div class="scanner-overlay">
                <div class="scanner-frame"></div>
                <div class="scanner-instructions">
                    Point camera at QR code
                </div>
            </div>
        `;
        
        // Update video reference and ensure it's connected
        const newVideo = document.getElementById('qrVideo');
        if (newVideo) {
            this.scanner.video = newVideo;
            console.log('Video element restored and connected');
        } else {
            console.error('Failed to restore video element');
        }
    }

    handleMACAddressDetected(macAddress) {
        console.log('MAC Address detected:', macAddress);
        
        this.currentMacAddress = macAddress;
        this.macAddressElement.textContent = macAddress;
        this.showResults();
        this.hideError();
        
        // Stop scanning after successful detection
        this.stopScanning();
    }

    async copyMACAddress() {
        if (!this.currentMacAddress) {
            this.showCopyFeedback(false, 'No MAC address to copy');
            return;
        }

        try {
            const result = await clipboardManager.copyToClipboard(this.currentMacAddress);
            
            if (result.success) {
                this.showCopyFeedback(true, '✅ Copied to clipboard!');
                
                // Trigger haptic feedback if available
                if (navigator.vibrate) {
                    navigator.vibrate(100);
                }
            } else {
                this.showCopyFeedback(false, result.error || 'Failed to copy');
            }
        } catch (error) {
            console.error('Copy failed:', error);
            this.showCopyFeedback(false, 'Copy failed. Please copy manually.');
        }
    }

    showResults() {
        this.resultsContainer.style.display = 'block';
    }

    hideResults() {
        this.resultsContainer.style.display = 'none';
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorContainer.style.display = 'block';
        console.error('App Error:', message);
    }

    hideError() {
        this.errorContainer.style.display = 'none';
    }

    showCopyFeedback(success, message) {
        showCopyFeedback(this.copyFeedback, success, message);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for jsQR to load
    const initializeApp = () => {
        if (typeof jsQR !== 'undefined') {
            window.beaconScannerApp = new BeaconScannerApp();
            console.log('Beacon Scanner App initialized');
        } else {
            // Retry after a short delay
            setTimeout(initializeApp, 100);
        }
    };
    
    initializeApp();
});

// Handle PWA installation prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    console.log('PWA install prompt triggered');
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Show install button or notification
    showInstallPrompt();
});

function showInstallPrompt() {
    // You can add a custom install button here
    console.log('App can be installed');
}

// Handle successful PWA installation
window.addEventListener('appinstalled', (evt) => {
    console.log('App was successfully installed');
    deferredPrompt = null;
});

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    if (window.beaconScannerApp) {
        window.beaconScannerApp.showError('An unexpected error occurred. Please refresh the page.');
    }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    if (window.beaconScannerApp) {
        window.beaconScannerApp.showError('An unexpected error occurred. Please try again.');
    }
});