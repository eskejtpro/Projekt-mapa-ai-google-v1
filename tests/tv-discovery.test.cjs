const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseRenderer } = require('../electron/tv-discovery.cjs');
const reply = Buffer.from('HTTP/1.1 200 OK\r\nST: urn:schemas-upnp-org:device:MediaRenderer:1\r\nUSN: uuid:synthetic-tv\r\nSERVER: Synthetic TV\r\n\r\n');
test('SSDP rozpoznaje lokalny renderer i odrzuca obcy typ oraz publiczny adres', () => {
  assert.equal(parseRenderer(reply, '192.168.1.20').id, 'uuid:synthetic-tv');
  assert.equal(parseRenderer(reply, '8.8.8.8'), null);
  assert.equal(parseRenderer(Buffer.from(reply.toString().replace('MediaRenderer', 'MediaServer')), '192.168.1.20'), null);
});
