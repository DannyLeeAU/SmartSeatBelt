"use strict";
const router = require('express').Router();
const MongoClient = require('mongodb').MongoClient;

const DB = require('../db.js');
const seats = require('../seats.js');

const url = process.env.MONGODB_URI;
const dbName = 'SmartSeatBeltSystem';

/* Middleware to pass asynchronous errors to Express error handler.
 * https://odino.org/async-slash-await-in-expressjs/
 */
const asyncMiddleware = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next))
        .catch(next);
};



/* GET home page. */
router.get('/', (req, res, next) =>  {
    res.render('index', { title: 'Smart Seat/Belt System API' });
});

/* Setup Seats */
router.get('/setupSeats', asyncMiddleware(async (req, res, next) => {
    seats.populateSeatData();
}));

/* Get a single seat */
router.get('/getSeat/:_id', asyncMiddleware(async (req, res, next) => {
    let database = new DB;
    try {
        await database.connect(url, dbName);
        let result = await database.getCollection('Seats')
            .findOne({'_id': req.params._id})
            .toArray();
        res.send(result);
    } catch (err) {
        res.send(err);
    } finally {
        await database.close();
    }
}));


/* Get Seats*/
router.get('/getSeats', asyncMiddleware(async (req, res, next) => {
    let database = new DB;
    try {
        await database.connect(url, dbName);
        let result = await database.getCollection('Seats')
            .find()
            .toArray();
        res.send(result);
    } catch (err) {
        res.send(err);
    } finally {
        await database.close();
    }
}));

router.get('/getSensorHistory', asyncMiddleware(async (req, res, next) => {
    let database = new DB;
    try {
        await database.connect(url, dbName);
        let result = await database.getCollection('Sensors')
            .find()
            .toArray();
        res.send(result);
    } catch (err) {
        res.send(err);
    } finally {
        await database.close();
    }
}));

module.exports = router;
