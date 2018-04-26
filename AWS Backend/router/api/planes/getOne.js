"use strict";

const DatabaseFactory = require('../../../factories/database');


async function getOnePlane(req, res, next) {
    let database = DatabaseFactory.getDatabase();
    try {
        await database.connect();
        let result = await database.getDocumentById('Planes', req.params.id);
        res.send(result);
    } catch (err) {
        res.send(err);
    } finally {
        await database.close();
    }
}

module.exports = getOnePlane;
