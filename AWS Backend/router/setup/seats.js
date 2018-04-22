"use strict";

const database = require('../../models/database/index');


function seatNames() {
    let seats = [];
    for (let row = 1; row < 7; row++) {
        for (let column of "ABEF") {
            seats.push(row + column);
        }
    }
    for (let row = 7; row < 26; row++) {
        for (let column of "ABCDEF") {
            seats.push(row + column);
        }
    }
    return seats;
}

function createSeat(_id, buckled, proximity, accelerometer) {
    return {_id, buckled, proximity, accelerometer};
}

function createSeatArray() {
    let seats = [];
    for (let name of seatNames()) {
        let buckled = true, proximity = true, accelerometer = 0.0;
        seats.push(createSeat(name, buckled, proximity, accelerometer));
    }
    return seats;
}

function createSensor(seat, sensor, value, time) {
    return {seat, sensor, value, time};
}

function createSensorArray() {
    let sensors = [];
    let timestamp = new Date().getTime() / 1000;
    for (let name of seatNames()) {
        let buckled = true, proximity = true, accelerometer = 0.0;
        sensors.push(createSensor(name, "buckled", buckled, timestamp));
        sensors.push(createSensor(name, "proximity", proximity, timestamp));
        sensors.push(createSensor(name, "accelerometer", accelerometer, timestamp));
    }
    return sensors;
}


async function populateSeatData(req, res, next) {
    let seats = createSeatArray();
    let sensors = createSensorArray();
    try {
        await database.connect();
        await database.dropCollection('Seats');
        await database.dropCollection('Sensors');
        await database.addManyDocuments('Seats', seats);
        await database.addManyDocuments('Sensors', sensors);
        await database.createIndex('Sensors', 'time');
        res.send(true);
    } catch (err) {
        throw(err);
    } finally {
        await database.close();
    }
}

module.exports = populateSeatData;
