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

app.get('/chat', (req, res)=>{
    res.sendFile(`${__dirname}/assets/html/index.html`);
});

/* Set Redirect Paths From Old Website */



/* End Redirect Paths */


io.on('connection', (socket)=>{
    chat.newUser(socket);
});

var port = 80;
http.listen(port, ()=>{
    log.info(`Listening on port ${log.chalk.cyan(port)}!`, "HTTP")
});