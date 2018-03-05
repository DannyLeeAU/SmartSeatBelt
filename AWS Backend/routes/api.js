var router = require('express').Router();
var MongoClient = require('mongodb').MongoClient;

var url = process.env.MONGODB_URI;

function populateSeatData() {
    MongoClient.connect(url, function(err, db){
        if(err) {
            console.log('Unable to connect to db');
        } else {
            console.log('Connected to database');

            var seat_collection = db.collection('Seats');
            var sensor_collection = db.collection('Sensors');

            seat_collection.remove({});
            sensor_collection.remove({});

            var seats = [];
            var sensors = [];
            var proximity = [];
            var buckled = [];
            var seatNames = [];
            var timestamp = new Date().getTime() / 1000;

            for (var i = 1; i < 7; i++) {
                seatNames.push(i + "A");
                seatNames.push(i + "B");
                seatNames.push(i + "E");
                seatNames.push(i + "F");
            }

            for (var i = 7; i < 26; i++) {
                seatNames.push(i + "A");
                seatNames.push(i + "B");
                seatNames.push(i + "C");
                seatNames.push(i + "D");
                seatNames.push(i + "E");
                seatNames.push(i + "F");
            }

            for (var i = 0; i < seatNames.length; i++) {
                proximity.push(!!Math.floor(Math.random() * 2));
                if(proximity[i]) {
                    buckled.push(!!Math.floor(Math.random() * 2));
                } else {
                    buckled.push(false);
                }
            }

            for (var i = 0; i < seatNames.length; i++) {
                seats.push(createSeat(seatNames[i], buckled[i], proximity[i]));
                sensors.push(createSensorArray(seatNames[i], timestamp, buckled[i], proximity[i]));
            }

            console.log(seatNames);

            seat_collection.insertMany(seats, function(err, result) {
                if(err) {
                    console.log(err);
                }
            });

            sensor_collection.insertMany(sensors, function(err, result) {
                if(err) {
                    console.log(err);
                }
            });
        }
    });
}

function createSeat(position, buckled, proximity) {
    return {
        "_id": position,
        "buckled": buckled,
        "proximity": proximity
    };
}

function createSensorArray(position, timestamp, buckled, proximity) {
    return {
        "_id": position,
        "buckled": [
            {
                "time": timestamp,
                "value": buckled
            }
        ],
        "proximity": [
            {
                "time": timestamp,
                "value": proximity
            }
        ]
    };
}

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Smart Seat/Belt System API' });
});

/* Setup Seats */
router.get('/setupSeats', function(req, res, next) {
    populateSeatData();
});

/* Get a single seat */
router.get('/getSeat/:_id', function(req, res, next) {
   MongoClient.connect(url, function(err, db) {
       if(err) {
           console.log('Unable to connect to db');
       } else {
           console.log('Connection established');

           var collection = db.collection('Seats');

           collection.find({"_id": req.params._id}).toArray(function(err, result) {
               if(err) {
                   res.send(err);
               } else {
                   console.log(result);
                   res.send(result);
               }
           })
       }
       db.close();
    });
});


/* Get Seats*/
router.get('/getSeats', function(req, res, next) {
    MongoClient.connect(url, function(err, db){
        if(err) {
            console.log('Unable to connect to db');
        } else {
            console.log('Connection established');

            var collection = db.collection('Seats');

            collection.find({}).toArray(function(err, result) {
                if(err) {
                    res.send(err);
                } else {
                    console.log(result);
                    res.send(result);
                }
            });
        }
        db.close();
    });
});

router.get('/getRecentSeats', function(req, res, next) {
    MongoClient.connect(url, function(err, db) {
        if(err) {
            console.log('Unable to connect to db');
        } else {
            console.log('Connection established');

            var collection = db.collection('Seats');

            collection.find({}).toArray(function (err, result) {
                if(err) {
                    res.send(err);
                } else {
                    var seatNames = [];

                    for (var i = 1; i < 7; i++) {
                        seatNames.push(i + "A");
                        seatNames.push(i + "B");
                        seatNames.push(i + "E");
                        seatNames.push(i + "F");
                    }

                    for (var i = 7; i < 26; i++) {
                        seatNames.push(i + "A");
                        seatNames.push(i + "B");
                        seatNames.push(i + "C");
                        seatNames.push(i + "D");
                        seatNames.push(i + "E");
                        seatNames.push(i + "F");
                    }

                    mostRecentResult = {};
                    result = JSON.stringify(result);
                    resultDictionary = JSON.parse(result);

                    for(var i = 0; i < seatNames.length; i++) {
                        var name = seatNames[i];
                        historyArray = resultDictionary[name];
                        doesntmatter = historyArray[0];
                        mostRecentResult[name] = doesntmatter;
                    }
                    res.send(mostRecentResult);
                }
                db.close();
            });
        }
    });
});

module.exports = router;
