var log            = require('frozor-logger');
var RunCommand     = require('frozor-commands').RunCommand;
var CommandMessage = require('./lib/CommandMessage');
var Error          = require('frozor-error');
var chatCommands   = require('./lib/commands/chat');
var strings        = require('./config/strings.json');
var SystemMessage  = require('./lib/SystemMessage');

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

    getID(id){
        this.checkUser(id);
        return this.getUser(id).id;
    }

    getMessageColor(id){
        if(!this.getUser(id)) this.createUser(id);
        return this.getUser(id).color;
    }

    getConsolePrefix(data){
        var username = data.username;
        if(!username) username = 'Anonymous';
        return `${username}${data.color}`;
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
                            commandMessage.reply(socket, 'Unknown command. Type /help for a list of commands.');
                            break;
                        case Error.COMMAND_TOO_MANY_ARGS:
                            commandMessage.reply(socket, `Too many arguments! That command has a maximum of ${command.getMax()}`);
                            break;
                        case Error.COMMAND_NOT_ENOUGH_ARGS:
                            commandMessage.reply(socket, `Not enough arguments! That command has a minimum of ${command.getMin()}`);
                            break;
                        case Error.COMMAND_DISABLED:
                            commandMessage.reply(socket, `That command is currently disabled.`);
                            break;
                        default:
                            commandMessage.reply(socket, `An unknown error has occurred. Please try again later.`);
                    }
                    return;
                }

                var process = command.getProcess();

                try{
                    log.command(`${commandMessage.getUsernameString()}@${commandMessage.getUser()}`, commandMessage.getText(), 'Chat', true);
                    process(socket, commandMessage, this.io);
                }catch(e){
                    commandMessage.reply(socket, `Unable to process command, please try again later.`);
                    log.error(`An error occurred while attempting to execute the command ${log.chalk.red(commandMessage.getName())}: ${e}`);
                }
            });
            return;
        }

        if(this.getHistory().length == 100) this._history.splice(0, 1);
        this._history.push(data);

        this.io.emit('chat', data);
        log.log(log.getLogMessage(log.chalk.cyan, 'CHAT', data.text, this.getConsolePrefix(data)), false);
    }

    getHistory(){
        return this._history;
    }

    getRandomColor(){
        var colors = ["F44336", "E53935", "D32F2F", "C62828", "B71C1C", "E91E63", "D81B60", "C2185B", "AD1457", "880E4F", "6A1B9A", "4A148C", "673AB7", "5E35B1", "512DA8", "4527A0", "311B92", "3F51B5", "3949AB", "303F9F", "283593", "1A237E", "2196F3", "1E88E5", "1976D2", "1565C0", "0D47A1", "43A047", "388E3C", "2E7D32", "1B5E20", "FF5722", "F4511E", "E64A19", "D84315", "BF360C", "EF6C00", "E65100", "FF5722", "BF360C", "795548", "3E2723", "212121", "757575", "607D8B", "263238", "33691E", "689F38", "827717", "004D40"];
        var randomColor = colors[Math.floor(Math.random()*colors.length)];
        return `#${randomColor}`;
    }

    checkUser(id){
        if(!this.getUser(id)) this.createUser(id);
    }

    getUsername(id){
        this.checkUser(id);

        return this.getUser(id).username;
    }

    setUsername(id, name){
        this.checkUser(id);

        this._users[id].username = name;
    }

    usernameExists(name){
        for(var id in this._users){
            if(name && name == this.getUsername(id)) return id;
        }
        return false;
    }

    getTimeConnected(id){
        this.checkUser(id);

        return this.getUser(id).connected;
    }

    getLastOnline(id){
        this.checkUser(id);

        return this.getUser(id).last_on;
    }

    isOnline(id){
        this.checkUser(id);

        return this.getUser(id).online;
    }

    setColor(id, color){
        this.checkUser(id);

        //log.debug(`Setting color to ${color}`);
        //log.debug(`Current color: ${this.getMessageColor(id)}`);
        this._users[id].color = color;
        //log.debug(`Set color! New color: ${this.getMessageColor(id)}`);
    }

    setOnlineStatus(id, status){
        this.checkUser(id);

        this._users[id].online = status;
    }

    setLastOnline(id, time){
        this.checkUser(id);

        this._users[id].last_on = time;
    }

    setID(current_id, new_id){
        this.checkUser(current_id);

        this._users[current_id].id = new_id;
    }

    getNotices(id){
        this.checkUser(id);

        return this.getUser(id).notices;
    }

    addNotice(id, notice){
        this.checkUser(id);

        this._users[id].notices.push(notice);
    }

    checkNotices(socket){
        var notices      = this.getNotices(socket.id);
        var noticeString = (notices.length == 1) ? `notice` : `notices`;
        var notices_to_send = ``;

        for(var item of notices){
            notices_to_send += `\n${item}`;
        }

        if(notices.length > 0){
            socket.emit('info', `${strings.notices.start}<b> ${notices.length} </b>${noticeString} ${strings.notices.end}:${notices_to_send}`);
        }
    }

    createUser(id){
        this._users[id] = {
            id       : id,
            username : null,
            color    : this.getRandomColor(),
            connected: Date.now(),
            online   : true,
            last_on  : Date.now(),
            notices  : []
        };
    }

    newUser(socket){
        this.createUser(socket.id);

        this._connected++;
        this.io.emit('users', this._connected);

        var ip = socket.request.connection.remoteAddress;

        log.info(`A user connected to the socket with IP ${log.chalk.red(ip)}! There are now ${log.chalk.cyan(this._connected)} users connected.`, "SOCKET");

        socket.emit('user', socket.id);

        socket.emit('history', this.getHistory());

        socket.emit('info', strings.start);

        this.checkNotices(socket);

        socket.on('cookie', (old_id)=>{
            socket.id = old_id;
            this.checkNotices(socket);
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

            this.newMessage(socket, message);
        });

        socket.on('disconnect', ()=>{
            this._connected--;
            this.io.emit('users', this._connected);

            this.setOnlineStatus(socket.id, false);
            this.setLastOnline(socket.id, Date.now());
        });

        socket.on('color', (color)=>{
            var isValid = /^[#]?[0-9A-f]{6}$/.test(color);
            if(!isValid) return;

            color = `#${color.replace('#', '')}`;

            var username = this.getUsername(socket.id) || 'Someone';
            if(this.getMessageColor(socket.id) == color) return;

            this.setColor(socket.id, color);

            this.io.emit('info', `${username} changed their color to <div class="color" style="background-color: ${color}"></div>`);
        });

        socket.on('username', (name)=>{
            if(name.length > 16 || !/^[\w]{3,16}([ ]?🐧)?$/.test(name)) return;

            var username = this.getUsername(socket.id) || 'Someone';
            if(name == username) return;

            var exists = this.usernameExists(name);
            if(exists){
                log.debug('Exists!');
                if(exists != socket.id){
                    if(!this.isOnline(exists)){
                        var last_online = this.getLastOnline(exists);
                        if(Date.now() - last_online < 60*60*1000){
                            socket.emit('chat', new SystemMessage(`${strings.name_in_use.offline}${strings.name_in_use.tryagain}`).toJSON());
                            return;
                        }else{
                            this.setUsername(exists, null);
                            this.addNotice(exists, `Your username was reset because someone tried claimed it after you were offline for over an hour.`);
                        }
                    }else{
                        //log.debug(JSON.stringify(new SystemMessage(`${strings.name_in_use.online}${strings.name_in_use.tryagain}`).toJSON()));
                        socket.emit('chat', new SystemMessage(`${strings.name_in_use.online}${strings.name_in_use.tryagain}`).toJSON());
                        return;
                    }
                }
            }

            var color    = this.getMessageColor(socket.id);
            this.io.emit('info', `${username} changed their name to <div class="new-name chat-message" style="background-color: ${color}">${name}</div>`);

            this.setUsername(socket.id, name);
        });
    }
}

module.exports = function (io) {
    return new ChatHandler(io);
};