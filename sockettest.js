var fs=require("fs");
var clientpage = fs.readFileSync("client.html");
var http = require('http'),  
    io = require('socket.io'); // for npm, otherwise use require('./path/to/socket.io')


var server = http.createServer(function(req, res){ 
 // your normal server code 
 res.writeHead(200, {'Content-Type': 'text/html'});
 res.end(clientpage);
});
server.listen(81);
console.log('listening @ http://74.207.253.119:81');
  
// socket.io 
var clients = {}
var cindex = 0;
var uindex = 0;
var socket = io.listen(server); 
socket.on('connection', function(client){ 
  var myid = 'c' + cindex++;
  console.log('connected as ' + myid);
  var Obj = {};
  Obj.message = 'you are ' + myid
  client.send(JSON.stringify(Obj));
  for (var id in clients)
  {
       client.send(JSON.stringify({'id':id}));
       clients[id].send(JSON.stringify({'id':myid}));
  } 
  clients[myid] = client;
  client.on('message', function(data){ 
      console.log(data);  
      var Obj = JSON.parse(data);
      if(Obj.message == 'Hello world')
      {
            for (var id in clients)
            {
                if( id == myid )
                 clients[id].send(JSON.stringify({'message':'hello yourself bub'}));
                else
                 clients[id].send(JSON.stringify({'message':'hello from ' + myid}));
            } 
      }
      if(Obj.message == 'list')
      {
          for (var id in clients)
          {
              if( id != myid )
               client.send(JSON.stringify({'id':id}));
          } 
      }
      if(clients[Obj.message])
      {
          
          var close = { 'close':true };
          clients[Obj.message].send(JSON.stringify(close));  
      }
      if(Obj.x && Obj.y)
      {
         Obj.id = myid;
         console.log(Obj);
         var mouseMove = JSON.stringify(Obj);
         for (var id in clients)
         {
             if( id != myid )
              clients[id].send(mouseMove);
         }   
      }
  }) 
  client.on('disconnect', function(){
       delete clients[myid]; 
       for (var id in clients)
       {
            clients[id].send(JSON.stringify({'remove':myid}));
       }  
  }) 
}); 
