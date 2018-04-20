"use strict";
const express = require('express');
const router = express.Router();

const seat_controller = require('../controllers/seat.js');
const sensor_controller = require('../controllers/sensor.js');
const plane_controller = require('../controllers/plane.js');


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
router.get('/setupSeats', asyncMiddleware(seat_controller.populateSeatData));

/* Get a single seat */
router.get('/getSeat/:id', asyncMiddleware(seat_controller.getOneSeat));

/* Get all seats */
router.get('/getSeats', asyncMiddleware(seat_controller.getAllSeats));

/* Get history of one sensor */
router.get('/getOneSensor/:seat', asyncMiddleware(sensor_controller.getOneSensor));

/* Get entire sensor history */
router.get('/getSensorHistory', asyncMiddleware(sensor_controller.getAllSensors));

/* Post sensor update */
router.post('/postSensor', asyncMiddleware(sensor_controller.postOneSensor));

/* Get seatbelt light info */
router.post('/getOnePlane/:plane', asyncMiddleware(plane_controller.getOnePlane));

/* Post seatbelt light update */
router.post('/postPlaneUpdate', asyncMiddleware(plane_controller.postPlaneUpdate));

module.exports = router;
