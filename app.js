var log          = require('frozor-logger');
var express      = require('express');
var app          = express();
var http         = require('http').Server(app);
var io           = require('socket.io')(http);
var chat         = require('./chat')(io);
var config       = require('./config');

log.info('Starting app...', "HTTP");

app.use(express.static('assets'));

function sendChatPage(req, res) {
    res.sendFile(`${__dirname}/assets/html/index-min.html`);
}

app.get('/', sendChatPage);

app.get('/chat', sendChatPage);

/* Create Redirect Paths From Old Website */
function setRedirect(path, url){
    app.get(`/${path}`, (req, res)=>{
        res.redirect(url);
    });
}

for(var path in config.redirects){
    var redirect = config.redirects[path];
    setRedirect(path, redirect);
}
/* End Redirect Paths */


io.on('connection', (socket)=>{
    chat.newUser(socket);
});

var port = config.server.port;
http.listen(port, ()=>{
    log.info(`Listening on port ${log.chalk.cyan(port)}!`, "HTTP")
});