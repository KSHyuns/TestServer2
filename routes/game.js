

const uuidv4 = require('uuid/v4');

module.exports = function(server)
{
    //방정보가 들어갈 배열 선언
    var rooms = [];

    //socket.io = 웹서버는 단방향으로만 리퀘스트를 주고 socket은 양방향으로 리퀘스트를 주고 받을 수 있다.
    var io = require('socket.io')(server,{
        transports : ['websocket']
    });

    //접속했을때 호출
    io.on('connection',function(socket){
            console.log("Connected : " + socket.id);

            //방이 있을떄
            if(rooms.length > 0)
            {
                //만들어져있는 방을 찾는다.
                var rId = rooms.shift();
                //socket.join(rId,() => {
                socket.join(rId,function(){
                    console.log("Join : " + rId);
                    socket.emit('JoinRoom',{room:rId}); //방이 만들어졌다면 JoinRoom의 이름을 전달 한다.
                    //만들어져있는 특정한 방에 있는 클라이언트들에게 startGame 전달.
                    io.to(rId).emit('startGame');
                    //room.pop(rId);
                });
            }
            //방이 없을때
            else
            {
                //방이름을 새로 만들고
                var roomName = uuidv4();
                //만든 방이름으로 들어간다.
                socket.join(roomName , function(){
                    console.log("Create Room : " + roomName);
                    socket.emit('createRoom',{room:roomName});  //CreateRoom에 room의 이름도 같이 전달한다.
                    rooms.push(roomName);    //룸의 방이름을 push 한다. (Add)
                });
            }




            //접속중일때,  접속이 끈켯다면
            //접속이 끈켯을때
            socket.on('disconnect', function(reason)
            {
                console.log('Disconnected : '+socket.id);

                //소켓이 속해 있는 방의 정보를 받아올 수 있다.
                //socket.room
                //만들어진 소켓의 키값을 받아올 수 있다. 키값들을 받아와서 내방의 정보 외의 불필요한 것들을 걸러 낸다.
                //var socketRooms = Object.keys(socket.rooms).filter(item => item != socket.id);
                var socketRooms = Object.keys(socket.rooms).filter(item => item != socket.id);
                    //function(item){
                    // if(item != socket.id)
                    // {
                    //     return true;
                    // }
                    // else
                    // {
                    //     return false;
                    // }
              //  });
                console.dir(socketRooms);

                socketRooms.forEach(function(room)
                {
                    //특정한 방의 대상만 보내게 된다.
                    socket.broadcast.to(room).emit('exitRoom');
                    // 혼자 만든 방의 유저가 disconnect 되면 해당 방을 제거
                    var idx = room.indexOf(room);       //해당하는 값을 찾았다면 해당되는 인덱스를 반환하는데, 찾지 못했다면 -1을 반환한다.
                    if(idx != -1)
                    {
                        rooms.split(idx,1); //해당되는 인덱스의 방을 지운다.
                    }
                });
                socket.on('ackTest', function(data, fn) {
                    fn(data);
                });
        

             });

             socket.on('doPlayer', function(playerInfo) {

                var roomId = playerInfo.room;
                var cellIndex = playerInfo.position;
    
                socket.broadcast.to(roomId).emit('doOpponent',
                { position: cellIndex });
                
            });
    


            //  socket.on('hi',function(reason){
            //     console.log('hi');
            //     //socket.emit('hello'); //한명에게만 소켓을 보낸다.
            //     //io.emit('hello');   //모든 소켓들에게 메시지를 보낸다.
            //     //socket.broadcast.emit('hello');   //메세지를 직접받은 클라이언트 외 나머지 클라이언트들에게 메세지를 보낸다.
            //  });

            //메세지가 왔는지 알리는 식별자
             socket.on('message',function(msg){
                //메세지가 잘 들어오는지 확인
                //들어오는 메세지의 구조를 볼 수 있다
                console.dir(msg);
                socket.broadcast.emit('chat',msg);

                
                //socket.broadcast.emit('chat');
             });


            
    });

    //서버에접속한 모든 클라이언트가 할일들을 감지할 수 있게된다.   io.on

   


    //소켓이 접속한 후 일어난 이벤트들은 socket.on

};