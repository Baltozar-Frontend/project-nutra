const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const players = {};
const colors = [0xff4757, 0x2ed573, 0x1e90ff, 0xffa502, 0x9b59b6, 0x1abc9c];

io.on('connection', (socket) => {
    players[socket.id] = {
        id: socket.id,
        x: (Math.random() - 0.5) * 10,
        z: 5 + (Math.random() - 0.5) * 5,
        rotationY: 0,
        color: colors[Math.floor(Math.random() * colors.length)]
    };
    socket.emit('currentPlayers', players);
    socket.broadcast.emit('newPlayer', players[socket.id]);

    socket.on('playerMovement', (movementData) => {
        if (players[socket.id]) {
            players[socket.id].x = movementData.x;
            players[socket.id].z = movementData.z;
            players[socket.id].rotationY = movementData.rotationY;
            socket.broadcast.emit('playerMoved', players[socket.id]);
        }
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('playerDisconnected', socket.id);
    });
});

module.exports = (req, res) => {
    if (!http.listening) {
        http.listen(process.env.PORT || 3000);
    }
    res.status(200).send("Сервер Тайги Активен");
};
