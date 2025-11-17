# BLE Beacon QR Scanner

A Progressive Web App (PWA) for scanning QR codes containing BLE beacon MAC addresses. This mobile-optimized application allows you to quickly scan QR codes and copy beacon MAC addresses to your clipboard.

## Features

- 📱 **Mobile-First Design**: Optimized for smartphone use
- 📷 **Camera Integration**: Uses device camera for QR code scanning
- 🔍 **Smart MAC Detection**: Recognizes various MAC address formats
- 📋 **Copy to Clipboard**: One-tap copying with visual feedback
- 📲 **Installable PWA**: Add to home screen without app stores
- 🔄 **Offline Support**: Works offline after initial load
- 🌐 **Cross-Platform**: Works on any modern mobile browser

## Installation

### Option 1: Direct Browser Usage
1. Navigate to the app URL in your mobile browser
2. Allow camera permissions when prompted
3. Start scanning QR codes immediately

### Option 2: Install as PWA (Recommended)
1. Open the app in your mobile browser (Chrome, Safari, Firefox)
2. Look for the "Add to Home Screen" option in your browser menu
3. Tap "Add" to install the app on your device
4. Launch from your home screen like a native app

## Usage

1. **Start Scanning**: Tap the "Start Scanner" button
2. **Allow Camera Access**: Grant camera permissions when prompted
3. **Position QR Code**: Point your camera at the QR code containing the MAC address
4. **Automatic Detection**: The app will automatically detect and extract the MAC address
5. **Copy MAC Address**: Tap the "Copy to Clipboard" button to copy the address
6. **Scan Again**: Tap "Start Scanner" to scan additional QR codes

## Supported MAC Address Formats

The app recognizes MAC addresses in various formats:
- `XX:XX:XX:XX:XX:XX` (colon-separated)
- `XX-XX-XX-XX-XX-XX` (dash-separated)
- `XXXXXXXXXXXX` (continuous hex)
- Prefixed formats like "MAC: XX:XX:XX:XX:XX:XX"
- QR codes containing only the MAC address

## Technical Requirements

### Browser Support
- Chrome 60+ (mobile)
- Safari 11+ (iOS)
- Firefox 55+ (mobile)
- Edge 79+ (mobile)

### Device Requirements
- HTTPS connection (required for camera access)
- Camera with autofocus capability
- Modern mobile browser with WebRTC support

### Permissions Required
- **Camera Access**: Required for QR code scanning
- **Clipboard Access**: Optional, for copy functionality

## Development Setup

### Prerequisites
- Web server with HTTPS support (required for camera access)
- Modern web browser for testing

### Local Development
1. Clone or download the project files
2. Serve the files using a local HTTPS server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (http-server)
   npx http-server -p 8000
   
   # Using PHP
   php -S localhost:8000
   ```
3. Access via `https://localhost:8000` (HTTPS required)

### Project Structure
```
beacon-scanner/
├── index.html          # Main application page
├── manifest.json       # PWA manifest
├── sw.js              # Service worker
├── css/
│   └── styles.css     # Application styles
├── js/
│   ├── app.js         # Main application logic
│   ├── qr-scanner.js  # QR scanning functionality
│   └── clipboard.js   # Clipboard operations
├── icons/             # PWA icons (various sizes)
└── README.md         # This file
```

## Features in Detail

### QR Code Scanning
- Uses the `jsQR` library for reliable QR code detection
- Optimized for mobile camera constraints
- Supports various lighting conditions
- Real-time scanning with visual feedback

### MAC Address Extraction
- Intelligent pattern matching for different MAC formats
- Validates MAC address format (12 hex characters)
- Normalizes output to standard `XX:XX:XX:XX:XX:XX` format
- Handles QR codes with additional text or formatting

### Progressive Web App Features
- **Offline Functionality**: Service worker caches app for offline use
- **Installable**: Add to home screen on mobile devices
- **App-like Experience**: Full-screen mode, splash screen
- **Push Notifications**: Ready for future notification features

### Mobile Optimizations
- Touch-friendly interface with large buttons
- Optimized camera preview for mobile screens
- Haptic feedback on successful scans (if supported)
- Responsive design for various screen sizes
- Battery-efficient scanning algorithm

## Troubleshooting

### Camera Not Working
- **Permission Denied**: Check browser settings and allow camera access
- **HTTPS Required**: Ensure you're accessing via HTTPS
- **Browser Support**: Use a modern mobile browser

### QR Code Not Detected
- **Lighting**: Ensure good lighting conditions
- **Distance**: Hold camera 6-12 inches from QR code
- **Focus**: Allow camera to autofocus before scanning
- **Format**: Verify QR code contains a valid MAC address

### Copy Function Not Working
- **Permissions**: Some browsers require user gesture for clipboard access
- **Fallback**: App includes fallback copy method for older browsers
- **Manual Copy**: Long-press the MAC address to select and copy manually

### PWA Installation Issues
- **Browser Support**: Ensure your browser supports PWA installation
- **HTTPS**: App must be served over HTTPS
- **Manifest**: Check browser console for manifest validation errors

## Browser Compatibility

| Feature | Chrome | Safari | Firefox | Edge |
|---------|--------|--------|---------|------|
| Camera Access | ✅ | ✅ | ✅ | ✅ |
| QR Scanning | ✅ | ✅ | ✅ | ✅ |
| Clipboard API | ✅ | ✅ (iOS 13.4+) | ✅ | ✅ |
| PWA Install | ✅ | ✅ (iOS 11.3+) | ✅ | ✅ |
| Service Worker | ✅ | ✅ | ✅ | ✅ |

## Security & Privacy

- **No Data Collection**: App does not store or transmit personal data
- **Local Processing**: All QR code processing happens on-device
- **Camera Access**: Only used for scanning, no recording or storage
- **Offline Capable**: Works without internet after initial load

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve the app.

## License

This project is open source and available under the MIT License.

---

**Version**: 1.0.0  
**Last Updated**: November 2025