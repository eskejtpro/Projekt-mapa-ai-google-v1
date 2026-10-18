const test = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { videoResponse } = require('../electron/video-response.cjs');
test('protokół wideo: częściowy odczyt, suffix, HEAD i odrzucenie nieprawidłowych żądań', async () => {
  const root = mkdtempSync(path.join(tmpdir(), 'prezent-range-')); const file = path.join(root, 'film.webm'); writeFileSync(file, Buffer.from('0123456789'));
  const library = { pathFor: id => { assert.equal(id, 'video-1234'); return file; } };
  const request = (range, method = 'GET', url = 'prezent-video://local/video-1234') => videoResponse(library, { url, method, headers: new Headers(range ? { range } : {}) });
  assert.equal(await request('bytes=2-4').text(), '234');
  assert.equal(await request('bytes=-3').text(), '789');
  assert.equal(await request(null, 'HEAD').text(), '');
  for (const range of ['bytes=-', 'bytes=-0', 'bytes=10-', 'bytes=4-2', 'bytes=0-1,3-4', 'bytes=9999999999999999999-']) assert.equal(request(range).status, 416);
  assert.equal(request(null, 'POST').status, 405);
  assert.equal(videoResponse(library, { url: 'prezent-video://local/video-1234', method: 'GET', headers: new Headers(), initiatorOrigin: 'https://example.com' }).status, 403);
  for (const url of ['prezent-video://other/video-1234', 'prezent-video://local/%2e%2e/foo', 'prezent-video://local/video-1234?file=x', 'prezent-video://name@local/video-1234']) assert.equal(request(null, 'GET', url).status, 400);
});
