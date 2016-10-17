class SystemMessage{
    constructor(text){
        this.username = '<span class="system">System 🤖</span><br><i class="hidden">Visible only to you</i>';
        this.user     = 'SYSTEM 🤖';
        this.color    = '#FF3D00';
        this.ts       = Date.now();
        this.text     = text;
    }

    toJSON(){
        var data = {
            username: this.username,
            user    : this.user,
            color   : this.color,
            ts      : this.ts,
            text    : this.text
        };

        return data;
    }
}

module.exports = SystemMessage;