const test = require('node:test');
const assert = require('node:assert/strict');
const { mkdtemp, writeFile } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { readVideoGps } = require('../electron/video-gps.cjs');
const atom = (name, bytes) => { const head = Buffer.alloc(8); head.writeUInt32BE(bytes.length + 8); head.write(name, 4, 'latin1'); return Buffer.concat([head, bytes]); };
test('GPS QuickTime: odczyt obu półkul, brak fikcyjnego GPS i odporność na uszkodzone atomy', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'prezent-gps-atoms-'));
  const file = path.join(dir, 'test.mov');
  for (const [value, expected] of [['+52.2297+021.0122/', [52.2297, 21.0122]], ['-33.8688+151.2093/', [-33.8688, 151.2093]], ['+99.0000+021.0000/', null], ['no GPS', null]]) {
    await writeFile(file, atom('moov', atom('udta', atom('©xyz', Buffer.from(value)))));
    const location = await readVideoGps(file);
    assert.deepEqual(location ? [location.lat, location.lng] : null, expected);
  }
  await writeFile(file, Buffer.from([0xff, 0xff, 0xff, 0xff, 109, 111, 111, 118]));
  assert.equal(await readVideoGps(file), undefined);
});
