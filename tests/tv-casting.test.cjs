const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { parseDeviceDescription, MediaShareServer, DlnaCasting, didl, hydrateRenderer, isPrivateAddress, soapFault } = require('../electron/tv-casting.cjs');

test('SOAP Fault zwraca kod i opis zamiast fałszywego sukcesu', () => {
  const fault = soapFault('<s:Fault><faultcode>s:Client</faultcode><faultstring>Invalid URI</faultstring><detail><UPnPError><errorCode>714</errorCode><errorDescription>Illegal MIME-Type</errorDescription></UPnPError></detail></s:Fault>');
  assert.deepEqual(fault, { code: '714', description: 'Illegal MIME-Type' });
  assert.equal(soapFault('<s:Envelope><s:Body><u:PlayResponse/></s:Body></s:Envelope>'), null);
});

test('DlnaCasting propaguje SOAP Fault zarówno przy HTTP 200, jak i 500', async () => {
  const deviceServer = http.createServer((req, res) => {
    if (req.url === '/device-200.xml') return res.end(description('TV fault 200').replace('/upnp/control', '/upnp/control-200'));
    if (req.url === '/device-500.xml') return res.end(description('TV fault 500').replace('/upnp/control', '/upnp/control-500'));
    res.writeHead(req.url === '/upnp/control-500' ? 500 : 200, { 'Content-Type': 'text/xml' });
    res.end('<s:Envelope><s:Body><s:Fault><detail><UPnPError><errorCode>714</errorCode><errorDescription>Illegal MIME-Type</errorDescription></UPnPError></detail></s:Fault></s:Body></s:Envelope>');
  });
  await new Promise(resolve => deviceServer.listen(0, '127.0.0.1', resolve));
  const port = deviceServer.address().port;
  try {
    for (const status of [200, 500]) {
      const casting = new DlnaCasting(async () => ({ file: __filename, mimeType: 'video/mp4', title: 'Fault' }), []);
      casting.setDevices([{ id: `fault-${status}`, address: '127.0.0.1', location: `http://127.0.0.1:${port}/device-${status}.xml` }]);
      await casting.connect(`fault-${status}`);
      await assert.rejects(() => casting.control('stop'), /SOAP Fault 714: Illegal MIME-Type/);
      await casting.disconnect();
    }
  } finally { await new Promise(resolve => deviceServer.close(resolve)); }
});

test('DIDL preserves escaped title inside SOAP and declares the media class', () => {
  const soapValue = didl('A & <B>', 'http://192.168.1.2/media/token', 'video/mp4');
  assert.ok(soapValue.includes('A &amp;amp; &amp;lt;B&amp;gt;'));
  assert.ok(soapValue.includes('object.item.videoItem'));
});

const description = name => `<?xml version="1.0"?><root><device><friendlyName>${name}</friendlyName><manufacturer>Test TV</manufacturer><serviceList><service><serviceType>urn:schemas-upnp-org:service:AVTransport:1</serviceType><controlURL>/upnp/control</controlURL></service></serviceList></device></root>`;

test('opis DLNA wymaga AVTransport i rozwiązuje względny controlURL', () => {
  const parsed = parseDeviceDescription(description('TV testowy'), 'http://127.0.0.1:1234/device.xml');
  assert.equal(parsed.friendlyName, 'TV testowy');
  assert.equal(parsed.avTransport.controlURL, 'http://127.0.0.1:1234/upnp/control');
  assert.throws(() => parseDeviceDescription('<root><device><friendlyName>No AV</friendlyName></device></root>', 'http://127.0.0.1:1/x'), /AVTransport/);
});

test('SSRF rejects public, invalid and mismatched receiver addresses before fetching', async () => {
  assert.equal(isPrivateAddress('192.168.invalid'), false);
  assert.equal(isPrivateAddress('8.8.8.8'), false);
  await assert.rejects(hydrateRenderer({ address: '192.168.1.4', location: 'http://8.8.8.8/device.xml' }), /LAN/);
  await assert.rejects(hydrateRenderer({ address: '192.168.1.4', location: 'http://127.0.0.1/device.xml' }), /Adres opisu/);
});

test('media server denies files outside roots, other receivers and missing files', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'prezent-tv-security-'));
  const allowed = path.join(root, 'allowed'); fs.mkdirSync(allowed);
  const file = path.join(allowed, 'image.png'); fs.writeFileSync(file, 'image');
  const outside = path.join(root, 'private.txt'); fs.writeFileSync(outside, 'private');
  const share = new MediaShareServer([allowed]);
  try {
    await share.start();
    assert.throws(() => share.publish(outside, 'text/plain', 'private', '127.0.0.1'), /katalogu mediów/);
    const onlyReceiver = share.publish(file, 'image/png', 'image', '192.168.1.99').replace(/^http:\/\/[^:]+/, 'http://127.0.0.1');
    assert.equal((await fetch(onlyReceiver)).status, 404);
    const url = share.publish(file, 'image/png', 'image', '127.0.0.1').replace(/^http:\/\/[^:]+/, 'http://127.0.0.1');
    fs.unlinkSync(file);
    assert.equal((await fetch(url)).status, 404);
  } finally { await share.close(); fs.rmSync(root, { recursive: true, force: true }); }
});

test('casting symulatora wykonuje opis, SOAP, ograniczony plik i HTTP Range', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'prezent-tv-'));
  const file = path.join(root, 'sample.mp4'); fs.writeFileSync(file, Buffer.from('0123456789abcdef'));
  const soapActions = [];
  const deviceServer = http.createServer((req, res) => {
    if (req.url === '/device.xml') { res.writeHead(200, { 'Content-Type': 'text/xml' }); return res.end(description('TV symulator')); }
    if (req.url === '/upnp/control') { soapActions.push(req.headers.soapaction); res.writeHead(200, { 'Content-Type': 'text/xml' }); return res.end('<s:Envelope><s:Body><u:OK/></s:Body></s:Envelope>'); }
    res.writeHead(404); res.end();
  });
  await new Promise(resolve => deviceServer.listen(0, '127.0.0.1', resolve));
  const port = deviceServer.address().port;
  const casting = new DlnaCasting(async () => ({ file, mimeType: 'video/mp4', title: 'Próbka' }), [root]);
  try {
    casting.setDevices([{ id: 'uuid:test', address: '127.0.0.1', location: `http://127.0.0.1:${port}/device.xml`, description: 'Synthetic', protocol: 'DLNA/SSDP' }]);
    const connected = await casting.connect('uuid:test'); assert.equal(connected.status, 'connected');
    const played = await casting.play({ kind: 'video', id: 'video-test' });
    assert.match(played.url, /^http:\/\/[^:]+:\d+\/media\/[A-Za-z0-9_-]{32}$/);
    const localUrl = played.url.replace(/^http:\/\/[^:]+/, 'http://127.0.0.1');
    const full = await fetch(localUrl); assert.equal(full.status, 200); assert.equal(await full.text(), '0123456789abcdef');
    const partial = await fetch(localUrl, { headers: { Range: 'bytes=2-5' } }); assert.equal(partial.status, 206); assert.equal(await partial.text(), '2345');
    const suffix = await fetch(localUrl, { headers: { Range: 'bytes=-4' } }); assert.equal(suffix.status, 206); assert.equal(await suffix.text(), 'cdef');
    assert.equal((await fetch(localUrl, { headers: { Range: 'bytes=-0' } })).status, 416);
    assert.equal((await fetch(localUrl, { headers: { Range: 'bytes=-' } })).status, 416);
    const head = await fetch(localUrl, { method: 'HEAD' }); assert.equal(head.headers.get('content-length'), '16');
    assert.equal((await fetch(localUrl, { method: 'POST' })).status, 405);
    assert.equal((await fetch(`${localUrl}/escape`)).status, 404);
    await casting.control('pause'); await casting.control('stop'); assert.ok(soapActions.some(action => action.includes('#SetAVTransportURI'))); assert.ok(soapActions.some(action => action.includes('#Play'))); assert.ok(soapActions.some(action => action.includes('#Pause')));
    assert.equal((await fetch(localUrl)).status, 404, 'Stop revokes shared media');
    const show = casting.slideshow([{ kind: 'photo', id: 'one' }, { kind: 'photo', id: 'two' }], 10000);
    await new Promise(resolve => setTimeout(resolve, 50));
    await casting.control('stop');
    await show;
    assert.equal(soapActions.filter(action => action.includes('#SetAVTransportURI')).length, 2, 'Stop prevents advancing to second photo');
    await casting.disconnect(); await assert.rejects(() => fetch(localUrl), /fetch failed|ECONNREFUSED/);
  } finally { await casting.disconnect(); await new Promise(resolve => deviceServer.close(resolve)); fs.rmSync(root, { recursive: true, force: true }); }
});

test('Stop anuluje opóźnione SetAVTransportURI i nie wysyła Play', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'prezent-tv-cancel-'));
  const file = path.join(root, 'sample.mp4'); fs.writeFileSync(file, 'video');
  const actions = [];
  const deviceServer = http.createServer((req, res) => {
    if (req.url === '/device.xml') return res.end(description('TV cancel'));
    if (req.url === '/upnp/control') {
      let body = ''; req.on('data', chunk => { body += chunk; }); req.on('end', () => {
        const action = req.headers.soapaction; actions.push(action);
        if (action.includes('#SetAVTransportURI')) return setTimeout(() => res.end('<s:Envelope><s:Body><u:OK/></s:Body></s:Envelope>'), 300);
        res.end('<s:Envelope><s:Body><u:OK/></s:Body></s:Envelope>');
      });
      return;
    }
    res.writeHead(404); res.end();
  });
  await new Promise(resolve => deviceServer.listen(0, '127.0.0.1', resolve));
  const port = deviceServer.address().port;
  const casting = new DlnaCasting(async () => ({ file, mimeType: 'video/mp4', title: 'Próbka' }), [root]);
  try {
    casting.setDevices([{ id: 'uuid:cancel', address: '127.0.0.1', location: `http://127.0.0.1:${port}/device.xml` }]);
    await casting.connect('uuid:cancel');
    const show = casting.slideshow([{ kind: 'video', id: 'video-cancel' }]);
    await new Promise(resolve => setTimeout(resolve, 40));
    await casting.control('stop');
    await show;
    assert.equal(actions.filter(action => action.includes('#Play')).length, 0);
    const pending = casting.play({ kind: 'video', id: 'standalone-cancel' });
    const rejected = assert.rejects(pending, { name: 'AbortError' });
    await new Promise(resolve => setTimeout(resolve, 40));
    await casting.control('stop');
    await rejected;
    assert.equal(actions.filter(action => action.includes('#Play')).length, 0, 'Standalone Play must also respect Stop');
  } finally { await casting.disconnect(); await new Promise(resolve => deviceServer.close(resolve)); fs.rmSync(root, { recursive: true, force: true }); }
});
