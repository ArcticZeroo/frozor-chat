var ChatMessage   = require('./ChatMessage');
var SystemMessage = require('./SystemMessage');

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
        var data = new SystemMessage(text).toJSON();

        socket.emit('chat', data);
    }

    reply(socket, text){
        this.sendAutoReply(socket, text);
    }
}

module.exports = CommandMessage;