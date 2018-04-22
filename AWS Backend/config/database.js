"use strict";

const joi = require('joi');


const envSchema = joi.object({
    MONGODB_URI: joi.string()
        .required()
}).unknown()
    .required();

const {error, value: env} = joi.validate(process.env, envSchema);
if (error) {
    throw new Error(`Configuration error: ${error.message}`);
}

const config = {
    database: {
        uri: env.MONGODB_URI
    }
};

module.exports = config;
