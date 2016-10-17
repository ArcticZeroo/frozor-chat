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

function clearMessageBox(){
    $('#messages').empty();
}

function handleMessage(message){
    if(message.user == user){
        // OWN MESSAGES
        $('#messages').append(`<li class="message">
            <div class="chat-message">
                <div class="not-me inactive"></div>
                <div class="name inactive"></div>
            </div>
            <div class="chat-message end" data-ts="${message.ts}" id="${message.ts}">
                <div class="content">
                    <div class="me message" style="background-color: ${message.color};">${message.text}</div>
                </div>
                <div class="time" id="time-${message.ts}">${new Date(message.ts).toLocaleTimeString()}</div>
                <div class="name">${getUsernameString(message)}</div>
            </div>
        </li>`);
        // OWN MESSAGES END
    }else{
        // OTHERS' MESSAGES
        $('#messages').append(`<li class="message">
            <div class="chat-message" data-ts="${message.ts}" id="${message.ts}">
                <div class="content">
                    <div class="not-me message" style="background-color: ${message.color};">${message.text}</div>
                </div>
                <div class="time" id="time-${message.ts}">${new Date(message.ts).toLocaleTimeString()}</div>
                <div class="name">${getUsernameString(message)}</div>
            </div>
            <div class="chat-message">
                <div class="me inactive"></div>
                <div class="name inactive"></div>
            </div>
        </li>`)
        // OTHERS' MESSAGES END
    }
    $(`#${message.ts}`).click(function () {
        var timestamp  = $(this).data('ts');
        var selector   = `#time-${timestamp}`;
        $(selector).fadeToggle('fast');
        //console.log('clicked!');
    });
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

function clearNickname(){
    $('#nickname').val('');
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
            //console.log('Emitting cookie');
            user = userCookie;
            socket.emit('cookie', userCookie);
            return;
        }

        //console.log(`My user ID is ${id}`);
        user = id;
        Cookies.set('user', id);
    });

    var givenHistory = false;
    socket.on('history', function(history){
        if(givenHistory) return;
        givenHistory = true;
        history.forEach(function(message){
            handleMessage(message);
        });
        goToBottom();


    });

    socket.on('chat', function(message){
        handleMessage(message);
        var body     = $('body');
        var jQwindow = $(window);
        var percentageScrolled = (body.scrollTop() / (body.height() - jQwindow.height()))*100;
        if(percentageScrolled < 85 && body.scrollTop() < 650 && $(document).height() > jQwindow.height()+100) return;
        goToBottom();
    });

    socket.on('users', function(count){
        //console.log(`There are ${count} users online.`);
        $('.users').html(`${count} Online`);
    });

    socket.on('info', (info)=>{
        $('#messages').append(`<li class="info">${info}</li>`);
    });

    socket.on('game', (game)=>{
        $('#messages').append(`<li class="game">${game}</li>`);
    });

    socket.on('clear', ()=>{
        clearMessageBox();
    });

    socket.on('disconnect', disconnected);

    $('#cancel').click(function () {
        closeMenu();
        clearNickname();
    });

    $('#settings').click(function(){
        toggleMenu();
    });

    $('form').submit(function(event) {
        event.preventDefault();
    });

    $('.settings').submit(function () {
        var nickname = $('#nickname');
        var color    = $('input[name="color"]:checked');

        if(nickname.val().trim() != ''){
            if(nickname.val().length > 16){
                $('.error.name').html('Too long. Maximum 16 characters.');
                return;
            }
            //console.log('Emitting name change!');
            socket.emit('username', nickname.val());
            clearNickname();
        }

        //console.log('Emitting color change!');
        socket.emit('color', color.val());

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
});