"use strict";
const express = require('express');
const router = express.Router();

const api = require('./api');
const setup = require('./setup');


/* Middleware to pass asynchronous errors to Express error handler.
 * https://odino.org/async-slash-await-in-expressjs/
 */
const asyncMiddleware = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next))
        .catch(next);
};


/* GET root home page. */
router.get('/', (req, res, next) => {
    res.render('index', { title: 'Smart Seat/Belt System' });
});

/* Setup seats */
router.get('/setup/seats', asyncMiddleware(setup.seats));

/* GET API home page. */
router.get('/api', (req, res, next) => {
    res.render('index', { title: 'Smart Seat/Belt System API' });
});

/* GET all seats */
router.get('/api/seats', asyncMiddleware(api.seats.getAll));

/* GET a single seats */
router.get('/api/seats/:id', asyncMiddleware(api.seats.getOne));

/* GET entire sensors history */
router.get('/api/sensors', asyncMiddleware(api.sensors.getAllHistory));

/* GET history of one sensors */
router.get('/api/sensors/:id', asyncMiddleware(api.sensors.getOneHistory));

/* POST sensors update */
router.post('/api/sensors', asyncMiddleware(api.sensors.post));

/* GET all planes */
router.get('/api/planes', asyncMiddleware(api.planes.getAll));

/* GET seatbelt light info */
router.get('/api/planes/:id', asyncMiddleware(api.planes.getOne));

/* POST seatbelt light update */
router.post('/api/planes', asyncMiddleware(api.planes.post));

module.exports = router;
