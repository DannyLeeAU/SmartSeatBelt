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

module.exports = { populateSeatData, createSeat, createSensorArray };
