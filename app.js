var log          = require('frozor-logger');
var express      = require('express');
var app          = express();
var http         = require('http').Server(app);
var io           = require('socket.io')(http);
var chat         = require('./chat')(io);

log.info('Starting app...', "HTTP");

app.use(express.static('assets'));

app.get('/', (req, res)=>{
    res.sendFile(`${__dirname}/assets/html/index.html`);
});

io.on('connection', (socket)=>{
    chat.newUser(socket);
});

http.listen(3000, ()=>{
    log.info(`Listening on port ${log.chalk.cyan('3000')}!`, "HTTP")
});