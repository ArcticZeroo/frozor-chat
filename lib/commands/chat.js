var log = require('frozor-logger');
var CommandUtil = require('frozor-commands').CommandUtil;
var ChatMessage = require('../ChatMessage');
var pkg         = require('../../package.json');

var commands = {
    info:{
        name: 'info',
        args: {
            min: 0,
            max: 0
        },
        process: (socket, commandMessage)=>{
            var information = `Frozor Chat Version ${pkg.version}<br>Developed by Spencer using Socket.IO + Node. <a href="http://github.com/ArcticZeroo/" target="_blank">Github</a>.<br>Use /help for commands.`;
            commandMessage.sendAutoReply(socket, information);
        }
    },
    nickname:{
        name: 'nickname',
        args: {
            min: 1,
            max: 1
        },
        disabled: true,
        process: (socket, commandMessage)=>{
            var name = commandMessage.getArg(0);
            if(name.length > 16){
                return commandMessage.sendAutoReply(socket, 'Too many characters.<br>Maximum 16.');
            }else if(name.length < 3){
                return commandMessage.sendAutoReply(socket, 'Not enough characters.<br>Minimum 3.');
            }

            if(/[\w]{3,16}/.test(name)){
                socket.emit('username', name);
                commandMessage.sendAutoReply(socket, `Your username has been changed to <span style="font-family: monospace">${name}</span>`)
            }else{
                commandMessage.sendAutoReply(socket, 'Invalid characters in name.');
            }
        }
    },
    help:{
        name: 'help',
        args: {
            min: 0,
            max: 0
        },
        process: (socket, commandMessage)=>{
            var message = `Available commands:`;
            for(var name in commands){
                var command = commands[name];
                if(command.disabled || command.alias) continue;
                message += `<br>/${name}`
            }
            commandMessage.sendAutoReply(socket, message);
        }
    },
    shrug:{
        name: 'shrug',
        args: {
            min: 0,
            max: 1000
        },
        process: (socket, commandMessage, io)=>{
            var shrug   = `¯\\_(ツ)_/¯`;
            var message = `${commandMessage.getArgs().join(' ')} ${shrug}`;
            var chatMessage = new ChatMessage(commandMessage.getOriginalData()).setText(message);
            io.emit('chat', chatMessage.toJSON());
        }
    },
    raise:{
        name: 'raise',
        args: {
            min: 0,
            max: 1000
        },
        process: (socket, commandMessage, io)=>{
            var shrug   = `ヽ༼ຈل͜ຈ༽ﾉ`;
            var message = `${commandMessage.getArgs().join(' ')} ${shrug}`;
            var chatMessage = new ChatMessage(commandMessage.getOriginalData()).setText(message);
            io.emit('chat', chatMessage.toJSON());
        }
    },
    lenny:{
        name: 'lenny',
        args: {
            min: 0,
            max: 1000
        },
        process: (socket, commandMessage, io)=>{
            var shrug   = `( ͡° ͜ʖ ͡°)`;
            var message = `${commandMessage.getArgs().join(' ')} ${shrug}`;
            var chatMessage = new ChatMessage(commandMessage.getOriginalData()).setText(message);
            io.emit('chat', chatMessage.toJSON());
        }
    }
};

module.exports = new CommandUtil(commands);