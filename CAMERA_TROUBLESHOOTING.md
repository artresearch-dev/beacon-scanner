# Camera Troubleshooting Guide

## Common Issues with Black Camera Screen

### 1. **Permissions Issues**
**Symptoms**: Black screen, permission denied errors
**Solutions**:
- Clear browser permissions and try again
- In Chrome: Click the camera icon in address bar → Allow
- In Safari: Settings → Privacy & Security → Camera → Allow
- Try refreshing the page after granting permissions

### 2. **HTTPS Requirements**
**Symptoms**: Camera access denied
**Solutions**:
- Ensure you're using the HTTPS GitHub Pages URL
- Camera won't work on HTTP or localhost in production browsers

### 3. **Mobile Browser Compatibility**
**Symptoms**: Black screen on mobile
**Solutions**:
- Use Chrome, Safari, or Firefox on mobile
- Avoid in-app browsers (Instagram, Facebook, etc.)
- Try opening in "Desktop site" mode if available

### 4. **Camera Constraints Issues**
**Symptoms**: Black screen after permission granted
**Solutions**:
- The updated code now tries multiple camera configurations
- Check browser console (F12) for detailed error messages

## Debugging Steps

### Step 1: Check Browser Console
1. Open the app in your browser
2. Press F12 (or right-click → Inspect)
3. Go to Console tab
4. Click "Start Scanner" and look for errors

### Step 2: Check Camera Support
The console will show:
```
Camera support details: {
  mediaDevices: true,
  getUserMedia: true,
  jsQR: true,
  cameras: [...]
}
```

### Step 3: Test Different Browsers
- Chrome Mobile (recommended)
- Safari Mobile (iOS)
- Firefox Mobile
- Edge Mobile

### Step 4: Check Device Camera
- Test camera in native camera app
- Ensure no other app is using camera
- Try both front and back cameras

## Mobile-Specific Tips

### iOS Safari
- May require user gesture to start camera
- Works best in Safari, not in-app browsers
- Ensure iOS 11.3+ for full PWA support

### Android Chrome
- Usually most compatible
- Allow camera permissions when prompted
- Clear Chrome data if issues persist

### Common Error Messages

**"Camera access failed: NotAllowedError"**
- User denied camera permission
- Solution: Grant permissions and refresh

**"Camera access failed: NotFoundError"**
- No camera detected
- Solution: Check device has working camera

**"Camera access failed: NotReadableError"**
- Camera in use by another app
- Solution: Close other camera apps

**"Video play failed"**
- Browser autoplay restrictions
- Solution: Updated code handles this automatically

## Testing the Fixes

After deploying the updated code:

1. **Clear browser cache** and reload the page
2. **Grant camera permissions** when prompted
3. **Check console** for detailed logging
4. **Try on different devices** and browsers

## If Issues Persist

The updated code includes:
- ✅ Multiple camera constraint fallbacks
- ✅ Better error handling and logging
- ✅ Improved video initialization
- ✅ Enhanced mobile compatibility

If you still see a black screen:
1. Check the browser console for specific error messages
2. Try a different mobile browser
3. Test on a different device
4. Ensure the device camera works in other apps