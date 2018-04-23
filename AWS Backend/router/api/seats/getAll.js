"use strict";

const DatabaseFactory = require('../../../factories/database');


async function getAllSeats(req, res, next) {
    let database = DatabaseFactory.getDatabase();
    try {
        await database.connect();
        let result = await database.getCollectionArray('Seats');
        res.send(result);
    } catch (err) {
        throw(err);
    } finally {
        await database.close();
    }
}

module.exports = getAllSeats;
