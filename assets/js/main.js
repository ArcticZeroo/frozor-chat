var user;
var settings;

function connected(){
    $('.disconnected').hide();
}

function disconnected(){
    $('.disconnected').html('Having trouble connecting to the server... <a href="/">Reload?</a>').show();
}

function goToBottom(){
    $('html, body').animate({scrollTop: $('#message-box').height()}, 5);
}

function getUsernameString(message){
    return (message.username) ? message.username : '';
}

function handleMessage(message){
    if(message.user == user){
        $('#messages').append(`<li class="message">
            <div class="chat-message" class="other">
                <div class="not-me inactive"></div>
                <div class="name inactive"></div>
            </div>
            <div class="chat-message">
                <div class="content">
                    <div class="me" style="background-color: ${message.color};" data-ts="${message.ts}">${message.text}</div>
                </div>
                <div class="name">${getUsernameString(message)}</div>
            </div>
        </li>`);
    }else{
        $('#messages').append(`<li class="message">
            <div class="chat-message" class="other">
                <div class="content">
                    <div class="not-me" style="background-color: ${message.color};" data-ts="${message.ts}">${message.text}</div>
                </div>
                <div class="name">${getUsernameString(message)}</div>
            </div>
            <div class="chat-message">
                <div class="me inactive"></div>
                <div class="name inactive"></div>
            </div>
        </li>`)
    }
}

var menu_opened = false;
function openMenu(){
    $('#menu').fadeIn('fast');
    //$('.cover').fadeIn('fast');
    $('.error').html('');

    menu_opened = true;
}
function closeMenu(){
    $('#menu').fadeOut('fast');
    //$('.cover').fadeOut('fast');
    menu_opened = false;
}

function toggleMenu(){
    if(menu_opened) closeMenu();
    else            openMenu();
}

$(document).ready(function () {
    closeMenu();

    var socket = io();

    socket.on('user', function(id){
        connected();
        var userCookie = Cookies.get('user');
        if(userCookie){
            console.log('Emitting cookie');
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

    $('#cancel').click(function () {
        closeMenu();
    });

    $('#settings').click(function(){
        toggleMenu();
    });

    $('form').submit(function(event) {
        event.preventDefault();
    });

    $('.settings').submit(function () {
        var nickname = $('#nickname');
        var color    = $('#color');

        if(nickname.val().trim() != ''){
            if(nickname.val().length > 16){
                $('.error.name').html('Too long. Maximum 16 characters.');
                return;
            }
            socket.emit('username', nickname.val());
            nickname.val('');
        }

        if(color.val().trim() != ''){
            var inputColor = color.val();
            inputColor = inputColor.replace('#', '');
            var isValid = /^[#]?[0-9A-f]{6}$/.test(inputColor);
            if(!isValid){
                $('.error.hex').html('Invalid color.');
                return;
            }else{
                socket.emit('color', inputColor);
                color.val('');
            }
        }

        closeMenu();
    });

    $('.chat-form').submit(function(){
        var chat    = $('#chat');
        var message = chat.val();
        if(message.trim() == '') return;

        var data = {
            user: user,
            text: message,
            ts: Date.now()
        };

        socket.emit('chat', data);
        chat.val(' ');
        goToBottom();
    });
})