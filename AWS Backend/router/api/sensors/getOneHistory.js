"use strict";

const DatabaseFactory = require('../../../factories/database');


async function getOneSensorHistory(req, res, next) {
    let database = DatabaseFactory.getDatabase();
    try {
        await database.connect();
        let result = await database.getDocumentsByValue('Sensors', 'seat', req.params.id, {time: 1});
        res.send(result);
    } catch (err) {
        res.send(err);
    } finally {
        await database.close();
    }
}

module.exports = getOneSensorHistory;
