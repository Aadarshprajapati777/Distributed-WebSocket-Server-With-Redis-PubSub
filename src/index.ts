
import { WebSocketServer, WebSocket } from 'ws';

const wss = new WebSocketServer({ port: 8080 });
const subscriptions: {[key:string]:{
  ws:WebSocket,
  rooms:string[]
}} = {

}


wss.on('connection', function connection(ws) {
  const id = createRandomID();
  subscriptions[id]={
    ws:ws,
    rooms:[]
  }



  ws.on('error', console.error);

  ws.on('message', function message(data) {
    const parsedMessage = JSON.parse(data as unknown as string);
    if(parsedMessage.type === "SUBSCRIBETOROOM"){
      subscriptions[id].rooms.push(parsedMessage.room);
    }
    
    if(parsedMessage.type === "MESSAGE"){
      const message = parsedMessage.message;
      const room = parsedMessage.room;

      Object.keys(subscriptions).forEach((userID)=>{
        const {ws, rooms} = subscriptions[userID];
        if(rooms.includes(room)){
          ws.send(message);
        }
      })

    }

    console.log('received: %s', data);
  });

  ws.send('something');
});


function createRandomID(){
  return Math.random();
}