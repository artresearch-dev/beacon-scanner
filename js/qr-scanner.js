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
            // Request camera permission with mobile-optimized constraints
            const constraints = {
                video: {
                    facingMode: { ideal: 'environment' }, // Use back camera on mobile
                    width: { ideal: 1280, max: 1920 },
                    height: { ideal: 720, max: 1080 },
                    aspectRatio: { ideal: 16/9 }
                }
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = this.stream;
            
            return new Promise((resolve) => {
                this.video.onloadedmetadata = () => {
                    resolve(true);
                };
            });
        } catch (error) {
            console.error('Camera access denied:', error);
            throw new Error('Camera access is required to scan QR codes. Please allow camera access and try again.');
        }
    }

    startScanning() {
        if (this.scanning) return;
        
        this.scanning = true;
        this.video.play();
        this.scanLoop();
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