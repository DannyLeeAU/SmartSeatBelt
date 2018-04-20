"use strict";
const DB = require('../db.js');
const url = process.env.MONGODB_URI;


function updateSeat(body) {
    let seatUpdate = {};
    seatUpdate[body.sensor] = body.value;
    return {$set: seatUpdate};
}

function addSensor(body) {
    return {seat: body.seat, sensor: body.sensor, value: body.value, time: body.timestamp};
}

async function updateDatabase(body) {
    let database = new DB;
    try {
        await database.connect(url);
        return Promise.all([
            database.updateDocumentById('Seats', body.seat, updateSeat(body)),
            database.addDocument('Sensors', addSensor(body))
        ]);
    } catch (err) {
        throw(err);
    } finally {
        await database.close();
    }
}

function sendSocketSensor(io, body) {
    let data = {seat: body.seat, sensor: body.sensor, value: body.value, time: body.timestamp};
    io.emit('sensor update', data);
}

exports.getOneSensor = async (req, res, next) => {
    let database = new DB;
    try {
        await database.connect(url);
        let result = await database.getDocumentsByValue('Sensors', 'seat', req.params.seat);
        res.send(result);
    } catch (err) {
        res.send(err);
    } finally {
        await database.close();
    }
};

exports.getAllSensors = async (req, res, next) => {
    let database = new DB;
    try {
        await database.connect(url);
        let result = await database.getCollectionArray('Sensors');
        res.send(result);
    } catch (err) {
        res.send(err);
    } finally {
        await database.close();
    }
};

exports.postOneSensor = async (req, res, next) => {
    let io = req.app.get('socketio');
    try {
        await updateDatabase(req.body);
        sendSocketSensor(io, req.body);
        res.send(true);
    } catch (err) {
        res.send(err);
    }
};
