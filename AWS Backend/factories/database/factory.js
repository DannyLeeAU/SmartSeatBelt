"use strict";
const Database = require('../../models/database/database');
const config = require('../../config/index');


/*
 * Factory for the Database model.
 * Allows easier generation of databases with consistent configurations.
 */
function getDatabase() {
        return new Database(config.database.uri);
}

module.exports = { getDatabase };
