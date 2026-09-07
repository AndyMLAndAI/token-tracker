Add-Type -AssemblyName System.Drawing

$buildDir = "build"
if (-not (Test-Path $buildDir)) {
    New-Item -ItemType Directory -Path $buildDir -Force | Out-Null
}

function Create-TrayIcon([int]$size) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::FromArgb(0, 0, 0, 0))

    if ($size -eq 16) {
        # 16x16 pixel alignment
        # Bar 1 (left, shortest): dark-mid gray
        $brush1 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 140, 145, 155))
        $g.FillRectangle($brush1, 2, 9, 3, 5)
        $brush1.Dispose()

        # Bar 2 (mid, medium): bright gray
        $brush2 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 215, 220, 228))
        $g.FillRectangle($brush2, 6, 5, 3, 9)
        $brush2.Dispose()

        # Bar 3 (right, tallest): pure white
        $brush3 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
        $g.FillRectangle($brush3, 10, 1, 3, 13)
        $brush3.Dispose()
    } else {
        # 32x32 pixel alignment with smooth rounded corners
        $scale = $size / 32.0

        # Bar 1: Left
        $brush1 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 140, 145, 155))
        $g.FillRectangle($brush1, [int](4 * $scale), [int](18 * $scale), [int](6 * $scale), [int](10 * $scale))
        $brush1.Dispose()

        # Bar 2: Middle
        $brush2 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 215, 220, 228))
        $g.FillRectangle($brush2, [int](13 * $scale), [int](10 * $scale), [int](6 * $scale), [int](18 * $scale))
        $brush2.Dispose()

        # Bar 3: Right
        $brush3 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
        $g.FillRectangle($brush3, [int](22 * $scale), [int](2 * $scale), [int](6 * $scale), [int](26 * $scale))
        $brush3.Dispose()
    }

    $g.Dispose()
    return $bmp
}

$bmp16 = Create-TrayIcon 16
$bmp32 = Create-TrayIcon 32

$bmp16.Save("build/tray-icon-16.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp32.Save("build/tray-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp32.Save("build/tray-icon-32.png", [System.Drawing.Imaging.ImageFormat]::Png)

$bmp16.Dispose()
$bmp32.Dispose()

Write-Host "Tray icon PNGs generated successfully in build/"
