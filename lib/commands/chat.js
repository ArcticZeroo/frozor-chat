var CommandUtil = require('frozor-commands').CommandUtil;

var commands = {
    test:{
        name: 'test',
        args: {
            min: 0,
            max: 0
        },
        process: (socket, commandMessage)=>{
            commandMessage.sendAutoReply(socket, 'Ayy lmao');
        }
    },
    nickname:{
        name: 'nickname',
        args: {
            min: 1,
            max: 1
        },
        process: (socket, commandMessage)=>{
            commandMessage.sendAutoReply(socket, `${commandMessage.getArg(0)}`);
        }
    }
};

module.exports = new CommandUtil(commands);