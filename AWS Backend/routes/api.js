var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');

var MongoClient = mongodb.MongoClient;

var url = process.env.MONGODB_URI;

function populateSeatData() {

}
/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Smart Seat/Belt System API' });
});

/* Setup Seats */
router.get('/setupSeats', function(req, res, next) {
    MongoClient.connect(url, function(err, db){
       if(err) {
           console.log('Unable to connect to db');
       } else {
           console.log('Connected to database');

           var collection = db.collection('Seats');

          collection.remove({});

           var seats = {};
           var proximity = [];
           var buckled = [];
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

           for (var i = 0; i < seatNames.length; i++) {
               proximity.push(!!Math.floor(Math.random() * 2));
               buckled.push(!!Math.floor(Math.random() * 2));
           }

           for (var i = 0; i < seatNames.length; i++) {
                seats[seatNames[i]] = {
                    "buckled": buckled[i],
                    "proximity": proximity[i],
                    "Timestamp": new Date().getTime() / 1000
                }
           }

           console.log(seatNames);

           collection.insert(seats, function(err, result) {
               if(err) {
                   console.log(err);
               } else {
                   res.redirect('getSeats')
               }
               db.close();
           });
       }
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

            collection.find({}).toArray(function (err, result) {
                if(err) {
                    res.send(err);
                } else {
                    console.log(result);
                    res.send(result);
                }
                db.close();
            });
        }
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
                    result = JSON.stringify(result[0]);
                    resultDictionary = JSON.parse(result);

                    for(var i = 0; i < seatNames.length; i++) {
                        name = seatNames[i];
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
