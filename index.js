const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static('public'));

// Ruta para la página principal que genera un UUID para la sala
app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`);
});

// Ruta para manejar cualquier solicitud de sala
app.get('/:room', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
    socket.on('join-room', (roomId) => {
        const userId = socket.id;
        console.log(userId)
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);

        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', userId);
        });

        socket.on('signal', (data) => {
            socket.to(data.to).emit('signal', data);
        });
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});