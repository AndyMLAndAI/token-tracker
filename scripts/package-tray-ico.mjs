import fs from 'node:fs'
import path from 'node:path'

const buildDir = path.resolve('build')

function createIco(pngFiles) {
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
  icoBuf.writeUInt16LE(0, 0)
  icoBuf.writeUInt16LE(1, 2)
  icoBuf.writeUInt16LE(count, 4)

  let entryPos = 6
  for (const e of entries) {
    icoBuf.writeUInt8(e.width, entryPos + 0)
    icoBuf.writeUInt8(e.height, entryPos + 1)
    icoBuf.writeUInt8(0, entryPos + 2)
    icoBuf.writeUInt8(0, entryPos + 3)
    icoBuf.writeUInt16LE(1, entryPos + 4)
    icoBuf.writeUInt16LE(32, entryPos + 6)
    icoBuf.writeUInt32LE(e.size, entryPos + 8)
    icoBuf.writeUInt32LE(e.offset, entryPos + 12)
    entryPos += dirEntryLen
  }

  for (const e of entries) {
    e.buffer.copy(icoBuf, e.offset)
  }

  return icoBuf
}

const p16 = path.join(buildDir, 'tray-icon-16.png')
const p32 = path.join(buildDir, 'tray-icon-32.png')

const pngFiles = [
  { size: 16, buffer: fs.readFileSync(p16) },
  { size: 32, buffer: fs.readFileSync(p32) },
]

const icoData = createIco(pngFiles)
const icoPath = path.join(buildDir, 'tray-icon.ico')
fs.writeFileSync(icoPath, icoData)
console.log(`Generated ${icoPath} (${icoData.length} bytes)`)

// Also copy to public/ so it's packaged in dist/
const publicTrayPng = path.resolve('public/tray-icon.png')
const publicTrayIco = path.resolve('public/tray-icon.ico')
fs.copyFileSync(p32, publicTrayPng)
fs.copyFileSync(icoPath, publicTrayIco)
console.log('Copied tray icons to public/ as well')
