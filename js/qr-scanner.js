class QRScanner {
    constructor() {
        this.video = document.getElementById('qrVideo');
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
        this.scanning = false;
        this.stream = null;
        this.animationFrame = null;
        
        this.onQRCodeDetected = null;
        this.onError = null;
    }

    async requestCameraPermission() {
        try {
            // Try different constraint configurations for better mobile compatibility
            const constraintOptions = [
                // Option 1: Environment camera with flexible constraints
                {
                    video: {
                        facingMode: { ideal: 'environment' },
                        width: { ideal: 640, max: 1920 },
                        height: { ideal: 480, max: 1080 }
                    }
                },
                // Option 2: Basic environment camera
                {
                    video: {
                        facingMode: 'environment'
                    }
                },
                // Option 3: Any camera (fallback)
                {
                    video: {
                        width: { ideal: 640 },
                        height: { ideal: 480 }
                    }
                },
                // Option 4: Minimal constraints
                {
                    video: true
                }
            ];

            let lastError = null;

            for (const constraints of constraintOptions) {
                try {
                    console.log('Trying camera constraints:', constraints);
                    this.stream = await navigator.mediaDevices.getUserMedia(constraints);
                    this.video.srcObject = this.stream;
                    
                    return new Promise((resolve) => {
                        this.video.onloadedmetadata = () => {
                            console.log('Camera initialized successfully');
                            console.log('Video dimensions:', this.video.videoWidth, 'x', this.video.videoHeight);
                            resolve(true);
                        };
                        
                        // Add error handling for video element
                        this.video.onerror = (e) => {
                            console.error('Video element error:', e);
                            resolve(false);
                        };
                    });
                } catch (error) {
                    console.warn('Failed with constraints:', constraints, error);
                    lastError = error;
                    continue;
                }
            }

            throw lastError || new Error('Unable to access camera with any configuration');

        } catch (error) {
            console.error('Camera access denied:', error);
            throw new Error(`Camera access failed: ${error.message}. Please ensure you've granted camera permissions and try again.`);
        }
    }

    startScanning() {
        if (this.scanning) return;
        
        this.scanning = true;
        
        // Wait for video to be ready before starting scan loop
        const startScanLoop = () => {
            if (this.video.readyState >= 2) { // HAVE_CURRENT_DATA or better
                console.log('Video ready, starting scan loop');
                this.scanLoop();
            } else {
                console.log('Waiting for video data...');
                setTimeout(startScanLoop, 100);
            }
        };

        this.video.play().then(() => {
            console.log('Video playing successfully');
            startScanLoop();
        }).catch((error) => {
            console.error('Video play failed:', error);
            // Try to start anyway
            startScanLoop();
        });
    }

    stopScanning() {
        this.scanning = false;
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }

        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        this.video.srcObject = null;
    }

    scanLoop() {
        if (!this.scanning) return;

        if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
            this.canvas.height = this.video.videoHeight;
            this.canvas.width = this.video.videoWidth;

            this.context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
            
            const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
            const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert",
            });

            if (qrCode) {
                this.handleQRCodeDetected(qrCode.data);
                return; // Stop scanning after successful detection
            }
        }

        this.animationFrame = requestAnimationFrame(() => this.scanLoop());
    }

    handleQRCodeDetected(data) {
        console.log('QR Code detected:', data);
        
        const macAddress = this.extractMACAddress(data);
        
        if (macAddress) {
            // Add visual feedback
            document.body.classList.add('scan-success');
            setTimeout(() => document.body.classList.remove('scan-success'), 500);
            
            // Trigger haptic feedback if available
            if (navigator.vibrate) {
                navigator.vibrate(200);
            }
            
            if (this.onQRCodeDetected) {
                this.onQRCodeDetected(macAddress);
            }
        } else {
            const error = 'QR code does not contain a valid MAC address';
            console.warn(error);
            if (this.onError) {
                this.onError(error);
            }
        }
    }

    extractMACAddress(qrData) {
        // MAC address patterns to match
        const macPatterns = [
            // Standard formats: XX:XX:XX:XX:XX:XX, XX-XX-XX-XX-XX-XX, XXXXXXXXXXXX
            /([0-9a-fA-F]{2}[:-]){5}[0-9a-fA-F]{2}/g,
            /([0-9a-fA-F]{2}[-]){5}[0-9a-fA-F]{2}/g,
            /[0-9a-fA-F]{12}/g
        ];

        // Try to extract MAC address from QR code data
        for (const pattern of macPatterns) {
            const matches = qrData.match(pattern);
            if (matches) {
                // Take the first match and normalize the format
                const macAddress = matches[0];
                return this.normalizeMACAddress(macAddress);
            }
        }

        // Check if the entire QR code is just a MAC address
        const cleanData = qrData.replace(/[^0-9a-fA-F]/g, '');
        if (cleanData.length === 12 && /^[0-9a-fA-F]{12}$/.test(cleanData)) {
            return this.normalizeMACAddress(cleanData);
        }

        // Check for common prefixes or suffixes
        const prefixPatterns = [
            /MAC[:\s]*([0-9a-fA-F:]{17})/i,
            /BEACON[:\s]*([0-9a-fA-F:]{17})/i,
            /BLE[:\s]*([0-9a-fA-F:]{17})/i,
            /ADDRESS[:\s]*([0-9a-fA-F:]{17})/i
        ];

        for (const pattern of prefixPatterns) {
            const match = qrData.match(pattern);
            if (match && match[1]) {
                return this.normalizeMACAddress(match[1]);
            }
        }

        return null;
    }

    normalizeMACAddress(macAddress) {
        // Remove any non-hex characters
        let cleaned = macAddress.replace(/[^0-9a-fA-F]/g, '').toLowerCase();
        
        // Ensure it's exactly 12 characters
        if (cleaned.length !== 12) {
            return null;
        }

        // Format as XX:XX:XX:XX:XX:XX
        return cleaned.replace(/(.{2})(?=.)/g, '$1:').toUpperCase();
    }

    // Check if browser supports required features
    static isSupported() {
        return !!(
            navigator.mediaDevices && 
            navigator.mediaDevices.getUserMedia &&
            window.jsQR
        );
    }

    // Enhanced browser compatibility check
    static async checkCameraSupport() {
        const support = {
            mediaDevices: !!navigator.mediaDevices,
            getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
            jsQR: !!window.jsQR,
            cameras: []
        };

        if (support.mediaDevices && navigator.mediaDevices.enumerateDevices) {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                support.cameras = devices.filter(device => device.kind === 'videoinput');
            } catch (error) {
                console.warn('Could not enumerate devices:', error);
            }
        }

        return support;
    }

    // Get camera capabilities for debugging
    async getCameraCapabilities() {
        if (!this.stream) return null;
        
        const videoTrack = this.stream.getVideoTracks()[0];
        if (videoTrack && videoTrack.getCapabilities) {
            return videoTrack.getCapabilities();
        }
        return null;
    }
}