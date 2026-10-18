const { test } = require('node:test');
const assert = require('node:assert/strict');
const { RemoteControl } = require('../electron/remote-control.cjs');
test('pilot wymaga parowania, odrzuca obce origin i nieznane polecenia', async () => {
  const commands = [];
  const remote = new RemoteControl(command => commands.push(command));
  const session = await remote.start('127.0.0.1');
  const token = new URL(session.urls[0]).hash.slice(1);
  const endpoint = `http://127.0.0.1:${session.port}`;
  try {
    assert.equal((await fetch(endpoint)).status, 200);
    const send = (command, authorization = `Bearer ${token}`, origin = endpoint) => fetch(`${endpoint}/command`, { method: 'POST', headers: { Authorization: authorization, Origin: origin }, body: JSON.stringify({ command }) });
    assert.equal((await send('next', 'Bearer bad')).status, 401);
    assert.equal((await send('next', `Bearer ${token}`, 'https://example.com')).status, 403);
    assert.equal((await send('arbitrary-shell')).status, 400);
    assert.equal((await send('next')).status, 204);
    assert.deepEqual(commands, ['next']);
  } finally { await remote.stop(); }
});
