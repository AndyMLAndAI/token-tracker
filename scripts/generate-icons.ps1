param (
    [string]$OutputDir = "build"
)

Add-Type -AssemblyName System.Drawing

if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

function Create-IconBitmap([int]$size) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    # Transparent background
    $g.Clear([System.Drawing.Color]::FromArgb(0, 0, 0, 0))

    $scale = [double]$size / 512.0

    # 1. Outer Dark Squircle
    $pad = 20.0 * $scale
    $rectSize = [double]$size - (2.0 * $pad)
    $radius = 90.0 * $scale
    $d = $radius * 2.0

    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddArc([float]$pad, [float]$pad, [float]$d, [float]$d, [float]180, [float]90)
    $path.AddArc([float]($pad + $rectSize - $d), [float]$pad, [float]$d, [float]$d, [float]270, [float]90)
    $path.AddArc([float]($pad + $rectSize - $d), [float]($pad + $rectSize - $d), [float]$d, [float]$d, [float]0, [float]90)
    $path.AddArc([float]$pad, [float]($pad + $rectSize - $d), [float]$d, [float]$d, [float]90, [float]90)
    $path.CloseFigure()

    # Fill dark background (#09090b)
    $bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 9, 9, 11))
    $g.FillPath($bgBrush, $path)

    # Dark border (#262626)
    $borderWidth = [float][Math]::Max(1.0, 4.0 * $scale)
    $borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 38, 38, 38), $borderWidth)
    $g.DrawPath($borderPen, $path)

    # 2. Emerald Token Ring (#10b981)
    $ringPad = [float](75.0 * $scale)
    $ringSize = [float]([double]$size - (2.0 * $ringPad))
    $ringWidth = [float][Math]::Max(1.5, 7.0 * $scale)
    $ringPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(220, 16, 185, 129), $ringWidth)
    $g.DrawEllipse($ringPen, $ringPad, $ringPad, $ringSize, $ringSize)

    # Subtle inner coin ring (#059669)
    $innerPad = [float](95.0 * $scale)
    $innerSize = [float]([double]$size - (2.0 * $innerPad))
    $innerWidth = [float][Math]::Max(1.0, 2.5 * $scale)
    $innerPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(110, 5, 150, 105), $innerWidth)
    $g.DrawEllipse($innerPen, $innerPad, $innerPad, $innerSize, $innerSize)

    # 3. Delta Triangle in Center (Sharp White Vercel Delta)
    $topY = [float](168.0 * $scale)
    $bottomY = [float](340.0 * $scale)
    $halfWidth = [float](100.0 * $scale)
    $centerX = [float]([double]$size / 2.0)

    $p1 = New-Object System.Drawing.PointF($centerX, $topY)
    $p2 = New-Object System.Drawing.PointF(($centerX + $halfWidth), $bottomY)
    $p3 = New-Object System.Drawing.PointF(($centerX - $halfWidth), $bottomY)
    [System.Drawing.PointF[]]$triangle = @($p1, $p2, $p3)

    $triangleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
    $g.FillPolygon($triangleBrush, $triangle)

    # 4. Small Emerald Token Indicator Dot on triangle base
    $dotSize = [float][Math]::Max(3.0, 14.0 * $scale)
    $dotX = [float]($centerX - ($dotSize / 2.0))
    $dotY = [float]($bottomY - ($dotSize * 1.5))
    $dotBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 16, 185, 129))
    $g.FillEllipse($dotBrush, $dotX, $dotY, $dotSize, $dotSize)

    $borderPen.Dispose()
    $bgBrush.Dispose()
    $ringPen.Dispose()
    $innerPen.Dispose()
    $triangleBrush.Dispose()
    $dotBrush.Dispose()
    $path.Dispose()
    $g.Dispose()

    return $bmp
}

# Generate 512x512 master PNG
$bmp512 = Create-IconBitmap 512
$bmp512.Save("$OutputDir/icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Saved $OutputDir/icon.png (512x512)"

# Generate multi-resolution PNGs for ICO and ICNS packaging
$sizes = @(16, 32, 48, 64, 128, 256)
foreach ($s in $sizes) {
    $b = Create-IconBitmap $s
    $b.Save("$OutputDir/icon_${s}.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $b.Dispose()
}
$bmp512.Dispose()

Write-Host "All intermediate PNGs generated successfully"
