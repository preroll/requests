//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//

var http = require('http');
var path = require('path');

var async 		= require('async');
var socketio 	= require('socket.io');
var express 	= require('express');

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

// Store uuid/name/text[] packets.
var packets 	= [];

// (^^^ would use full Model/ORM in production..).
//
// var packet = {
// 	uuid: uuid(),
// 	name: String(name || 'Anon')
// 	text: ['lorem ipsum dolar']
// }


io.on('connection', function (socket) {
	
		// Collect *ALL* sockets.
    sockets.push(socket);
		
		// First method a Client Socket will call to Register *all* users.
    socket.on('register', function (client) {
			
			// Our return packet.
			var packet = null;
			
			if (!client || !client.uuid) {
				// Generate a default UUID-based Packet.
				// http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
				var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
				    return v.toString(16);
				})
				
				// New Packet.
				packet = {
					uuid: uuid, 
					name: String(client.name || 'Anonymous'),
					text: []
				}
	      console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
	      console.log('Register packet:', packet.uuid);
				
				// Set our server-side packet.
				// todo: verify csrf or get the uuid and load from ORM
				// before pushing into our server.packets.
				packets.push({socket, packet});
			} else {
				// todo: add/real actual loading for existing 
				// clients and verify their packet *from* the server
				
				// Existing Packet.
				packet = {
					uuid: client.uuid, 
					name: String(client.name || 'Anonymous'),
					text: []
				}
			}
			
			// Emit potentially updated packet to Client.
      socket.emit('online', packet);
			
      console.log('Online packet:', packet.uuid);
      console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
    });
		
		// Messaging.
    socket.on('message', function (packet) {
      console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
      console.log('message.client:', packet.client.uuid);
      console.log('message.text:', packet.message);

			var text = String(packet.message || '');

			if (!text)
				return;

			// messages.push(message);
      console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
    });
		
		// // ADMIN: login an 'ADMIN' user.
		//     socket.on('login', function (userpass) {
		//       console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
		//       console.log('Logging in: xxx');
		//
		// 	//       var userpass = String(userpass || '');
		// 	//
		// 	// if (userpass == 'xxx') {
		// 	// 	// update the socket to be an admin
		// 	// 	socket.emit('upgrades', {useradmin: true});
		// 	// 		    socket.emit('messages', messages);
		// 	// }
		//     });
		
	
		// Exit.
    socket.on('disconnect', function () {
      sockets.splice(sockets.indexOf(socket), 1);
      updateRoster();
    });
		
});

// Core APIs.

function updateRoster() {

	// todo: map to admin sockets
	
  // async.map(
  //   sockets,
  //   function (socket, callback) {
  //     socket.get('name', callback);
  //   },
  //   function (err, names) {
  //     broadcast('roster', names);
  //   }
  // );
	
	
}

function broadcast(event, data) {
  sockets.forEach(function (socket) {
    socket.emit(event, data);
  });
}

function replyMessage() {
  async.map(
    messages,
    function (socket, callback) {
      socket.get('name', callback);
    },
    function (err, names) {
      broadcast('roster', names);
    }
  );
}

// Tools.

// Server

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});


