"use strict";
const DB = require('../db.js');
const url = process.env.MONGODB_URI;


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

function createSensor(seat, sensor, value, time) {
    return {seat, sensor, value, time};
}

function createDocuments() {
    let seats = [];
    let sensors = [];
    let timestamp = new Date().getTime() / 1000;

    for (let name of seatNames()) {
        let buckled = true, proximity = true, accelerometer = 0.0;
        seats.push(createSeat(name, buckled, proximity, accelerometer));
        sensors.push(createSensor(name, "buckled", buckled, timestamp));
        sensors.push(createSensor(name, "proximity", proximity, timestamp));
        sensors.push(createSensor(name, "accelerometer", accelerometer, timestamp));
    }
    return {seats, sensors};
}

exports.populateSeatData = async (req, res, next) => {
    let database = new DB;
    try {
        let {seats, sensors} = await createDocuments(database);
        await database.connect(url);
        await Promise.all([
            database.dropCollection('Seats'),
            database.dropCollection('Sensors')
        ]);
        await Promise.all([
            database.addManyDocuments('Seats', seats),
            database.addManyDocuments('Sensors', sensors)
        ]);
        res.send(true);
    } catch (err) {
        throw(err);
    } finally {
        await database.close();
    }
};

exports.getOneSeat = async (req, res, next) => {
    let database = new DB;
    try {
        await database.connect(url);
        let result = await database.getDocumentById('Seats', req.params.id);
        res.send(result);
    } catch (err) {
        throw(err);
    } finally {
        await database.close();
    }
};

exports.getAllSeats = async (req, res, next) => {
    let database = new DB;
    try {
        await database.connect(url);
        let result = await database.getCollectionArray('Seats');
        res.send(result);
    } catch (err) {
        throw(err);
    } finally {
        await database.close();
    }
};
