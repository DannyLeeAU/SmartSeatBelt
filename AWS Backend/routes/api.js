"use strict";
const express = require('express');
const router = express.Router();

const seats = require('../controllers/seats.js');
const sensors = require('../controllers/sensors.js');


/* Middleware to pass asynchronous errors to Express error handler.
 * https://odino.org/async-slash-await-in-expressjs/
 */
const asyncMiddleware = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next))
        .catch(next);
};


/* GET home page. */
router.get('/', (req, res, next) => {
    res.render('index', { title: 'Smart Seat/Belt System API' });
});

/* Setup seats */
router.get('/setupSeats', asyncMiddleware(seats.populateSeatData));

/* Get a single seat */
router.get('/getSeat/:id', asyncMiddleware(seats.getOneSeat));

/* Get all seats */
router.get('/getSeats', asyncMiddleware(seats.getAllSeats));

/* Get history of one sensor */
router.get('/getOneSensor/:id', asyncMiddleware(sensors.getOneSensor));

/* Get entire sensor history */
router.get('/getSensorHistory', asyncMiddleware(sensors.getAllSensors));

module.exports = router;
