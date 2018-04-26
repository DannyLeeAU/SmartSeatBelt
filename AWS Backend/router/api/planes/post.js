"use strict";

const DatabaseFactory = require('../../../factories/database');


function createPlaneUpdate(req) {
    let updatePlane = { seatbeltLightOn: req.body.seatbeltLightOn };
    return {$set: updatePlane};
}

function emitSocketEvents(req) {
    let io = req.app.get('socketio');
    if (req.body.hasOwnProperty('seatbeltLightOn')) {
        io.emit('seatbeltlight update', req.body.seatbeltLightOn);
    }
}


async function postPlane(req, res, next) {
    let database = DatabaseFactory.getDatabase();
    let update = createPlaneUpdate(req);
    try {
        await database.connect();
        await database.updateDocumentById('Planes', req.body.plane, update);
        emitSocketEvents(req);
        res.send(true);
    } catch (err) {
        res.send(err);
    } finally {
        await database.close();
    }
}

module.exports = postPlane;
