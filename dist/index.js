"use strict";
// import { WebSocketServer,WebSocket } from 'ws';
// import {createClient} from "redis"
Object.defineProperty(exports, "__esModule", { value: true });
// const publishClient = createClient();
// publishClient.connect();
// const subscribeClient = createClient();
// subscribeClient.connect();
// const wss = new WebSocketServer({ port: 8080 });
// const subscriptions: {[keys:string]:{
//   ws:WebSocket,
//   rooms: string[]
// }}= {
// }
// setInterval(()=>{
// console.log(subscriptions)
// }, 2000)
// wss.on('connection', function connection(ws) {
//   const id = randomID();
//   subscriptions[id]={
//     ws: ws,
//     rooms:[]
//   }
//   ws.on('message', function message(data) {
//     const userMessage = JSON.parse(data as unknown as string)
//     if(userMessage.type === "SUBSCRIBE"){
//       subscriptions[id].rooms.push(userMessage.room);
//     }
//     if(userMessage.type === "MESSAGE"){
//       const message = userMessage.message;
//       const roomID = userMessage.roomID;
//       // Object.keys(subscriptions).forEach((userID)=>{
//       //   const {ws, rooms} = subscriptions[userID];
//       //   if(rooms.includes(roomID)){
//       //     ws.send(message)
//       //   }
//       // })
//       publishClient.publish(roomID, JSON.stringify({
//         type: "MESSAGE",
//         roomID:roomID,
//         message
//       }))
//     }
//   });
// });
// function randomID(){
//   return Math.random();
// }
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 8080 });
const subscriptions = {};
wss.on('connection', function connection(ws) {
    const id = createRandomID();
    subscriptions[id] = {
        ws: ws,
        rooms: []
    };
    ws.on('error', console.error);
    ws.on('message', function message(data) {
        const parsedMessage = JSON.parse(data);
        if (parsedMessage.type === "SUBSCRIBETOROOM") {
            subscriptions[id].rooms.push(parsedMessage.room);
        }
        if (parsedMessage.type === "MESSAGE") {
            const message = parsedMessage.message;
            const room = parsedMessage.room;
            Object.keys(subscriptions).forEach((userID) => {
                const { ws, rooms } = subscriptions[userID];
                if (rooms.includes(room)) {
                    ws.send(message);
                }
            });
        }
        console.log('received: %s', data);
    });
    ws.send('something');
});
function createRandomID() {
    return Math.random();
}
