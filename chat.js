var log            = require('frozor-logger');
var RunCommand     = require('frozor-commands').RunCommand;
var CommandMessage = require('./lib/CommandMessage');
var Error          = require('frozor-error');
var chatCommands   = require('./lib/commands/chat');

class ChatHandler{
    constructor(io){
        this.io = io;
        this._history   = [];
        this._connected = 0;
        this._users     = {};
    }

    getUser(id){
        return this._users[id];
    }

    getMessageColor(id){
        if(!this.getUser(id)) this.createUser(id);
        return this.getUser(id).color;
    }

    newMessage(socket, data){
        data.color = this.getMessageColor(socket.id);

        if(this.getUsername(socket.id)) data.username = this.getUsername(socket.id);

        if(data.text.startsWith('/') && data.text.length > 1){
            var commandMessage = new CommandMessage(data);
            RunCommand.check(commandMessage, chatCommands, (command, err)=>{
                if(err){
                    log.command(`${commandMessage.getUsernameString()}@${commandMessage.getUser()}`, commandMessage.getText(), 'Chat', false);
                    switch(err){
                        case Error.COMMAND_UNDEFINED:
                            commandMessage.sendAutoReply(socket, 'Unknown command. Type /help for a list of commands.');
                            break;
                        case Error.COMMAND_TOO_MANY_ARGS:
                            commandMessage.sendAutoReply(socket, `Too many arguments! That command has a maximum of ${command.getMax()}`);
                            break;
                        case Error.COMMAND_NOT_ENOUGH_ARGS:
                            commandMessage.sendAutoReply(socket, `Not enough arguments! That command has a minimum of ${command.getMin()}`);
                            break;
                        case Error.COMMAND_DISABLED:
                            commandMessage.sendAutoReply(socket, `That command is currently disabled.`);
                            break;
                        default:
                            commandMessage.sendAutoReply(socket, `An unknown error has occurred. Please try again later.`);
                    }
                    return;
                }

                var process = command.getProcess();

                try{
                    log.command(`${commandMessage.getUsernameString()}@${commandMessage.getUser()}`, commandMessage.getText(), 'Chat', true);
                    process(socket, commandMessage, this.io);
                }catch(e){
                    commandMessage.sendAutoReply(socket, `Unable to process command, please try again later.`);
                    log.error(`An error occurred while attempting to execute the command ${log.chalk.red(commandMessage.getName())}: ${e}`);
                }
            })
            return;
        }

        this.io.emit('chat', data);

        if(this.getHistory().length == 100) this._history.splice(0, 1);
        this._history.push(data);
    }

    getHistory(){
        return this._history;
    }

    getRandomColor(){
        var colors = ["F44336", "E53935", "D32F2F", "C62828", "B71C1C", "E91E63", "D81B60", "C2185B", "AD1457", "880E4F", "6A1B9A", "4A148C", "673AB7", "5E35B1", "512DA8", "4527A0", "311B92", "3F51B5", "3949AB", "303F9F", "283593", "1A237E", "2196F3", "1E88E5", "1976D2", "1565C0", "0D47A1", "43A047", "388E3C", "2E7D32", "1B5E20", "FF5722", "F4511E", "E64A19", "D84315", "BF360C", "EF6C00", "E65100", "FF5722", "BF360C", "795548", "3E2723", "212121", "757575", "607D8B", "263238", "33691E", "689F38", "827717", "004D40"];
        var randomColor = colors[Math.floor(Math.random()*colors.length)];
        return `#${randomColor}`;
    }

    getUsername(id){
        if(!this.getUser(id)) this.createUser(id);

        return this.getUser(id).username;
    }

    setUsername(id, name){
        if(!this.getUser(id)) this.createUser(id);

        this._users[id].username = name;
    }

    setColor(id, color){
        if(!this.getUser(id)) this.createUser(id);

        this._users[id].color = color;
    }

    createUser(id){
        this._users[id] = {
            id       : id,
            username : null,
            color    : this.getRandomColor(),
            connected: Date.now()
        };
    }

    newUser(socket){
        this.createUser(socket.id);

        this._connected++;
        this.io.emit('users', this._connected);

        log.info(`A user connected to the socket! There are now ${log.chalk.cyan(this._connected)} users connected.`, "SOCKET");

        socket.emit('user', socket.id);

        socket.emit('history', this.getHistory());

        socket.on('cookie', (old_id)=>{
            log.debug('Someone with an old cookie conneted! Remaking their user...');
            this.createUser(socket.id);
            this._users[socket.id].id = old_id;
            this.setUsername(socket.id, this.getUsername(old_id));
            this.setColor(socket.id, this.getMessageColor(old_id));
        });

        socket.on('chat', (message)=>{
            message.text = message.text.trim();
            if(message.text.length > 1000){
                message.text      = message.text.substring(0, 1000);
                message.truncated = true;
            }

            message.text = message.text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

            var links = message.text.match(/(http|https|ftp|ftps)\:\/\/([a-zA-Z0-9\-\.]+)\.([a-zA-Z]{2,3}(\/\S*)?)/);
            if(links){
                message.text = message.text.replace(links[0], `<a href="${links[0]}" target="_blank">${links[0]}</a>`);
            }

            log.info(message.text, `MESSAGE`);
            this.newMessage(socket, message);
        });

        socket.on('disconnect', ()=>{
            this._connected--;
            this.io.emit('users', this._connected);
        });

        socket.on('color', (color)=>{
            log.debug(`Received a new color event, ${color}`);

            var isValid = /^[#]?[0-9A-f]{6}$/.test(color);
            if(!isValid) return;

            color = `#${color.replace('#', '')}`;

            this.setColor(socket.id, color);
        });

        socket.on('username', (name)=>{
            if(name.length > 16) return;

            this.setUsername(socket.id, name);
        });
    }
}

module.exports = function (io) {
    return new ChatHandler(io);
};