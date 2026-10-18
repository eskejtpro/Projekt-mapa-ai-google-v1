const { createReadStream, statSync } = require('node:fs');
const { Readable } = require('node:stream');
const path = require('node:path');
function videoResponse(library, request) {
  try {
    if (request.initiatorOrigin && !['null', 'file://'].includes(request.initiatorOrigin)) return new Response(null, { status: 403 });
    const url = new URL(request.url);
    if (url.protocol !== 'prezent-video:' || url.hostname !== 'local' || url.username || url.password || url.port || url.search || url.hash || !/^\/video-[a-f0-9-]+$/.test(url.pathname)) return new Response(null, { status: 400 });
    if (!['GET', 'HEAD'].includes(request.method)) return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } });
    const file = library.pathFor(url.pathname.slice(1));
    const size = statSync(file).size;
    let start = 0; let end = size - 1; let status = 200;
    const range = request.headers.get('range');
    const invalidRange = () => new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (!match || !(match[1] || match[2])) return invalidRange();
      if (!match[1]) {
        const suffix = Number(match[2]);
        if (!Number.isSafeInteger(suffix) || suffix <= 0) return invalidRange();
        start = Math.max(0, size - suffix);
      } else {
        start = Number(match[1]);
        end = match[2] ? Number(match[2]) : Math.min(start + 1024 * 1024 - 1, end);
      }
      if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= size || start > end) return invalidRange();
      end = Math.min(end, size - 1); status = 206;
    }
    const headers = { 'Accept-Ranges': 'bytes', 'Content-Length': String(end - start + 1), 'Content-Type': path.extname(file).toLowerCase() === '.webm' ? 'video/webm' : 'video/mp4', 'Access-Control-Allow-Origin': 'null', 'X-Content-Type-Options': 'nosniff' };
    if (status === 206) headers['Content-Range'] = `bytes ${start}-${end}/${size}`;
    return new Response(request.method === 'HEAD' ? null : Readable.toWeb(createReadStream(file, { start, end })), { status, headers });
  } catch { return new Response(null, { status: 404 }); }
}
module.exports = { videoResponse };
