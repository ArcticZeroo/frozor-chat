var log = require('frozor-logger');
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

    getMessageColor(socket){
        if(!this._users[socket.id]) return "#673AB7";
        return this._users[socket.id].color;
    }

    newMessage(socket, data){
        data.color = this.getMessageColor(socket);
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

    newUser(socket){
        this._users[socket.id] = {
            id       : socket.id,
            username : "",
            color    : this.getRandomColor(),
            connected: Date.now()
        }

        this._connected++;
        this.io.emit('users', this._connected);

        log.info(`A user connected to the socket! There are now ${log.chalk.cyan(this._connected)} users connected.`, "SOCKET");

        socket.emit('user', socket.id);

        socket.emit('history', this.getHistory());

        socket.on('cookie', (old_id)=>{
            this._users[socket.id] = this.getUser(old_id);
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
    }
}

module.exports = function (io) {
    return new ChatHandler(io);
};