# Icon Creation Helper Script
# This script helps you create the required PNG icons

Write-Host "=== BLE Beacon Scanner - Icon Creation Helper ===" -ForegroundColor Cyan
Write-Host ""

$iconDir = ".\icons"
$svgFile = "$iconDir\icon-base.svg"

# Check if SVG exists
if (Test-Path $svgFile) {
    Write-Host "✓ Found SVG file: $svgFile" -ForegroundColor Green
} else {
    Write-Host "✗ SVG file not found: $svgFile" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Required PNG files to create:" -ForegroundColor Yellow
Write-Host "- icon-180x180.png  (for iPhone home screen)"
Write-Host "- icon-192x192.png  (for PWA manifest)"
Write-Host "- icon-512x512.png  (for high-res displays)"
Write-Host ""

# Check which icons already exist
$requiredIcons = @("icon-180x180.png", "icon-192x192.png", "icon-512x512.png")
$existingIcons = @()
$missingIcons = @()

foreach ($icon in $requiredIcons) {
    $iconPath = "$iconDir\$icon"
    if (Test-Path $iconPath) {
        $existingIcons += $icon
        Write-Host "✓ Found: $icon" -ForegroundColor Green
    } else {
        $missingIcons += $icon
        Write-Host "✗ Missing: $icon" -ForegroundColor Red
    }
}

Write-Host ""

if ($missingIcons.Count -eq 0) {
    Write-Host "🎉 All icons found! Your PWA should display correctly." -ForegroundColor Green
    Write-Host "Run 'git add . && git commit -m \"Add PWA icons\" && git push origin main' to deploy."
} else {
    Write-Host "📋 Next steps to create missing icons:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Option 1 - Online Converter (Recommended):"
    Write-Host "1. Visit: https://convertio.co/svg-png/"
    Write-Host "2. Upload: $svgFile"
    Write-Host "3. Convert to sizes: 180x180, 192x192, 512x512"
    Write-Host "4. Download and save in icons/ folder"
    Write-Host ""
    Write-Host "Option 2 - Favicon Generator:"
    Write-Host "1. Visit: https://realfavicongenerator.net/"
    Write-Host "2. Upload: $svgFile"
    Write-Host "3. Download package and extract icons"
    Write-Host ""
    Write-Host "Option 3 - Use any square image:"
    Write-Host "1. Find any square image (PNG/JPG)"
    Write-Host "2. Resize to 192x192 and 512x512 using any image editor"
    Write-Host "3. Save as icon-192x192.png and icon-512x512.png"
}

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")