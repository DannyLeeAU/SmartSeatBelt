"use strict";

const DatabaseFactory = require('../../../factories/database');


function normalizeSensorValue(req) {
    let value;
    switch (req.body.sensor) {
        case 'buckled':
        case 'proximity':
            value = Boolean(req.body.value);
            break;
        case 'accelerometer':
            value = Number(req.body.value);
            break;
        default:
            value = req.body.value;
    }
    return value;
}

function createSeatUpdate(req) {
    let seatUpdate = {};
    seatUpdate[req.body.sensor] = normalizeSensorValue(req);
    return {$set: seatUpdate};
}

function createSensorDataMap(req) {
    return {
        seat: req.body.seat,
        sensor: req.body.sensor,
        value: normalizeSensorValue(req),
        time: Date.now() / 1000
    };
}


async function postOneSensor(req, res, next) {
    let database = DatabaseFactory.getDatabase();
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
