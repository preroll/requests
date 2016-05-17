//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//

var http = require('http');
var path = require('path');

var async     = require('async');
var socketio   = require('socket.io');
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
var sockets   = [];

// ADMIN: Protected arrays to store admins + messages.
var admins    = [];

// Store uuid/name/text[] packets.
var bundles   = [];

// (^^^ would use full Model/ORM in production..).
//
// var examplePacket = {
//   uuid: uuid(),
//   name: String(name || 'Anon')
//   text: ['lorem ipsum dolar']
// }

io.on('connection', function (socket) {
  
  // Collect *ALL* sockets.
  sockets.push(socket);
    
  // First method a Client Socket will call to Connect/Register/Online *all* users.
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
      bundles.push({socket: socket, packet: packet});
      
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
  socket.on('message', function (client, message) {
    console.log('xxx Message xxxxxxxxxxxxxxxxxxxxxxxx');
    console.log('client.uuid:', client.uuid);
    console.log('message.text:', message);

    // todo: scrub message from client
    var text = String(message || '');
    if (!text)
      return;
    
    // Our potential return packet.
    var packet = null;
  
    bundles.map(function (bundle, index, array) { 
      if (bundle.packet.uuid == client.uuid) {
        // todo: error check packet->client to resist client side slipstreaming
        bundle = bundles[index];
      
        // update the client's messages
        bundle.packet.text.push(message)
        
        // collect the packet for return.
        packet = bundle.packet;
        
        // Our updates.
        socket.emit('update', bundle.packet);
      }
    });
    
    // todo: update *all* other sockets that we have a new packet
    console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
  });
    
  // Exit.
  socket.on('disconnect', function () {
    sockets.splice(sockets.indexOf(socket), 1);
  });
  
});

// Server

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});


