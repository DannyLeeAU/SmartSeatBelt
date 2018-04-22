"use strict";

const SocketIO = require('socket.io');
const debug = require('debug')('smartseatbelt:socket');
const database = require('../database');


class Socket {
    constructor() {
        this.io = SocketIO({});
        this.addHandlers();
    }
    async onConnect(socket) {
        debug(`client ${socket.id} connected`);
        try {
            await database.connect();
            let result = await database.getCollectionArray('Seats');
            socket.emit('sensors download', result);
        } catch (error) {
            console.error(`Could not download sensor data: ${error.message}`);
            throw error;
        } finally {
            await database.close();
        }
        socket.on('disconnect', () => {
            debug(`client ${socket.id} disconnected`);
        });
    }
    addHandlers() {
        try {
            this.io.on('connect', this.onConnect);
        } catch (error) {
            console.error(`Error adding socket handlers: ${error.message}`);
            throw error;
        }
    }
    attach(server) {
        this.io.attach(server);
    }
}

module.exports = Socket;
