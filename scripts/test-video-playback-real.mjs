import './test-environment.mjs';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
const tools = process.env.PREZENT_FFMPEG_DIR || path.join(process.env.LOCALAPPDATA || '', 'prezent-video-test-tools-20261018', 'ffmpeg', 'ffmpeg-9.0.2-essentials_build', 'bin');
const samples = mkdtempSync(path.join(tmpdir(), 'prezent-real-codecs-'));
const results = [];
const codecs = [['h264-aac', 'libx264', 'h264', 'aac', 'mp4'], ['vp8-opus', 'libvpx', 'vp8', 'libopus', 'webm'], ['vp9-opus', 'libvpx-vp9', 'vp9', 'libopus', 'webm']];
for (const [name, encoder, codec, audio, ext] of codecs) {
  const file = path.join(samples, `${name}.${ext}`);
  const generate = spawnSync(path.join(tools, 'ffmpeg.exe'), ['-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', 'testsrc=size=320x240:rate=15', '-f', 'lavfi', '-i', 'sine=frequency=440:sample_rate=48000', '-t', '3', '-c:v', encoder, '-pix_fmt', 'yuv420p', '-c:a', audio, file], { windowsHide: true, timeout: 60000 });
  assert.equal(generate.status, 0, generate.error?.message || generate.stderr?.toString());
  const probe = spawnSync(path.join(tools, 'ffprobe.exe'), ['-v', 'error', '-show_streams', '-of', 'json', file], { encoding: 'utf8', windowsHide: true, timeout: 10000 });
  assert.equal(probe.status, 0); const streams = JSON.parse(probe.stdout).streams;
  assert.equal(streams.find(s => s.codec_type === 'video').codec_name, codec);
  assert.equal(streams.find(s => s.codec_type === 'audio').codec_name, audio === 'libopus' ? 'opus' : audio);
  const run = spawnSync(process.execPath, ['--test', '--test-timeout=90000', 'tests/electron-gallery.e2e.mjs'], { stdio: 'inherit', timeout: 120000, windowsHide: true, env: { ...process.env, PREZENT_REAL_VIDEO: file, PREZENT_CODEC_ONLY: '1' } });
  results.push({ name, passed: run.status === 0, codec, audio, audioOutput: 'UNVERIFIED: manual listening required' });
  mkdirSync('reports', { recursive: true }); writeFileSync('reports/video-playback-real.json', JSON.stringify({ passed: results.every(r => r.passed), results }, null, 2));
  assert.equal(run.status, 0, `${name} failed: ${run.error?.message || run.status}`);
}
const heavyFile = path.join(samples, `${codecs[0][0]}.${codecs[0][4]}`);
const heavyRun = spawnSync(process.execPath, ['--test', '--test-timeout=120000', 'tests/electron-gallery.e2e.mjs'], { stdio: 'inherit', timeout: 180000, windowsHide: true, env: { ...process.env, PREZENT_REAL_VIDEO: heavyFile } });
results.push({ name: 'large-library-and-backup-once', passed: heavyRun.status === 0, codec: codecs[0][2], audio: codecs[0][3], audioOutput: 'UNVERIFIED: manual listening required' });
mkdirSync('reports', { recursive: true }); writeFileSync('reports/video-playback-real.json', JSON.stringify({ passed: results.every(r => r.passed), results }, null, 2));
assert.equal(heavyRun.status, 0, `large-library failed: ${heavyRun.error?.message || heavyRun.status}`);
console.log('PASS: H.264/AAC, VP8/Opus and VP9/Opus in production Electron UI, offline and with backup/restore. Speaker output UNVERIFIED.');
