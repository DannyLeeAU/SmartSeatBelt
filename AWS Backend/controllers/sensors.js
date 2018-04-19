"use strict";
const DB = require('../db.js');
const url = process.env.MONGODB_URI;


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
    let io = req.app.get('socketio');
    try {
        let _id = req.body._id;
        let sensor = req.body.sensor;
        let value = req.body.value;
        let timestamp = req.body.timestamp;

        let updateSeat = {};
        updateSeat[sensor] = value;

        let updateSensor = {};
        updateSensor[sensor] = {value, timestamp};

        await database.connect(url);
        await Promise.all([
            database.updateDocumentById('Seats', _id, {$set: updateSeat}),
            database.updateDocumentById('Sensors', _id, {$push: updateSensor})
        ]);
        io.emit('sensor update', {_id, sensor, value, timestamp});
        res.send(true);
    } catch (err) {
        res.send(err);
    } finally {
        await database.close();
    }
};
