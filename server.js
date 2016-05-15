//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');

//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

router.use(express.static(path.resolve(__dirname, 'client')));

// Sockets.
var sockets 	= [];

// ADMIN: Protected arrays to store admins + messages.
var admins		= [];

var clients		= [];
var messages 	= [];

io.on('connection', function (socket) {		
    sockets.push(socket);
		
		// ADMIN: login the user
		
    socket.on('identify', function (name) {
      socket.set('name', String(name || 'Anon'), function (err) {
        updateRoster();
      });
    });
		
    socket.on('login', function (userpass) {
      var userpass = String(userpass || '');
			
			if (userpass == 'xxx') {
				// update the socket to be an admin
				socket.set('useradmin', true);
		    socket.emit('messages', messages);
			}
    });
		
    socket.on('message', function (message) {
      console.log('message.user:', message.user);
      console.log('message.text:', message.text);
      
			var text = String(message.text || '');
			
      if (!text)
        return;
			
      messages.push(message);
    });
				
    socket.on('disconnect', function () {
      sockets.splice(sockets.indexOf(socket), 1);
      updateRoster();
    });
		
});

function updateRoster() {
  async.map(
    admins,
    function (socket, callback) {
      socket.get('name', callback);
    },
    function (err, names) {
      broadcast('roster', names);
    }
  );
}

function broadcast(event, data) {
  sockets.forEach(function (socket) {
    socket.emit(event, data);
  });
}


// Server

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});


