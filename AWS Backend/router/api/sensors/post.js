"use strict";

const database = require('../../../models/database');


function createSeatUpdate(req) {
    let seatUpdate = {};
    seatUpdate[req.body.sensor] = req.body.value;
    return {$set: seatUpdate};
}

function createSensorDataMap(req) {
    return {
        seat: req.body.seat,
        sensor: req.body.sensor,
        value: req.body.value,
        time: req.body.timestamp
    };
}


async function postOneSensor(req, res, next) {
    let io = req.app.get('socketio');
    let update = createSeatUpdate(req);
    let sensorData = createSensorDataMap(req);
    try {
        await database.connect();
        await Promise.all([
            database.updateDocumentById('Seats', req.body.seat, update),
            database.addDocument('Sensors', sensorData)
        ]);
        io.emit('sensor update', sensorData);
        res.send(true);
    } catch (err) {
        res.send(err);
    } finally {
        await database.close();
    }
}

module.exports = postOneSensor;
