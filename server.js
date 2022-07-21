//express und http module, veröffentlichen index.html aus public
var express = require('express');
var app = express();
var server = require('http').createServer(app);

//socket.io hier
var io = require('socket.io')(server);


//server starten
var port = process.env.PORT || 3000;
server.listen(port, function () {

  //console nachricht für server
  console.log('Webserver läuft und hört auf Port %d', port);
});


//express soll index.html hier finden
app.use(express.static(__dirname + '/public'));


//info, wenn sich etwas bei den verbindungen zu browsern tut und aktuelle socket verbindung zu client
io.on('connection', function (socket) {


  //prüf ob user angemeldet
  var addedUser = false;

  //neue user
  socket.on('add user', function (username) {
    //speichern vom username und hat sich schon angemeldet wird true
    socket.username = username;
    addedUser = true;

    //login nachricht muss geschickt werden
    socket.emit('login');

    //nachricht über neu angemeldete user
    socket.broadcast.emit('user joined', socket.username);
  });

  //reagiere auf neue nachrichten
  socket.on('new message', function (data) {
    //neue nachtichten an allen shcicken
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  //reaktion auf verlassende user
  socket.on('disconnect', function () {
    if (addedUser) {
      //und nachricht darüber an den anderen schicken
      socket.broadcast.emit('user left', socket.username);
    }
  });
});