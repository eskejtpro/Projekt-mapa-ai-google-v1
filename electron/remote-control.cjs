const http = require('node:http');
const { randomBytes, timingSafeEqual } = require('node:crypto');
const { networkInterfaces } = require('node:os');
const COMMANDS = new Set(['next', 'previous', 'toggle-play', 'close']);
const PAGE = `<!doctype html><html lang="pl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pilot Prezent Mapy</title><style>body{background:#0b1120;color:#eee;font:18px system-ui;max-width:460px;margin:40px auto;padding:20px}button{width:100%;padding:22px;margin:8px 0;border:0;border-radius:16px;background:#f59e0b;font:inherit;color:#111}p{color:#a5b4cc}</style><h1>Prezent Mapy</h1><p>Pilot pokazu na komputerze</p><button data-command="previous">Poprzednie zdjęcie</button><button data-command="toggle-play">Pauza / odtwarzanie</button><button data-command="next">Następne zdjęcie</button><button data-command="close">Zakończ pokaz</button><p id="status" role="status">Połączono z panelem pilota</p><script>const token=location.hash.slice(1);history.replaceState(null,'',location.pathname);document.querySelectorAll('button').forEach(button=>button.onclick=async()=>{try{const response=await fetch('/command',{method:'POST',headers:{'Authorization':'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({command:button.dataset.command})});document.getElementById('status').textContent=response.ok?'Polecenie wysłane':'Sesja wygasła lub polecenie odrzucone';}catch{document.getElementById('status').textContent='Brak połączenia z komputerem';}});</script></html>`;
class RemoteControl {
  constructor(onCommand) { this.onCommand = onCommand; this.server = null; }
  async start(host = '0.0.0.0') {
    if (this.server) { if (!this.session) throw new Error('Pilot uruchamia się'); return this.session; }
    const token = randomBytes(32).toString('hex');
    const addresses = Object.values(networkInterfaces()).flat().filter(info => info && info.family === 'IPv4' && !info.internal && /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(info.address)).map(info => info.address);
    const allowedHosts = new Set(['127.0.0.1', ...addresses]);
    let recent = [];
    this.server = http.createServer((request, response) => {
      const peer = request.socket.remoteAddress?.replace(/^::ffff:/, '') || '';
      if (!/^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(peer)) { response.writeHead(403).end(); return; }
      response.setHeader('Cache-Control', 'no-store');
      response.setHeader('Referrer-Policy', 'no-referrer');
      response.setHeader('X-Content-Type-Options', 'nosniff');
      response.setHeader('Content-Security-Policy', "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'");
      const hostname = request.headers.host?.split(':')[0];
      if (!allowedHosts.has(hostname)) { response.writeHead(403).end(); return; }
      if (request.method === 'GET' && request.url === '/') { response.setHeader('Content-Type', 'text/html; charset=utf-8'); response.end(PAGE); return; }
      if (request.method !== 'POST' || request.url !== '/command') { response.writeHead(404).end(); return; }
      if (request.headers.origin && request.headers.origin !== `http://${request.headers.host}`) { response.writeHead(403).end(); return; }
      const provided = Buffer.from(request.headers.authorization || '');
      const expected = Buffer.from(`Bearer ${token}`);
      if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) { response.writeHead(401).end(); return; }
      recent = recent.filter(time => Date.now() - time < 1000);
      if (recent.length >= 10) { response.writeHead(429).end(); return; }
      recent.push(Date.now());
      let body = '';
      request.on('data', chunk => { body += chunk; if (body.length > 1024) request.destroy(); });
      request.on('end', () => {
        try {
          const { command } = JSON.parse(body);
          if (!COMMANDS.has(command)) { response.writeHead(400).end(); return; }
          this.onCommand(command);
          response.writeHead(204).end();
        } catch { response.writeHead(400).end(); }
      });
    });
    this.server.requestTimeout = 5000;
    this.server.headersTimeout = 5000;
    await new Promise((resolve, reject) => { this.server.once('error', reject); this.server.listen(0, host, resolve); });
    const port = this.server.address().port;
    this.session = { urls: (addresses.length ? addresses : ['127.0.0.1']).map(address => `http://${address}:${port}/#${token}`), port };
    this.expiry = setTimeout(() => void this.stop(), 2 * 60 * 60 * 1000);
    this.expiry.unref();
    return this.session;
  }
  async stop() {
    clearTimeout(this.expiry);
    const server = this.server;
    this.server = null;
    this.session = null;
    if (server) { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
  }
}
module.exports = { RemoteControl };
