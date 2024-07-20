"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const redis_1 = require("redis");
const wss = new ws_1.WebSocketServer({ port: 8080 });
const subscribeClient = (0, redis_1.createClient)();
subscribeClient.connect();
const publishClient = (0, redis_1.createClient)();
publishClient.connect();
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
            if (atleastOneUserSubscribe(parsedMessage.room)) {
                console.log("subscribing to pubsub on " + parsedMessage.room);
                subscribeClient.subscribe(parsedMessage.room, (message) => {
                    const msg = JSON.parse(message);
                    console.log(msg);
                    Object.keys(subscriptions).forEach((userID) => {
                        const { ws, rooms } = subscriptions[userID];
                        if (rooms.includes(msg.room)) {
                            ws.send(msg.message);
                        }
                    });
                });
            }
        }
        if (parsedMessage.type === "UNSUBSCRIBE") {
            subscriptions[id].rooms = subscriptions[id].rooms.filter(x => x !== parsedMessage.room);
            if (noUserInterested(parsedMessage.room)) {
                console.log("unsubscribing from the room " + parsedMessage.room);
                subscribeClient.unsubscribe(parsedMessage.room);
            }
        }
        if (parsedMessage.type === "SENDMESSAGE") {
            const message = parsedMessage.message;
            const room = parsedMessage.room;
            publishClient.publish(room, JSON.stringify({
                type: "SENDMESSAGE",
                room: room,
                message
            }));
        }
        console.log('received: %s', data);
    });
    ws.send('something');
});
function createRandomID() {
    return Math.random();
}
function atleastOneUserSubscribe(room) {
    let totalInterestedUser = 0;
    Object.keys(subscriptions).map((userID) => {
        if (subscriptions[userID].rooms.includes(room)) {
            totalInterestedUser++;
        }
    });
    if (totalInterestedUser == 1) {
        return true;
    }
    return false;
}
function noUserInterested(room) {
    let totalInterestedUser = 0;
    Object.keys(subscriptions).map((userID) => {
        if (subscriptions[userID].rooms.includes(room)) {
            totalInterestedUser++;
        }
    });
    if (totalInterestedUser == 0) {
        return true;
    }
    return false;
}
