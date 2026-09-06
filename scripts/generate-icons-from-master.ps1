Add-Type -AssemblyName System.Drawing

$masterPath = "build/icon.png"
if (-not (Test-Path $masterPath)) {
    Write-Error "Master icon $masterPath not found"
    exit 1
}

$master = [System.Drawing.Image]::FromFile((Resolve-Path $masterPath))

$sizes = @(16, 32, 48, 64, 128, 256)

foreach ($size in $sizes) {
    $dest = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $g.Clear([System.Drawing.Color]::FromArgb(0, 0, 0, 0))
    $destRect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $g.DrawImage($master, $destRect, 0, 0, $master.Width, $master.Height, [System.Drawing.GraphicsUnit]::Pixel)

    $outPath = "build/icon_$size.png"
    $dest.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $dest.Dispose()
    Write-Host "Generated $outPath"
}

$master.Dispose()
Write-Host "All multi-resolution PNGs generated from master icon"
