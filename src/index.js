const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');

const app = express();
// 为了连接socketio
const server = http.createServer(app);
const io = socketio(server)

app.use(express.static(path.join(__dirname, '../public')));

let count = 0;

io.on('connection', (socket) => {
    // 当user连接 发送信息
    socket.emit('message', 'Welcome!');
    // 当 另外一个 user连接，发送信息提醒在线的user
    socket.broadcast.emit('message', 'A New User Join')
    // server 收信息 从user to server
    socket.on('sendMessage', (message, cb) => {
        const filter = new Filter();

        if(filter.isProfane(message)){
            return cb('Profanity is not allowed')
        }

        // server share收到的信息 给 Alluser
        io.emit('message', message);
        cb()
    });

    socket.on('sendLocation', (coords, cb) => {
        io.emit('locationMessage', `https://google.com/maps?q=${coords.latitude},${coords.lng}`)
        cb();
    })

    // user离开 提醒 大家
    socket.on('disconnect', () => {
        io.emit('message', 'User has left')
    })
})

const port = process.env.PORT || 3000;
server.listen(port, console.log(`listenning ${port}`));