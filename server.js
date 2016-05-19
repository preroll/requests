//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//

var http = require('http');
var path = require('path');

var async     = require('async');
var socketio  = require('socket.io');
var express   = require('express');

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
var sockets = [];

// ADMIN: Protected arrays to store admins + messages.
var admins  = [];

// Store uuid/name/text[] packets.
var bundles = new Map();

// bundles: %{
//   client.uuid: {
//     socket: socket,
//     packet: {
//       uuid: client.uuid,
//       name: client.name,
//       text: String(message || '')
//     }
//   }
// }

io.on('connection', function (socket) {
  
  // Collect *ALL* sockets.
  sockets.push(socket);
  
  // First method a Client Socket will call to Connect/Register/Online *all* users.
  socket.on('register', function (client) {
    
    // Our return packet.
    var packet = null;
    
    if (!client || !client.uuid) {
      packet = {
        uuid: generateUUID(), 
        name: String(client.name || 'Anonymous'), 
        text: ''
      };
      
      // Set our server-side packet(s).
      // todo: verify csrf or get the uuid and load from ORM
      // before pushing into our server.packets.
      bundles.set(packet.uuid, {socket: socket, packet: packet});
      
    } else {
      // todo: add/real actual loading for existing 
      // clients and verify their packet *from* the server
      
      // Existing Packet.
      packet = {
        uuid: client.uuid, 
        name: client.name,
        text: client.text
      };
    }
    
    // Emit potentially updated packet to Client.
    socket.emit('online', packet);
    
  });
  
  // Messaging.
  socket.on('message', function (client, message) {
    // Our potential return packet.
    var packet = null;
    
    // Get the packet.
    // todo: error check packet->client to resist client side slipstreaming.
    if (bundles.has(client.uuid)) {
      var bundle = bundles.get(client.uuid);
      
      var packet = null;
      
      // Update the packet's text messages.    
      // todo: scrub message from client
      packet = {
        uuid: client.uuid,
        name: client.name, 
        text: String(message || '')
      };
      
      // Push the *new* message into the packet.
      bundles.set(packet.uuid, {socket: socket, packet: packet});
      
      socket.emit('receive', packet);      
    }
    
    // todo: update *all* other sockets that we have a new packet
  });
  
  // Exit.
  socket.on('disconnect', function () {
    // todo: remove the socket from the bundle as well..
    sockets.splice(sockets.indexOf(socket), 1);
  });
  
});

function generateUUID () {
  // Generate a default UUID-based Packet.
  // http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
  })
}
// Server

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});


