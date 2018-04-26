"use strict";

const SocketIO = require('socket.io');
const debug = require('debug')('smartseatbelt:socket');
const DatabaseFactory = require('../../factories/database');


async function downloadSensorData() {
    let database = DatabaseFactory.getDatabase();
    try {
        await database.connect();
        return await database.getCollectionArray('Seats');
    } catch (error) {
        throw error;
    } finally {
        await database.close()
    }
}

async function downloadPlaneData() {
    let database = DatabaseFactory.getDatabase();
    try {
        await database.connect();
        return await database.getDocumentById('Planes', 1);
    } catch (error) {
        throw error;
    } finally {
        await database.close();
    }
}

async function onConnect(socket) {
    debug(`client ${socket.id} connected`);
    let sensorData = await downloadSensorData();
    let planeData = await downloadPlaneData();
    socket.emit('sensor download', sensorData);
    socket.emit('seatbeltlight update', planeData.seatbeltLightOn);
    socket.on('disconnect', () => {
        debug(`client ${socket.id} disconnected`);
    });
}


class Socket {
    constructor() {
        this.io = SocketIO();
    }
    addHandlers() {
        try {
            this.io.on('connect', onConnect);
        } catch (error) {
            console.error(`Error adding socket handlers: ${error.message}`);
            throw error;
        }
    }
    attach(server) {
        try {
            this.io.attach(server);
        } catch (error) {
            console.error(`Could not attach SocketIOServer to HTTPServer: ${error.message}`);
            throw error;
        }
    }
    emit(event, data) {
        try {
            this.io.emit(event, data);
        } catch (error) {
            console.error(`Could not emit data on SocketIOServer: ${error.message}`);
        }
    }
}

module.exports = Socket;
