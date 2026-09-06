Add-Type -AssemblyName System.Drawing

function Create-SidebarBmp {
    $w = 164
    $h = 314
    $bmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half

    # 1. Fill base Win95 gray (#c0c0c0)
    $grayBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 192, 192, 192))
    $g.FillRectangle($grayBrush, 0, 0, $w, $h)

    # 2. Left vertical stripe: classic Win95 navy gradient (#000080 to #1084d0)
    $navyRect = New-Object System.Drawing.Rectangle(0, 0, 36, $h)
    $navyBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $navyRect,
        [System.Drawing.Color]::FromArgb(255, 0, 0, 128),
        [System.Drawing.Color]::FromArgb(255, 16, 132, 208),
        [System.Drawing.Drawing2D.LinearGradientMode]::Vertical
    )
    $g.FillRectangle($navyBrush, $navyRect)

    # Subtle dither on navy stripe edge
    $ditherPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 0, 0, 80))
    $g.DrawLine($ditherPen, 35, 0, 35, $h)

    # Vertical text on navy stripe: "TOKEN TRACKER 1.7"
    $font = New-Object System.Drawing.Font("MS Sans Serif", 9, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    if ($font.FontFamily.Name -ne "MS Sans Serif") {
        $font = New-Object System.Drawing.Font("Arial", 8, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    }
    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $format = New-Object System.Drawing.StringFormat
    $format.FormatFlags = [System.Drawing.StringFormatFlags]::DirectionVertical
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $g.DrawString("TOKEN TRACKER v1.7", $font, $whiteBrush, [float]8, [float]15, $format)

    # 3. Main Panel (x: 36 to 164)
    # Beveled card at top for App Icon (x: 48, y: 16, w: 102, h: 102)
    $cardX = 48
    $cardY = 16
    $cardW = 102
    $cardH = 102

    # Raised 3D outer bevel
    $whitePen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, 1)
    $darkPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 128, 128, 128), 1)
    $blackPen = New-Object System.Drawing.Pen([System.Drawing.Color]::Black, 1)

    # Inset frame for icon screen
    $g.DrawLine($darkPen, $cardX, $cardY, $cardX + $cardW, $cardY)
    $g.DrawLine($darkPen, $cardX, $cardY, $cardX, $cardY + $cardH)
    $g.DrawLine($blackPen, $cardX + 1, $cardY + 1, $cardX + $cardW - 1, $cardY + 1)
    $g.DrawLine($blackPen, $cardX + 1, $cardY + 1, $cardX + 1, $cardY + $cardH - 1)
    $g.DrawLine($whitePen, $cardX, $cardY + $cardH, $cardX + $cardW, $cardY + $cardH)
    $g.DrawLine($whitePen, $cardX + $cardW, $cardY, $cardX + $cardW, $cardY + $cardH)

    # Black screen interior
    $screenBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 10, 10, 10))
    $g.FillRectangle($screenBrush, $cardX + 2, $cardY + 2, $cardW - 3, $cardH - 3)

    # Pixelated Three Ascending Bars Icon
    # Bar 1 (Left, dark gray #383b44)
    $bar1Brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 56, 59, 68))
    $g.FillRectangle($bar1Brush, $cardX + 18, $cardY + 54, 18, 34)

    # Bar 2 (Middle, mid gray #8e929d)
    $bar2Brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 142, 146, 157))
    $g.FillRectangle($bar2Brush, $cardX + 42, $cardY + 36, 18, 52)

    # Bar 3 (Right, white with 45-deg hatch lines)
    $bar3Brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $g.FillRectangle($bar3Brush, $cardX + 66, $cardY + 18, 18, 70)

    # Draw diagonal hatch stripes on Bar 3
    $hatchPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 180, 185, 195), 1)
    for ($i = -20; $i -lt 90; $i += 4) {
        $g.DrawLine($hatchPen, $cardX + 66, $cardY + 18 + $i, $cardX + 84, $cardY + 18 + $i - 18)
    }

    # 4. Lower illustration: Classic 3D Computer & Setup Disks
    # Computer screen frame (x: 52, y: 140, w: 94, h: 70)
    $compX = 52
    $compY = 140
    $compW = 94
    $compH = 70

    # Draw raised monitor housing
    $lightGrayBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 215, 215, 215))
    $g.FillRectangle($lightGrayBrush, $compX, $compY, $compW, $compH)
    # Bevel on monitor
    $g.DrawLine($whitePen, $compX, $compY, $compX + $compW, $compY)
    $g.DrawLine($whitePen, $compX, $compY, $compX, $compY + $compH)
    $g.DrawLine($darkPen, $compX, $compY + $compH, $compX + $compW, $compY + $compH)
    $g.DrawLine($darkPen, $compX + $compW, $compY, $compX + $compW, $compY + $compH)

    # Inner cyan/blue desktop screen
    $screenCyanBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 0, 128, 128)) # classic Win95 teal
    $g.FillRectangle($screenCyanBrush, $compX + 8, $compY + 8, $compW - 16, $compH - 22)

    # Mini setup wizard dialog inside the mini monitor
    $miniWinBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 192, 192, 192))
    $g.FillRectangle($miniWinBrush, $compX + 18, $compY + 14, 44, 26)
    $miniTitleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 0, 0, 128))
    $g.FillRectangle($miniTitleBrush, $compX + 20, $compY + 16, 40, 5)

    # Monitor power LED (classic green pixel)
    $ledBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 0, 255, 0))
    $g.FillRectangle($ledBrush, $compX + $compW - 14, $compY + $compH - 9, 3, 3)

    # Monitor stand
    $g.FillRectangle($lightGrayBrush, $compX + 36, $compY + $compH, 22, 8)
    $g.FillRectangle($lightGrayBrush, $compX + 26, $compY + $compH + 8, 42, 4)
    $g.DrawLine($darkPen, $compX + 26, $compY + $compH + 12, $compX + 68, $compY + $compH + 12)

    # 5. Floppy disk illustration below monitor (x: 60, y: 235, w: 76, h: 56)
    $flopX = 60
    $flopY = 236
    $flopW = 76
    $flopH = 56

    $darkGrayBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 40, 40, 40))
    $g.FillRectangle($darkGrayBrush, $flopX, $flopY, $flopW, $flopH)
    # Metal shutter (silver)
    $silverBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 180, 180, 180))
    $g.FillRectangle($silverBrush, $flopX + 16, $flopY, 44, 20)
    # White label with blue text
    $labelBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $g.FillRectangle($labelBrush, $flopX + 10, $flopY + 24, $flopW - 20, 26)
    $bluePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 0, 0, 128), 1)
    $g.DrawLine($bluePen, $flopX + 14, $flopY + 30, $flopX + $flopW - 14, $flopY + 30)
    $g.DrawLine($bluePen, $flopX + 14, $flopY + 36, $flopX + $flopW - 24, $flopY + 36)
    $g.DrawLine($bluePen, $flopX + 14, $flopY + 42, $flopX + $flopW - 18, $flopY + 42)

    # Outset 3D right edge border for entire sidebar
    $g.DrawLine($darkPen, $w - 2, 0, $w - 2, $h)
    $g.DrawLine($whitePen, $w - 1, 0, $w - 1, $h)

    $bmp.Save("build/installerSidebar.bmp", [System.Drawing.Imaging.ImageFormat]::Bmp)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Created build/installerSidebar.bmp (164x314)"
}

function Create-HeaderBmp {
    $w = 150
    $h = 57
    $bmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half

    # Win95 Gray background (#c0c0c0)
    $grayBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 192, 192, 192))
    $g.FillRectangle($grayBrush, 0, 0, $w, $h)

    # Inset 3D box on the right for the mini 3-bar icon
    $boxX = $w - 50
    $boxY = 6
    $boxW = 44
    $boxH = 44

    $whitePen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, 1)
    $darkPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 128, 128, 128), 1)
    $blackPen = New-Object System.Drawing.Pen([System.Drawing.Color]::Black, 1)

    # Inset border
    $g.DrawLine($darkPen, $boxX, $boxY, $boxX + $boxW, $boxY)
    $g.DrawLine($darkPen, $boxX, $boxY, $boxX, $boxY + $boxH)
    $g.DrawLine($blackPen, $boxX + 1, $boxY + 1, $boxX + $boxW - 1, $boxY + 1)
    $g.DrawLine($blackPen, $boxX + 1, $boxY + 1, $boxX + 1, $boxY + $boxH - 1)
    $g.DrawLine($whitePen, $boxX, $boxY + $boxH, $boxX + $boxW, $boxY + $boxH)
    $g.DrawLine($whitePen, $boxX + $boxW, $boxY, $boxX + $boxW, $boxY + $boxH)

    # Dark background
    $screenBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 10, 10, 10))
    $g.FillRectangle($screenBrush, $boxX + 2, $boxY + 2, $boxW - 3, $boxH - 3)

    # Ascending 3 bars inside header chip
    # Bar 1
    $bar1Brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 56, 59, 68))
    $g.FillRectangle($bar1Brush, $boxX + 8, $boxY + 24, 7, 14)
    # Bar 2
    $bar2Brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 142, 146, 157))
    $g.FillRectangle($bar2Brush, $boxX + 18, $boxY + 16, 7, 22)
    # Bar 3
    $bar3Brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $g.FillRectangle($bar3Brush, $boxX + 28, $boxY + 8, 7, 30)
    # Hatch stripes on Bar 3
    $hatchPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 180, 185, 195), 1)
    for ($i = -10; $i -lt 40; $i += 3) {
        $g.DrawLine($hatchPen, $boxX + 28, $boxY + 8 + $i, $boxX + 35, $boxY + 8 + $i - 7)
    }

    $bmp.Save("build/installerHeader.bmp", [System.Drawing.Imaging.ImageFormat]::Bmp)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Created build/installerHeader.bmp (150x57)"
}

Create-SidebarBmp
Create-HeaderBmp
