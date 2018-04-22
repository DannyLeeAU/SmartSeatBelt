"use strict";

const database = require('../../../models/database');


async function getAllPlanes(req, res, next) {
    try {
        await database.connect();
        let result = await database.getCollectionArray('Planes');
        res.send(result);
    } catch (err) {
        res.send(err);
    } finally {
        await database.close();
    }
}

module.exports = getAllPlanes;
