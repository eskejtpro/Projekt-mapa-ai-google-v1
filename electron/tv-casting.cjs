const http = require('node:http');
const { createReadStream, realpathSync, statSync } = require('node:fs');
const { randomBytes } = require('node:crypto');
const path = require('node:path');
const { networkInterfaces } = require('node:os');
const { isIP } = require('node:net');

function isPrivateAddress(value) {
  const address = String(value || '').replace(/^::ffff:/, '');
  if (isIP(address) !== 4) return address === '::1';
  return address === '127.0.0.1' || address === '::1' || /^10\./.test(address) || /^192\.168\./.test(address) || /^172\.(1[6-9]|2\d|3[01])\./.test(address) || /^169\.254\./.test(address);
}

function safeUrl(value, allowLoopback = true) {
  const url = new URL(value);
  if (url.protocol !== 'http:' || url.username || url.password || url.port && (!/^\d+$/.test(url.port) || Number(url.port) < 1 || Number(url.port) > 65535)) throw new Error('Niebezpieczny adres odbiornika');
  if (!isPrivateAddress(url.hostname) || (!allowLoopback && ['127.0.0.1', 'localhost'].includes(url.hostname))) throw new Error('Odbiornik musi znajdować się w prywatnej sieci LAN');
  return url;
}

function xmlTag(xml, name) {
  const match = new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i').exec(xml);
  return match ? match[1].trim() : '';
}
function xmlUnescape(value) { return value.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&'); }
function parseDeviceDescription(xml, location) {
  const base = new URL(xmlTag(xml, 'URLBase') || location);
  const services = [];
  const serviceRe = /<service>([\s\S]*?)<\/service>/gi;
  let match;
  while ((match = serviceRe.exec(xml))) {
    const body = match[1];
    const serviceType = xmlUnescape(xmlTag(body, 'serviceType'));
    const controlURL = xmlUnescape(xmlTag(body, 'controlURL'));
    if (serviceType && controlURL) services.push({ serviceType, controlURL: new URL(controlURL, base).toString() });
  }
  const avTransport = services.find(service => /AVTransport/.test(service.serviceType));
  if (!avTransport) throw new Error('Odbiornik nie udostępnia usługi DLNA AVTransport');
  return { friendlyName: xmlUnescape(xmlTag(xml, 'friendlyName')) || 'Odtwarzacz DLNA', manufacturer: xmlUnescape(xmlTag(xml, 'manufacturer')), services, avTransport };
}

function requestText(url, options = {}) {
  const target = safeUrl(url);
  return new Promise((resolve, reject) => {
    const request = http.request(target, { ...options, timeout: 2500, headers: { ...(options.headers || {}), Connection: 'close' } }, response => {
      let body = ''; response.setEncoding('utf8'); response.on('data', chunk => { body += chunk; if (Buffer.byteLength(body) > 256 * 1024) request.destroy(new Error('Odpowiedź odbiornika przekracza limit')); });
      response.once('error', reject);
      response.on('end', () => response.statusCode >= 200 && response.statusCode < 300 ? resolve(body) : reject(new Error(`Odbiornik HTTP ${response.statusCode}`)));
    });
    request.once('timeout', () => request.destroy(new Error('Przekroczono czas odpowiedzi odbiornika')));
    const deadline = setTimeout(() => request.destroy(new Error('Przekroczono czas operacji DLNA')), 5000);
    request.once('close', () => clearTimeout(deadline));
    request.once('error', reject); if (options.body) request.write(options.body); request.end();
  });
}

async function hydrateRenderer(device) {
  const location = safeUrl(device.location);
  if (location.hostname !== device.address) throw new Error('Adres opisu musi odpowiadać wykrytemu odbiornikowi');
  const description = parseDeviceDescription(await requestText(location), location.toString());
  if (safeUrl(description.avTransport.controlURL).hostname !== device.address) throw new Error('Usługa sterowania musi należeć do odbiornika');
  return { ...device, name: description.friendlyName, manufacturer: description.manufacturer, controlURL: description.avTransport.controlURL, capabilities: ['discovery', 'photo', 'video', 'play', 'pause', 'stop'] };
}

function soapEnvelope(action, body) {
  return `<?xml version="1.0" encoding="utf-8"?><s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"><s:Body><u:${action} xmlns:u="urn:schemas-upnp-org:service:AVTransport:1">${body}</u:${action}></s:Body></s:Envelope>`;
}
function escapeXml(value) { return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;'); }
function didl(title, url, mimeType) {
  const mediaClass = mimeType.startsWith('image/') ? 'object.item.imageItem.photo' : 'object.item.videoItem';
  const metadata = `<DIDL-Lite xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:upnp="urn:schemas-upnp-org:metadata-1-0/upnp/" xmlns="urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/"><item id="1" parentID="0" restricted="1"><dc:title>${escapeXml(title)}</dc:title><upnp:class>${mediaClass}</upnp:class><res protocolInfo="http-get:*:${escapeXml(mimeType)}:*">${escapeXml(url)}</res></item></DIDL-Lite>`;
  return escapeXml(metadata);
}

class MediaShareServer {
  constructor(allowedRoots = []) { this.allowedRoots = allowedRoots.map(root => realpathSync(root)); this.entries = new Map(); this.server = null; }
  async start() { if (this.server) return; this.server = http.createServer((request, response) => this.#handle(request, response)); await new Promise((resolve, reject) => { this.server.once('error', reject); this.server.listen(0, '0.0.0.0', resolve); }); }
  publish(file, mimeType, title, receiverAddress) {
    if (!this.server) throw new Error('Serwer mediów nie jest uruchomiony');
    const resolved = realpathSync(file); if (!this.allowedRoots.some(root => resolved === root || resolved.startsWith(`${root}${path.sep}`)) || !statSync(resolved).isFile()) throw new Error('Plik nie znajduje się w katalogu mediów aplikacji');
    const token = randomBytes(24).toString('base64url'); this.entries.set(token, { file: resolved, mimeType, title, receiverAddress: String(receiverAddress).replace(/^::ffff:/, '') });
    const local = this.#localAddress(receiverAddress); return `http://${local}:${this.server.address().port}/media/${token}`;
  }
  #localAddress(receiver) { const octets = String(receiver).split('.'); const candidate = Object.values(networkInterfaces()).flat().find(item => item && item.family === 'IPv4' && !item.internal && item.address.split('.').slice(0, 3).join('.') === octets.slice(0, 3).join('.')); return candidate?.address || Object.values(networkInterfaces()).flat().find(item => item && item.family === 'IPv4' && !item.internal)?.address || '127.0.0.1'; }
  #handle(request, response) {
    try {
      const address = (request.socket.remoteAddress || '').replace(/^::ffff:/, ''); if (!isPrivateAddress(address)) return response.writeHead(403).end();
      const match = /^\/media\/([A-Za-z0-9_-]{32})$/.exec(new URL(request.url, 'http://localhost').pathname); const entry = match && this.entries.get(match[1]); if (!entry || entry.receiverAddress !== address) return response.writeHead(404).end();
      if (!['GET', 'HEAD'].includes(request.method)) return response.writeHead(405, { Allow: 'GET, HEAD' }).end();
      const size = statSync(entry.file).size; let start = 0; let end = size - 1; let status = 200; const range = request.headers.range;
      if (range) {
        const parsed = /^bytes=(\d*)-(\d*)$/.exec(range);
        const invalid = () => response.writeHead(416, { 'Content-Range': `bytes */${size}` }).end();
        if (!parsed || !(parsed[1] || parsed[2])) return invalid();
        if (!parsed[1]) {
          const suffix = Number(parsed[2]);
          if (!Number.isSafeInteger(suffix) || suffix <= 0) return invalid();
          start = Math.max(0, size - suffix);
        } else {
          start = Number(parsed[1]);
          end = parsed[2] ? Number(parsed[2]) : size - 1;
        }
        if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= size || start > end) return invalid();
        end = Math.min(end, size - 1); status = 206;
      }
      const headers = { 'Content-Type': entry.mimeType, 'Content-Length': String(end - start + 1), 'Accept-Ranges': 'bytes', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-store' }; if (status === 206) headers['Content-Range'] = `bytes ${start}-${end}/${size}`;
      response.writeHead(status, headers);
      if (request.method === 'HEAD' || size === 0) return response.end();
      const stream = createReadStream(entry.file, { start, end });
      stream.on('error', () => response.destroy());
      response.on('close', () => stream.destroy());
      stream.pipe(response);
    } catch { response.writeHead(404).end(); }
  }
  revokeAll() { this.entries.clear(); }
  async close() { this.entries.clear(); const server = this.server; this.server = null; if (server) await new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }); }
}

class DlnaCasting {
  constructor(resolveMedia, allowedRoots) { this.resolveMedia = resolveMedia; this.share = new MediaShareServer(allowedRoots); this.devices = new Map(); this.connected = null; this.cancelled = false; }
  setDevices(devices) { this.devices = new Map(devices.map(device => [device.id, device])); }
  async connect(deviceId) { const device = this.devices.get(deviceId); if (!device) throw new Error('Nieznany odbiornik'); const hydrated = device.controlURL ? device : await hydrateRenderer(device); this.devices.set(deviceId, hydrated); this.connected = hydrated; await this.share.start(); return { ...hydrated, status: 'connected' }; }
  async #soap(action, body) { if (!this.connected) throw new Error('Najpierw połącz odbiornik'); const bodyXml = soapEnvelope(action, `<InstanceID>0</InstanceID>${body}`); const response = await requestText(this.connected.controlURL, { method: 'POST', headers: { 'Content-Type': 'text/xml; charset="utf-8"', SOAPAction: `"urn:schemas-upnp-org:service:AVTransport:1#${action}"`, 'Content-Length': Buffer.byteLength(bodyXml) }, body: bodyXml }); if (/Fault|Error/i.test(response) && !/<u:/.test(response)) throw new Error('Odbiornik odrzucił operację DLNA'); return response; }
  async play(media) { const resolved = await this.resolveMedia(media); const url = this.share.publish(resolved.file, resolved.mimeType, resolved.title, this.connected.address); await this.#soap('SetAVTransportURI', `<CurrentURI>${escapeXml(url)}</CurrentURI><CurrentURIMetaData>${didl(resolved.title, url, resolved.mimeType)}</CurrentURIMetaData>`); await this.#soap('Play', '<Speed>1</Speed>'); return { url, title: resolved.title, mimeType: resolved.mimeType }; }
  async control(action) { const actions = { pause: 'Pause', stop: 'Stop', play: 'Play' }; if (!actions[action]) throw new Error('Nieznane sterowanie DLNA'); if (action === 'stop') this.cancelShow?.abort(); await this.#soap(actions[action], action === 'play' ? '<Speed>1</Speed>' : ''); if (action === 'stop') this.share.revokeAll(); return { status: action }; }
  async slideshow(items, intervalMs = 8000) {
    this.cancelShow?.abort();
    const controller = new AbortController(); this.cancelShow = controller;
    const { setTimeout: wait } = require('node:timers/promises');
    try {
      for (const item of items.slice(0, 500)) {
        if (controller.signal.aborted) break;
        await this.play(item);
        if (item.kind === 'photo') await wait(intervalMs, undefined, { signal: controller.signal });
        else {
          let started = false; let startupPolls = 0;
          do {
            await wait(1000, undefined, { signal: controller.signal });
            const state = xmlTag(await this.#soap('GetTransportInfo', ''), 'CurrentTransportState');
            if (state === 'PLAYING') started = true;
            if (!started && ++startupPolls >= 10) throw new Error('Odbiornik nie potwierdził rozpoczęcia filmu');
            if (started && state === 'STOPPED') break;
            if (!['PLAYING', 'PAUSED_PLAYBACK', 'TRANSITIONING', 'STOPPED'].includes(state)) throw new Error('Odbiornik nie potwierdził stanu filmu');
          } while (!controller.signal.aborted);
        }
      }
    } catch (error) { if (error.name !== 'AbortError') throw error; }
  }
  async disconnect() { this.cancelled = true; this.cancelShow?.abort(); try { if (this.connected) await this.#soap('Stop', ''); } catch {} this.connected = null; await this.share.close(); }
}

module.exports = { isPrivateAddress, parseDeviceDescription, hydrateRenderer, MediaShareServer, DlnaCasting, escapeXml, didl };
