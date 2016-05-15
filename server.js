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
var messages 	= [];

io.on('connection', function (socket) {
    messages.forEach(function (data) {
      socket.emit('message', data);
    });
		
    sockets.push(socket);

    socket.on('disconnect', function () {
      sockets.splice(sockets.indexOf(socket), 1);
      updateRoster();
    });

    socket.on('message', function (msg) {
      var text = String(msg || '');

      if (!text)
        return;

      socket.get('name', function (err, name) {
        var data = {
          name: name,
          text: text
        };

        broadcast('message', data);
        messages.push(data);
      });
    });

    socket.on('identify', function (name) {
      socket.set('name', String(name || 'Anonymous'), function (err) {
        updateRoster();
      });
    });
		
		// ADMIN: login the user
    socket.on('login', function (userpass) {
      var userpass = String(userpass || '');

      if (!userpass)
        return;
			
      socket.get('userpass', function (err, userpass) {
				if (userpass == "super@secret") {
	      	socket.set('roster', login(userpass), function (err) {
						
	      	});
	      	socket.set('usermessages', login(userpass), function (err) {
	      		
					});
				}

        broadcast('message', data);
        messages.push(data);
      });

    });
		
  });

function updateRoster() {
  async.map(
    sockets,
    function (socket, callback) {
      socket.get('name', callback);
    },
    function (err, names) {
      broadcast('roster', names);
    }
  );
}

function broadcast(evemessagesta) {
  sockets.forEach(function (socket) {
    socket.emit(event, data);
  });
}

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});


// ADMIN: Insert an admin area (stub w/o auth) to see/respond to individual requests.
router.get('/login', function (request, result) {
  request.render('admin', { title: 'Hey', message: 'Hello there!'});
});


