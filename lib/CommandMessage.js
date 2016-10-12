var ChatMessage = require('./ChatMessage');

class CommandMessage extends ChatMessage{
    constructor(data){
        super(data);
        this._args     = this._text.split(' ');
        this._name     = this._args.splice(0, 1)[0].replace('/', '');

    }

    getName(){
        return this._name;
    }

    getArgs(){
        return this._args;
    }

    getArg(index){
        return this._args[index];
    }
    sendAutoReply(socket, text){
        var data = {
            username: '<span class="system">System</span><br><i>Visible only to you</i>',
            user: 'SYSTEM',
            color: '#2196F3',
            text: text
        }

        socket.emit('chat', data);
    }
}

module.exports = CommandMessage;