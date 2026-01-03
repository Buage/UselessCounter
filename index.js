const http = require('http');
const fs = require('fs');
const hyperswarmPkg = require('hyperswarm')
const hyperswarm = hyperswarmPkg.default || hyperswarmPkg
const crypto = require('crypto')
const websocket = require('ws');

const port = process.env.PORT || 4729

const swarm = new hyperswarm();
const topic = crypto
  .createHash('sha256')
  .update('useless-clicker-app-buagedev')
  .digest()

const peers = new Set();
const peerId = crypto.randomBytes(16).toString('hex');

let counter = {
    [peerId]: 0
}

swarm.join(topic, { lookup: true, announce: true })
swarm.on('connection', (socket, info) => {
    peers.add(socket);
    socket.write(JSON.stringify(counter));

    socket.on('data', data => {
        const update = JSON.parse(data.toString());
        for (let id in update) {
            counter[id] = Math.max(counter[id] || 0, update[id]);
        }
    });

    socket.on('close', () => {
        peers.delete(socket);
    });
});

function broadcastCounter() {
    for (const peer of peers) {
        peer.write(JSON.stringify(counter));
    }
}

function getTotal() {
  return Object.values(counter).reduce((a, b) => a + b, 0)
}

function broadcastWS() {
    const payload = JSON.stringify({ peers: peers.size, direct: peers.size, total: getTotal() })
    ws.clients.forEach(client => {
        if (client.readyState === websocket.OPEN) client.send(payload)
    })
}

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
        fs.readFile('index.html', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    }
    else if (req.url === '/clicks' && req.method === 'POST') {
        counter[peerId]++;
        broadcastCounter();
        broadcastWS();
        res.end(JSON.stringify({ total: getTotal() }));
    } else if (req.url === '/getClicks' && req.method === 'GET') {
        res.end(JSON.stringify({ total: getTotal() }))
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

const ws = new websocket.Server({ server })
ws.on('connection', socket => {
    socket.send(JSON.stringify({ peers: peers.size, direct: peers.size, total: getTotal() }));

    const interval = setInterval(() => {
        socket.send(JSON.stringify({ peers: peers.size, direct: peers.size, total: getTotal() }));
    }, 1000);

    socket.on('close', () => {
        clearInterval(interval);
    });
})

server.listen(port, () => {
    console.log(`server listening on http://localhost:${port}`);
});
