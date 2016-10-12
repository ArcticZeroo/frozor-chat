class ChatMessage{
    constructor(data){
        this._user     = data.user;
        this._username = data.username;
        this._text     = data.text;
        this._time     = data.ts;
        this._color    = data.color;
    }

    getColor(){
        return this._color;
    }

    getUser(){
        return this._user;
    }

    getUsernameString(){
        return (this._username) ? this._username : '';
    }

    getUsername(){
        return this._username
    }

    getText(){
        return this._text;
    }

    getTime(){
        return new Date(this._time);
    }

    getTimestamp(){
        return this._time;
    }
}

module.exports = ChatMessage;