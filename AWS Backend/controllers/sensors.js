const DB = require('../db.js');

const url = process.env.MONGODB_URI;
const dbName = 'SmartSeatBeltSystem';


exports.getOneSensor = async (req, res, next) => {
    let database = new DB;
    try {
        await database.connect(url, dbName);
        let result = await database.getCollection('Sensors')
            .find({'_id': req.params._id})
            .toArray();
        res.send(result);
    } catch (err) {
        res.send(err);
    } finally {
        await database.close();
    }
};

exports.getAllSensors = async (req, res, next) => {
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
};