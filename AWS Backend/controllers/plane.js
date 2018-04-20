"use strict";
const DB = require('../db.js');
let url = process.env.MONGODB_URI;


function planeUpdate(body) {
    let updatePlane = {};
    for (let value in body) {
        if (body.hasOwnProperty(value)) {
            updatePlane[value] = body[value];
        }
    }
    return {$set: updatePlane};
}

exports.getPlane = async (req, res, next) => {
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
    let database = new DB;
    let update = planeUpdate(req.body);
    try {
        await database.connect(url);
        await database.updateDocumentById('Planes', req.body.plane, update);
        res.send(true);
    } catch (err) {
        res.send(err);
    } finally {
        await database.close();
    }
};