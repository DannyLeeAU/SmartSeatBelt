"use strict";
const DB = require('../db.js');
const url = process.env.MONGODB_URI;


async function updateSeat(database, seat, sensor, value) {
    let updateSeat = {};
    updateSeat[sensor] = value;
    return database.updateDocumentById('Seats', seat, {$set: updateSeat});
}

async function addSensor(database, seat, sensor, value, time) {
    return database.addDocument('Sensors', {seat, sensor, value, time});
}

async function updateDatabase(database, seat, sensor, value, time) {
    return Promise.all([
        updateSeat(database, seat, sensor, value),
        addSensor(database, seat, sensor, value, time)
    ]);
}

function sendSocketSensor(seat, sensor, value, time) {
    let io = req.app.get('socketio');
    io.emit('sensor update', {seat, sensor, value, time});
}

exports.getOneSensor = async (req, res, next) => {
    let database = new DB;
    try {
        await database.connect(url);
        let id = req.params.id;
        let result = await database.getDocumentsByValue('Sensors', 'seat', id);
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
    let database = new DB;
    try {
        let seat = req.body.seat;
        let sensor = req.body.sensor;
        let value = req.body.value;
        let time = req.body.timestamp;

        await database.connect(url);
        await updateDatabase(database, seat, sensor, value, time);
        sendSocketSensor(seat, sensor, value, time);

        res.send(true);
    } catch (err) {
        res.send(err);
    } finally {
        await database.close();
    }
};
