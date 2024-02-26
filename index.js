const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading index.html');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    } else if (req.url.startsWith('/socket.io')) {
        // Serve socket.io client library
        fs.readFile(path.join(__dirname, req.url), (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading socket.io.js');
            } else {
                res.writeHead(200, { 'Content-Type': 'application/javascript' });
                res.end(data);
            }
        });
    } else {
        // Serve other static files like style.css
        const filePath = path.join(__dirname, req.url);
        fs.exists(filePath, (exists) => {
            if (exists) {
                fs.readFile(filePath, (err, data) => {
                    if (err) {
                        res.writeHead(500);
                        res.end('Error loading ' + req.url);
                    } else {
                        const contentType = getContentType(req.url);
                        res.writeHead(200, { 'Content-Type': contentType });
                        res.end(data);
                    }
                });
            } else {
                res.writeHead(404);
                res.end('File not found');
            }
        });
    }
});

function getContentType(url) {
    const extname = path.extname(url);
    switch (extname) {
        case '.js':
            return 'text/javascript';
        case '.css':
            return 'text/css';
        default:
            return 'text/plain';
    }
}

const io = require('socket.io')(server);
const port = 5000;

io.on('connection', (socket) => {
    socket.on('send name', (user) => {
        io.emit('send name', user);
    });

    socket.on('send message', (chat) => {
        io.emit('send message', chat);
    });
});

server.listen(port, () => {
    console.log(`Server is listening at the port: ${port}`);
});
