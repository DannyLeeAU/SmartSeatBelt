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
        let updateSeat = {};
        updateSeat[req.body.key] = req.body.value;
        updateSeat['timestamp'] = req.body.timestamp;

        let updateSensor = {};
        updateSensor[req.body.key] = {value: req.body.value, timestamp: req.body.timestamp};

        await database.connect(url);
        await Promise.all([
            database.updateDocumentById('Seats', req.body.id, {$set: updateSeat}),
            database.updateDocumentById('Sensors', req.body.id, {$push: updateSensor})
        ]);
        req.io.locals.emit('sensor update', req.body.key, req.body.value, req.body.timestamp);
        res.send(true);
    } catch (err) {
        res.send(err);
    } finally {
        await database.close();
    }
};
