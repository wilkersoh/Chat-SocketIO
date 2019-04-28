##### App function
1. Chat || notif
2. Share Location
3. Filter bad words
4. time
5. show user in room
6. auto && unauto scroll page

插件
* socket.io  | Chat server
* Mustache | Template
* moment | Time

<p>Client side的io libraby,才能使用接口io</p>

``` html
   <script src="/socket.io/socket.io.js"></script>
```

#### socket.emit || io.emit || socket.broadcast.emit || io.to.emit
* socket.emit  - send an events to specific client
* io.emit - send to every connected client
* socket.broadcast.emit - send to everyone except himself
* io.to.emit  - send to everyone in a specific room

#### emit | on
* emit(event, value, cb)
* on(event, (value, cbFromEmitValue) )

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

-------------

### logic scroll page

``` javascript
const autoscroll = () => {
    // new msg element
    const $newMessage = $messages.lastElementChild;

    // get the new message css value
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    // Height of the new message
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // visible height
    const visibleHeight = $messages.offsetHeight;

    // height of message container
    const containerHeight = $messages.scrollHeight;
    // how far can i scroll > 最上面是0 越下面 数字越大
    const scrollOffset = $messages.scrollTop + visibleHeight;
    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}
```