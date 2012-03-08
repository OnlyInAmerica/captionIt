var app = require('express').createServer(), io = require('socket.io').listen(app);

app.listen(8000);

// load client page content
app.get('/', function (req, res){
    res.sendfile(__dirname+ '/rps.html');
});

// connected clients mapped to nicknames
var clients = [];
var nickNames = new Object();

// socket.io
io.sockets.on('connection', function(socket){
    //clients.push(socket);
    //nickNames.socket = "dude" + clients.length;
    //socket.broadcast.emit('companyChange',{"nick":nickNames.socket, "action":"in"});

    socket.on('message', function(data) {
        // broadcast the message to all clients
        socket.broadcast.emit('message',{"nick":socket.nickname, "data":data});
    });

    socket.on('setNick', function(data) {
        // broadcast the message to all clients
        socket.nickname = data;
        socket.emit('serverMessage', 'nickname set to ' + data);
    });

    socket.on('disconnect', function() {
        // remove client from the list
        socket.broadcast.emit('companyChange',{"nick":socket.nickname, "action":"out"});
    });
});

