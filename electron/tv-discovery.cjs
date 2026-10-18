const dgram = require('node:dgram');
const { networkInterfaces } = require('node:os');
function parseRenderer(message, address) {
  if (!/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.)/.test(address) || message.length > 8192) return null;
  const lines = message.toString('utf8').split('\r\n');
  if (!/^HTTP\/1\.1 200\b/.test(lines.shift() || '')) return null;
  const headers = {};
  for (const line of lines) { const colon = line.indexOf(':'); if (colon > 0) headers[line.slice(0, colon).toLowerCase()] = line.slice(colon + 1).trim(); }
  if (!headers.st?.includes('MediaRenderer') || !headers.usn) return null;
  if (!headers.location || !/^https?:\/\//i.test(headers.location)) return null;
  return { id: headers.usn.slice(0, 256), address, location: headers.location.slice(0, 2048), description: (headers.server || 'Odtwarzacz DLNA').slice(0, 256), protocol: 'DLNA/SSDP', capabilities: ['discovery'] };
}
function scanInterface(localAddress, timeout) {
  return new Promise((resolve, reject) => {
    const socket = dgram.createSocket('udp4');
    const found = new Map();
    let timer;
    let settled = false;
    const finish = error => { if (settled) return; settled = true; clearTimeout(timer); socket.close(); if (error) reject(error); else resolve([...found.values()]); };
    socket.once('error', finish);
    socket.on('message', (message, remote) => {
      const device = parseRenderer(message, remote.address);
      if (device && found.size < 100) found.set(device.id, device);
    });
    socket.bind(0, localAddress, () => {
      try { socket.setMulticastInterface(localAddress); socket.setMulticastTTL(2); }
      catch (error) { finish(error); return; }
      const query = Buffer.from('M-SEARCH * HTTP/1.1\r\nHOST: 239.255.255.250:1900\r\nMAN: "ssdp:discover"\r\nMX: 2\r\nST: urn:schemas-upnp-org:device:MediaRenderer:1\r\n\r\n');
      timer = setTimeout(() => finish(), timeout);
      socket.send(query, 1900, '239.255.255.250', error => { if (error) finish(error); });
      setTimeout(() => { if (!settled) socket.send(query, 1900, '239.255.255.250', error => { if (error) finish(error); }); }, Math.min(900, timeout / 2)).unref();
    });
  });
}
async function discoverRenderers(timeout = 3500) {
  const addresses = [...new Set(Object.values(networkInterfaces()).flat().filter(item => item && item.family === 'IPv4' && !item.internal).map(item => item.address))];
  if (!addresses.length) throw new Error('Brak aktywnego interfejsu IPv4 LAN');
  const results = await Promise.allSettled(addresses.map(address => scanInterface(address, timeout)));
  const successful = results.filter(result => result.status === 'fulfilled');
  if (!successful.length) throw new Error('Nie można wysłać zapytania SSDP na żadnym interfejsie LAN');
  return [...new Map(successful.flatMap(result => result.value).map(device => [device.id, device])).values()];
}
module.exports = { discoverRenderers, parseRenderer };
