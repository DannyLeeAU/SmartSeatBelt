"use strict";
const DB = require('../db.js');

const url = process.env.MONGODB_URI;
const dbName = 'SmartSeatBeltSystem';


function seatNames() {
    let seats = [];
    for (let i = 1; i < 26; i++) {
        let column_ids;
        if (1 <= i < 7) {
            column_ids = "ABEF";
        } else {
            column_ids = "ABCDEF";
        }
        for (let c of column_ids) {
            seats.push(i + c);
        }
    }
    return seats;
}

function createSeat(position, buckled, proximity) {
    return {
        "_id": position,
        "buckled": buckled,
        "proximity": proximity
    };
}

function createSensorArray(position, timestamp, buckled, proximity) {
    return {
        "_id": position,
        "buckled": [
            {
                "time": timestamp,
                "value": buckled
            }
        ],
        "proximity": [
            {
                "time": timestamp,
                "value": proximity
            }
        ]
    };
}

exports.populateSeatData = async (req, res, next) => {
    let database = new DB;
    try {
        await database.connect(url, dbName);
        let seats = [];
        let sensors = [];
        let timestamp = new Date().getTime() / 1000;

        for (name of seatNames()) {
            let proximity = !!Math.floor(Math.random() * 2);
            let buckled = proximity ? !!Math.floor(Math.random() * 2) : false;
            seats.push(createSeat(name, buckled, proximity));
            sensors.push(createSensorArray(name, timestamp, buckled, proximity));
        }

        await database.addManyDocuments('Seats', seats);
        await database.addManyDocuments('Sensors', sensors);
    } catch (err) {
        res.send(err);
    } finally {
        await database.close();
    }
};

exports.getOneSeat = async (req, res, next) => {
    let database = new DB;
    try {
        await database.connect(url, dbName);
        let result = await database.getCollection('Seats')
            .findOne({'_id': req.params._id})
            .toArray();
        res.send(result);
    } catch (err) {
        res.send(err);
    } finally {
        await database.close();
    }
};

exports.getAllSeats = async (req, res, next) => {
    let database = new DB;
    try {
        await database.connect(url, dbName);
        let result = await database.getCollection('Seats')
            .find()
            .toArray();
        res.send(result);
    } catch (err) {
        res.send(err);
    } finally {
        await database.close();
    }
};
