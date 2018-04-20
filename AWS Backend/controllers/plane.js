"use strict";
const DB = require('../db.js');
let url = process.env.MONGODB_URI;


function createPlaneUpdate(body) {
    let updatePlane = {};
    for (let value in body) {
        if (body.hasOwnProperty(value)) {
            updatePlane[value] = body[value];
        }
    }
    return {$set: updatePlane};
}

async function updateDatabaseDocument(coll, id, update) {
    let database = new DB;
    try {
        await database.connect(url);
        await database.updateDocumentById(coll, id, update);
    } catch (err) {
        throw(err);
    } finally {
        await database.close();
    }
}

function sendSocketPlane(io, body) {
    if (body.hasOwnProperty('seatbeltLightOn')) {
        io.emit('seatbelt light update', {seatbeltLightOn: body.seatbeltLightOn});
    }
}

exports.getOnePlane = async (req, res, next) => {
    let database = new DB;
    try {
        await database.connect(url);
        let result = await database.getDocumentById('Planes', req.params.plane);
        res.send(result);
    } catch (err) {
        res.send(err);
    } finally {
        await database.close();
    }
};

exports.postPlaneUpdate = async (req, res, next) => {
    let io = req.app.get('socketio');
    let update = createPlaneUpdate(req.body);
    try {
        await updateDatabaseDocument('Planes', req.body.plane, update);
        sendSocketPlane(io, req.body);
        res.send(true);
    } catch (err) {
        res.send(err);
    }
};