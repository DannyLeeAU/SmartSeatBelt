"use strict";

const database = require('../../../models/database');


async function getOnePlane(req, res, next) {
    try {
        await database.connect();
        let result = await database.getDocumentById('Planes', req.params.plane);
        res.send(result);
    } catch (err) {
        res.send(err);
    } finally {
        await database.close();
    }
}

module.exports = getOnePlane;
