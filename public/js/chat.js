const socket = io();
 
// Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

//  Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// qs = query string > "?username=yee&room=gs" 
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

// after added new message scroll it
const autoscroll = () => {
    // new msg element
    const $newMessage = $messages.lastElementChild;

    // get the new message css value
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    // Height of the new message
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
    const visibleHeight = $messages.offsetHeight;
    const containerHeight = $messages.scrollHeight;
    // 最上面是0 越下面 数字越大
    const scrollOffset = $messages.scrollTop + visibleHeight;
    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

// render message to html
socket.on('message', (message) => {
    // mustache 是html里的 script 插件 render html(render的地点，内容)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('hh:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
})

// render link
socket.on('locationMessage', (message) => {
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('hh:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.getElementById('sidebar').innerHTML = html;
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // disable 不让他再发信息 直到下面信息被发送去server后
    $messageFormButton.setAttribute('disabled', 'disabled');
    
    const message = e.target.elements.message.value
    socket.emit('sendMessage', message, (error) => {
        // enable
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();
        if(error){
            return console.log(error)
        } 

        console.log('message delivered')
    })
})

// send location
$sendLocationButton.addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert('Your browser is not support this function');
    }

    $sendLocationButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            lng: position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled');
            console.log("location share");
        })
    });
})

socket.emit('join', { username, room }, (error) => {
    if(error){
        alert(error);
        location.href = '/'
    }
})