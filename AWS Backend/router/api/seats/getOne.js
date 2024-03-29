"use strict";

const DatabaseFactory = require('../../../factories/database');


async function getOneSeat(req, res, next) {
    let database = DatabaseFactory.getDatabase();
    try {
        await database.connect();
        let result = await database.getDocumentById('Seats', req.params.id);
        res.send(result);
    } catch (err) {
        throw(err);
    } finally {
        await database.close();
    }
}

module.exports = getOneSeat;
