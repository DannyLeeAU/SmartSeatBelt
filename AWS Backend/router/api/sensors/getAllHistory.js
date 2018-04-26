"use strict";

const DatabaseFactory = require('../../../factories/database');


async function getAllSensors(req, res, next) {
    let database = DatabaseFactory.getDatabase();
    try {
        await database.connect();
        let result = await database.getCollectionArray('Sensors');
        res.send(result);
    } catch (err) {
        res.send(err);
    } finally {
        await database.close();
    }
}

module.exports = getAllSensors;
