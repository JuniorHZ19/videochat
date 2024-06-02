const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log('Un cliente se ha conectado');

    // Simulamos el streaming de datos
    const readStream = fs.createReadStream('video.mp4', { highWaterMark: 64 * 1024 });

    readStream.on('data', (chunk) => {
        socket.emit('videoStream', chunk);
    });

    readStream.on('end', () => {
        socket.emit('videoStream', null); // Indicar el final del stream
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

server.listen(3000, () => {
    console.log('Servidor escuchando en el puerto 3000');
});