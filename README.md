##### App function
1. Chat || notif
2. Share Location
3. Filter bad words

插件
* socket.io  | Chat server
* Mustache | render message

<p>Client side的io libraby,才能使用接口io</p>

``` html
   <script src="/socket.io/socket.io.js"></script>
```

#### emit | on
* emit(event, value, cb)
* on(event, cbFromEmitValue)

``` javascript
    // server(emit) -> client(receive)
    // client(emit) -> server(receive) 
```

``` javascript
io.on('connection', (socket) => {
    // 当user连接 发送信息
    socket.emit('message', 'Welcome!');
    // 当 另外一个 user连接，发送信息提醒在线的user
    socket.broadcast.emit('message', 'A New User Join')
    // 收信息 从user
    socket.on('sendMessage', message => {
        // 发收到的信息 给 user
        io.emit('message', message)
    });
    // user离开 提醒 大家
    socket.on('disconnect', () => {
        io.emit('message', 'User has left')
    })
})
```

--------------
