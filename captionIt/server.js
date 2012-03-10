var fs = require('fs');
var privateKey = fs.readFileSync('./privatekey.pem').toString();
var certificate = fs.readFileSync('./certificate.pem').toString();

var express = require('express');
var sio = require('socket.io');

var app = express.createServer({key:privateKey, cert:certificate});


app.use("/esapi4js",express.static(__dirname + '/esapi4js'));

// load client page content
app.get('/', function (req, res){
    res.sendfile(__dirname+ '/index.html');
});

app.listen(8000, function () {
  var addr = app.address();
  console.log('   app listening on https://' + addr.address + ':' + addr.port);
});

var io = sio.listen(app,{key:privateKey,cert:certificate});

// connected clients mapped to nicknames
var clients = {};

// socket.io
io.sockets.on('connection', function(socket){
    socket.emit('companyChange', {"list":clients, "message":"welcome"});

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
            socket.broadcast.emit('companyChange',{"list":clients, "message":socket.nickname+" is hereafter "+data});
            socket.nickname = data;
        }
    });

    socket.on('disconnect', function() {
        // remove client from the list
        if (socket.nickname === undefined)
            return;
        var nick = socket.nickname;
        delete clients[nick];
        socket.broadcast.emit('companyChange',{"list":clients, "message":socket.nickname+" departs!"});
    });
});

