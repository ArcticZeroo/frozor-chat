var user;

function goToBottom(){
    $(window).scrollTop($(document).height());
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
    $('.chat-message').click(function(message){
        var ts = new Date(parseInt($(message).data('ts')));
        console.log(ts.toLocaleDateString());
        console.log(ts.toLocaleTimeString());
    })
}

$(document).ready(function () {
    var socket = io();

    socket.on('user', function(id){
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

    socket.on('history', function(history){
        history.forEach(function(message){
            handleMessage(message);
            goToBottom();
        });
    });

    socket.on('chat', function(message){
        handleMessage(message);
    });

    socket.on('users', function(count){
        console.log(`There are ${count} users online.`);
    });


    $('form').submit(function(event){
        event.preventDefault();

        var message = $('#chat').val();
        if(message.trim() == '') return;

        var data = {
            user: user,
            text: message,
            ts: Date.now()
        }

        socket.emit('chat', data);
        $('#chat').val(' ');
        goToBottom();
    });
})