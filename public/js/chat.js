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

// render message to html
socket.on('message', (message) => {
    // mustache 是html里的 script 插件 render html
    const html = Mustache.render(messageTemplate, {
        message
    });
    $messages.insertAdjacentHTML('beforeend', html);
})

// render link
socket.on('locationMessage', (url) => {
    console.log(url)
    const html = Mustache.render(locationMessageTemplate, {
        url
    })
    $messages.insertAdjacentHTML('beforeend', html);
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

