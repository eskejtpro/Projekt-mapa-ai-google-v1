import './test-environment.mjs';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { extractVideoMetadata, VideoLibrary } = require('../electron/video-library.cjs');
const tools = process.env.PREZENT_FFMPEG_DIR || path.join(process.env.LOCALAPPDATA || '', 'prezent-video-test-tools-20261018', 'ffmpeg', 'ffmpeg-9.0.2-essentials_build', 'bin');
const ffmpeg = path.join(tools, 'ffmpeg.exe'); const ffprobe = path.join(tools, 'ffprobe.exe');
if (!existsSync(ffmpeg) || !existsSync(ffprobe)) throw new Error('Ustaw PREZENT_FFMPEG_DIR na katalog portable FFmpeg/ffprobe. Test nie został wykonany.');
const root = mkdtempSync(path.join(tmpdir(), 'prezent-real-gps-'));
const results = [];
for (const [ext, tag, lat, lng] of [['mp4', '+52.2297+021.0122/', 52.2297, 21.0122], ['mov', '-33.8688+151.2093/', -33.8688, 151.2093]]) {
  const file = path.join(root, `sample.${ext}`);
  const generated = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', 'testsrc=size=160x90:rate=10', '-f', 'lavfi', '-i', 'sine=frequency=440:sample_rate=44100', '-t', '2', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-metadata', `location=${tag}`, file], { timeout: 60000, windowsHide: true });
  assert.equal(generated.status, 0, generated.stderr?.toString());
  const probed = spawnSync(ffprobe, ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', file], { timeout: 10000, windowsHide: true, encoding: 'utf8' });
  assert.equal(probed.status, 0); const info = JSON.parse(probed.stdout);
  assert.equal(info.streams[0].codec_name, 'h264'); assert.equal(info.streams[1].codec_name, 'aac');
  assert.ok(info.format.tags.location.includes(tag.slice(0, 8)));
  const detected = await extractVideoMetadata(file);
  assert.ok(Math.abs(detected.location.lat - lat) < 0.00003); assert.ok(Math.abs(detected.location.lng - lng) < 0.00003);
  if (ext === 'mp4') {
    let library = new VideoLibrary(path.join(root, 'library.sqlite'), path.join(root, 'videos'));
    const imported = await library.importVideo(file); library.close();
    library = new VideoLibrary(path.join(root, 'library.sqlite'), path.join(root, 'videos'));
    assert.equal(library.list()[0].locationSource, 'metadata'); assert.equal(library.list()[0].id, imported.item.id); library.close();
  }
  results.push({ container: ext, codecs: ['h264', 'aac'], tag: info.format.tags.location, detected, playback: ext === 'mov' ? 'NOT SUPPORTED: import remains MP4/WebM' : 'tested separately in Electron' });
}
mkdirSync('reports', { recursive: true }); writeFileSync('reports/video-gps-real.json', JSON.stringify({ passed: true, results }, null, 2));
console.log('PASS: real MP4/loci and MOV/QuickTime GPS, ffprobe codec proof, MP4 import and SQLite reopen.');
