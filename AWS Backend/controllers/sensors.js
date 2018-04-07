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
        await database.updateDocumentById('Seats', req.body.id, {$set: updateSeat});
        await database.updateDocumentById('Sensors', req.body.id, {$push: updateSensor});
    } catch (err) {
        res.send(err);
    } finally {
        await database.close();
    }
};
