"use strict";
const DB = require('../db.js');
const url = process.env.MONGODB_URI;


exports.getOneSensor = async (req, res, next) => {
    let database = new DB;
    try {
        await database.connect(url);
        let result = await database.getDocumentById('Sensors', req.params.id);
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
        let key = req.body.key;
        let value = req.body.value;
        let timestamp = req.body.timestamp;

        let updateSeat = {};
        updateSeat[key] = value;
        updateSeat['timestamp'] = timestamp;

        let updateSensor = {};
        updateSensor[key] = {value, timestamp};

        await database.connect(url);
        await Promise.all([
            database.updateDocumentById('Seats', req.body.id, {$set: updateSeat}),
            database.updateDocumentById('Sensors', req.body.id, {$push: updateSensor})
        ]);
        req.io.locals.emit('sensor update', {key, value, timestamp});
        res.send(true);
    } catch (err) {
        res.send(err);
    } finally {
        await database.close();
    }
};
