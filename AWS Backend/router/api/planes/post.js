"use strict";
const database = require('../../../models/database');


function createPlaneUpdate(req) {
    let updatePlane = {};
    for (let value in req.body) {
        if (req.body.hasOwnProperty(value)) {
            updatePlane[value] = req.body[value];
        }
    }
    return {$set: updatePlane};
}

function emitSocketEvents(req) {
    let io = req.app.get('socketio');
    if (req.body.hasOwnProperty('seatbeltLightOn')) {
        io.emit('seatbelt light update', req.body.seatbeltLightOn);
    }
}


async function postPlane(req, res, next) {
    let update = createPlaneUpdate(req);
    try {
        await database.connect();
        await database.updateDocumentById('Planes', req.body.plane, update);
        emitSocketEvents();
        res.send(true);
    } catch (err) {
        res.send(err);
    } finally {
        database.close();
    }
}

module.exports = postPlane;
