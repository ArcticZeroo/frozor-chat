var user;

function connected(){
    $('.disconnected').hide();
}

function disconnected(){
    $('.disconnected').html('Having trouble connecting to the server... <a href="/">Reload?</a>');
    $('.disconnected').show();
}

function goToBottom(){
    $('html, body').animate({scrollTop: $('#message-box').height()}, 5);
}

function handleMessage(message){
    if(message.user == user){
        $('#messages').append(`<li class="message">
            <div class="chat-message">
                <div class="not-me inactive"></div>
            </div>
            <div class="chat-message">
                <div class="me" style="background-color: ${message.color};" data-ts="${message.ts}">${message.text}</div>
            </div>
        </li>`);
    }else{
        $('#messages').append(`<li class="message">
            <div class="chat-message">
                <div class="not-me" style="background-color: ${message.color};" data-ts="${message.ts}">${message.text}</div>
            </div>
            <div class="chat-message">
                <div class="me inactive"></div>
            </div>
        </li>`)
    }
}

function showMenu(){
    $('#menu').show();
}

$(document).ready(function () {
    var socket = io();

    socket.on('user', function(id){
        connected();
        var userCookie = Cookies.get('user');
        if(userCookie){
            user = userCookie;
            socket.emit('cookie', userCookie);
            return;
        }

        console.log(`My user ID is ${id}`);
        user = id;
        Cookies.set('user', id);
    });

    var givenHistory = false;
    socket.on('history', function(history){
        if(givenHistory) return;
        givenHistory = true;
        history.forEach(function(message){
            handleMessage(message);
            goToBottom();
        });
    });

    socket.on('chat', function(message){
        handleMessage(message);
        goToBottom();
    });

    socket.on('users', function(count){
        console.log(`There are ${count} users online.`);
        $('.users').html(`${count} Online`);
    });

    socket.on('disconnect', disconnected);

    $('form').submit(function(event) {
        event.preventDefault();
    });

    $('.chat-form').submit(function(){
        var message = $('#chat').val();
        if(message.trim() == '') return;

        var data = {
            user: user,
            text: message,
            ts: Date.now()
        };

        socket.emit('chat', data);
        $('#chat').val(' ');
        goToBottom();
    });
})