"use strict";
const DB = require('../db.js');
const url = process.env.MONGODB_URI;


function seatNames() {
    let seats = [];
    for (let i = 1; i < 26; i++) {
        let column_ids;
        if (1 <= i && i < 7) {
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

function probability(percentage) {
    if (0 < percentage <= 100) {
        return !!Math.floor(Math.random() * (100 / percentage))
    } else {
        throw(new Error('Percentage must be 1 to 100'))
    }
}

exports.populateSeatData = async (req, res, next) => {
    let database = new DB;
    try {
        await database.connect(url);
        let seats = [];
        let sensors = [];
        let timestamp = new Date().getTime() / 1000;

        await database.dropCollection('Seats');
        await database.dropCollection('Sensors');

        for (let name of seatNames()) {
            let proximity = probability(50);
            let buckled = proximity ? probability(50) : false;
            seats.push(createSeat(name, buckled, proximity));
            sensors.push(createSensorArray(name, timestamp, buckled, proximity));
        }

        await database.addManyDocuments('Seats', seats);
        await database.addManyDocuments('Sensors', sensors);
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
