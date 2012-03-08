var app = require('express').createServer(), io = require('socket.io').listen(app);

app.listen(8000);

// load client page content
app.get('/', function (req, res){
    res.sendfile(__dirname+ '/index.html');
});

// connected clients mapped to nicknames
var clients = {};

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
        // delete old nickname from client list if it exists
        clients[data] = 1;
        socket.emit('serverMessage', 'nickname set to ' + data);

        if (socket.nickname === undefined){
            socket.nickname = data;
            socket.broadcast.emit('companyChange',{"list":clients, "message":socket.nickname+" arrives!"});
        }
        else{
            delete clients[socket.nickname];
            socket.broadcast.emit('companyChange',{"list":clients, "message":socket.nickname+" is henceforth "+data});
            socket.nickname = data;
        }
    });

    socket.on('disconnect', function() {
        // remove client from the list
        if (socket.nickname === undefined)
            return;
        socket.broadcast.emit('companyChange',{"list":clients, "message":socket.nickname+" departs!"});
    });
});

