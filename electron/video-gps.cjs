const { open } = require('node:fs/promises');

// QuickTime ISO-6709 location in udta/©xyz. Other GPS dialects deliberately
// remain unknown. Read atom headers and bounded metadata, never mdat/video.
async function readVideoGps(file) {
  const handle = await open(file, 'r');
  try {
    const { size } = await handle.stat();
    let visited = 0;
    async function scan(start, end, depth) {
      if (depth > 8) return;
      for (let offset = start; offset + 8 <= end && visited++ < 10000;) {
        const header = Buffer.alloc(16);
        const { bytesRead } = await handle.read(header, 0, Math.min(16, end - offset), offset);
        if (bytesRead < 8) return;
        let length = header.readUInt32BE(0);
        const type = header.toString('latin1', 4, 8);
        let head = 8;
        if (length === 1) {
          if (bytesRead < 16) return;
          const large = header.readBigUInt64BE(8);
          if (large > BigInt(Number.MAX_SAFE_INTEGER)) return;
          length = Number(large); head = 16;
        } else if (length === 0) length = end - offset;
        if (length < head || offset + length > end) return;
        if (type === '©xyz' && length - head <= 1024) {
          const data = Buffer.alloc(length - head);
          await handle.read(data, 0, data.length, offset + head);
          const match = /([+-]\d{2}\.\d+)([+-]\d{3}\.\d+)(?:[+-]\d+(?:\.\d+)?)?\//.exec(data.toString('utf8'));
          if (match) {
            const lat = Number(match[1]); const lng = Number(match[2]);
            if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return { lat, lng, cityName: '', countryName: '', countryCode: '' };
          }
        }
        if (type === 'loci' && length - head >= 20 && length - head <= 4096) {
          const data = Buffer.alloc(length - head);
          await handle.read(data, 0, data.length, offset + head);
          const nameEnd = data.indexOf(0, 6);
          const coordinates = nameEnd + 2;
          if (data[0] === 0 && nameEnd >= 6 && coordinates + 12 <= data.length) {
            const lng = data.readInt32BE(coordinates) / 65536;
            const lat = data.readInt32BE(coordinates + 4) / 65536;
            if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return { lat, lng, cityName: '', countryName: '', countryCode: '' };
          }
        }
        if (['moov', 'udta'].includes(type)) {
          const found = await scan(offset + head, offset + length, depth + 1);
          if (found) return found;
        }
        offset += length;
      }
    }
    return await scan(0, size, 0);
  } finally { await handle.close(); }
}
module.exports = { readVideoGps };
