"use strict";
const SocketServer = require('socket.io');

const DB = require('./db.js');
const url = process.env.MONGODB_URI;


async function downloadData(socket) {
    let database = new DB;
    try {
        await database.connect(url);
        let result = await database.getCollectionArray('Seats');
        socket.emit('sensor download', result);
    } catch (err) {
        console.log('Could not download sensor data: ' + err.message)
    } finally {
        await database.close();
    }
}

function logConnection(socket) {
    let socketID = socket.id.toString();
    console.log(`client ${socketID} connected`);
    socket.on('disconnect', () => {
        console.log(`client ${socketID} disconnected`);
    });
}

async function onConnect(socket) {
    logConnection(socket);
    await downloadData(socket);
}

exports.createSocketServer = (server) => {
    let io = SocketServer(server);
    io.on('connect', onConnect);
    return io;
};
