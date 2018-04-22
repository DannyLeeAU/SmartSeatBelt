"use strict";

const database = require('../../../models/database');


async function getAllSeats(req, res, next) {
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
