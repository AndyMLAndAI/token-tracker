import fs from 'node:fs'
import path from 'node:path'

const buildDir = path.resolve('build')

function createIco(pngFiles) {
  // pngFiles: Array of { size: number, buffer: Buffer }
  // Sort from largest to smallest (standard convention) or ascending; Windows handles either, descending is preferred
  const sorted = [...pngFiles].sort((a, b) => b.size - a.size)

  const count = sorted.length
  const headerLen = 6
  const dirEntryLen = 16
  const dataOffsetStart = headerLen + dirEntryLen * count

  let currentOffset = dataOffsetStart
  const entries = []

  for (const item of sorted) {
    const w = item.size >= 256 ? 0 : item.size
    const h = item.size >= 256 ? 0 : item.size
    const size = item.buffer.length

    entries.push({
      width: w,
      height: h,
      size,
      offset: currentOffset,
      buffer: item.buffer,
    })
    currentOffset += size
  }

  const icoBuf = Buffer.alloc(currentOffset)

  // ICONDIR: 00 00, 01 00 (type=icon), count (2 bytes LE)
  icoBuf.writeUInt16LE(0, 0)
  icoBuf.writeUInt16LE(1, 2)
  icoBuf.writeUInt16LE(count, 4)

  // ICONDIRENTRY array
  let entryPos = 6
  for (const e of entries) {
    icoBuf.writeUInt8(e.width, entryPos + 0)
    icoBuf.writeUInt8(e.height, entryPos + 1)
    icoBuf.writeUInt8(0, entryPos + 2) // color count (0 = >= 8bpp)
    icoBuf.writeUInt8(0, entryPos + 3) // reserved
    icoBuf.writeUInt16LE(1, entryPos + 4) // color planes
    icoBuf.writeUInt16LE(32, entryPos + 6) // bits per pixel
    icoBuf.writeUInt32LE(e.size, entryPos + 8) // size of image data in bytes
    icoBuf.writeUInt32LE(e.offset, entryPos + 12) // offset of image data from beginning of file
    entryPos += dirEntryLen
  }

  // Write image buffers
  for (const e of entries) {
    e.buffer.copy(icoBuf, e.offset)
  }

  return icoBuf
}

function createIcns(entries) {
  // entries: Array of { type: string (4 chars), buffer: Buffer }
  const chunks = []
  let totalLength = 8 // header is 'icns' (4 bytes) + totalLength (4 bytes BE)

  for (const item of entries) {
    const chunkLen = 8 + item.buffer.length
    totalLength += chunkLen
    chunks.push({
      type: item.type,
      length: chunkLen,
      buffer: item.buffer,
    })
  }

  const icnsBuf = Buffer.alloc(totalLength)
  icnsBuf.write('icns', 0, 4, 'ascii')
  icnsBuf.writeUInt32BE(totalLength, 4)

  let pos = 8
  for (const c of chunks) {
    icnsBuf.write(c.type, pos, 4, 'ascii')
    icnsBuf.writeUInt32BE(c.length, pos + 4)
    c.buffer.copy(icnsBuf, pos + 8)
    pos += c.length
  }

  return icnsBuf
}

async function run() {
  const sizes = [16, 32, 48, 64, 128, 256]
  const pngFiles = []

  for (const s of sizes) {
    const file = path.join(buildDir, `icon_${s}.png`)
    if (!fs.existsSync(file)) {
      throw new Error(`Missing ${file}`)
    }
    pngFiles.push({
      size: s,
      buffer: fs.readFileSync(file),
    })
  }

  // 1. Write icon.ico
  const icoData = createIco(pngFiles)
  const icoPath = path.join(buildDir, 'icon.ico')
  fs.writeFileSync(icoPath, icoData)
  console.log(`Generated ${icoPath} (${icoData.length} bytes)`)

  // 2. Write icon.icns
  const icon512Path = path.join(buildDir, 'icon.png')
  const icon512Buf = fs.readFileSync(icon512Path)
  const icon256Buf = fs.readFileSync(path.join(buildDir, 'icon_256.png'))
  const icon128Buf = fs.readFileSync(path.join(buildDir, 'icon_128.png'))

  const icnsData = createIcns([
    { type: 'ic09', buffer: icon512Buf }, // 512x512
    { type: 'ic08', buffer: icon256Buf }, // 256x256
    { type: 'ic07', buffer: icon128Buf }, // 128x128
  ])
  const icnsPath = path.join(buildDir, 'icon.icns')
  fs.writeFileSync(icnsPath, icnsData)
  console.log(`Generated ${icnsPath} (${icnsData.length} bytes)`)

  // 3. Copy icon.ico to public/favicon.ico
  const publicFavicon = path.resolve('public/favicon.ico')
  fs.copyFileSync(icoPath, publicFavicon)
  console.log(`Copied favicon to ${publicFavicon}`)

  // 4. Clean up intermediate icon_*.png files
  for (const s of sizes) {
    const file = path.join(buildDir, `icon_${s}.png`)
    if (fs.existsSync(file)) {
      fs.unlinkSync(file)
    }
  }

  console.log('Build icons generated successfully: icon.png, icon.ico, icon.icns')
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
