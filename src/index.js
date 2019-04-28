const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage }  = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express();
// 为了连接socketio
const server = http.createServer(app);
const io = socketio(server)

app.use(express.static(path.join(__dirname, '../public')));

let count = 0;

io.on('connection', (socket) => {

    socket.on('join', (options, cb) => {
        const { error, user } = addUser({ id: socket.id, ...options })
        if(error){
          return cb(error)
        }

        socket.join(user.room)

        // 当user连接 发送信息
        socket.emit('message', generateMessage('Admin','Welcome~~~'));
        // 当 另外一个 user连接，发送信息提醒在room在线的user
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has joined`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        cb()
    })

    // server 收信息 从user to server
    socket.on('sendMessage', (message, cb) => {
        const user = getUser(socket.id);
        const filter = new Filter();

        if(filter.isProfane(message)){
            return cb('Profanity is not allowed')
        }

        // server share收到的信息 给 Alluser
        io.to(user.room).emit('message', generateMessage(user.username, message));
        cb()
    });

    socket.on('sendLocation', (coords, cb )=> {
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.lng}`))
        cb();
    })

    // user离开 提醒 大家
    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if(user){
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left.`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

const port = process.env.PORT || 3000;
server.listen(port, console.log(`listenning ${port}`));