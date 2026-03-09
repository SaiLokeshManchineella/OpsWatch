// ── WebSocket Connection Manager ──────────────────────────
const WebSocket = require('ws');

let wss = null;

/**
 * Initialize the WebSocket server on the given HTTP server.
 */
function init(server) {
    wss = new WebSocket.Server({ server, path: '/ws' });

    wss.on('connection', (ws) => {
        console.log('[WS] Client connected');
        ws.on('close', () => console.log('[WS] Client disconnected'));
        ws.on('error', (err) => console.error('[WS] Error:', err.message));
    });
}

/**
 * Broadcast a JSON message to all connected clients.
 */
function broadcast(message) {
    if (!wss) return;
    const data = JSON.stringify(message);
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

module.exports = { init, broadcast };
