"use strict";

const Database = require('./database');
const config = require('../../config');


const database = new Database(config.database.uri);

module.exports = database;
