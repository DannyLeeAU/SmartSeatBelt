var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');

var MongoClient = mongodb.MongoClient;

var url = 'mongodb://seniorDesign:#SeniorDesign17@smartseatbeltsystem-shard-00-00-ns9nq.mongodb.net:27017,smartseatbeltsystem-shard-00-01-ns9nq.mongodb.net:27017,smartseatbeltsystem-shard-00-02-ns9nq.mongodb.net:27017/test?ssl=true&replicaSet=SmartSeatBeltSystem-shard-0&authSource=admin';

function populateSeatData() {

}
/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Smart Seat/Belt System API' });
});

/* Setup Seats */
router.get('/setupSeats', function(req, res, next) {
    MongoClient.connect(url, function(err, db){
       if(err){
           console.log('Unable to connect to db');
       } else{
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



           collection.insert(seats, function(err,result) {
               if(err){
                   console.log(err);
               }
               else{
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
        if(err){
            console.log('Unable to connect to db');
        } else {
            console.log('Connection established');

            var collection = db.collection('Seats');
            //.toArray
            collection.find({}).toArray(function (err, result) {
                if(err){
                    res.send(err);
                }else{
                    result = result[0];
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
        if(err){
            console.log('Unable to connect to db');
        } else {
            console.log('Connection established');

            var collection = db.collection('Seats');

            collection.find({}).toArray(function (err, result) {
                if(err){
                    res.send(err);
                }else{
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

                    //console.log(resultDictionary);
                    //console.log("RESULT: " + result);
                    for(var i = 0; i < seatNames.length; i++) {
                        name = seatNames[i];
                        historyArray = resultDictionary[name];
                        doesntmatter = historyArray[0];
                        mostRecentResult[name] = doesntmatter;
                        //console.log(mostRecentResult);
                        //console.log(doesntmatter);
                        //console.log("history: " + historyArray);
                        //console.log(resultDictionary[name]);
                        //mostRecentResult[name] = resultDictionary[name[0]];
                        //console.log("name" + name);
                        //console.log("value: " + result[name]);
                        //console.log("Fancy recent data string: " + mostRecentData)
                        //mostRecentResult[name] = mostRecentData[0];
                    }
                    //console.log(mostRecentResult);
                    //console.log("most recjkahdflkh: " + mostRecentResult);
                    //console.log("Fancy result is: " + result);
                    //console.log("Fancy most recent results: " + mostRecentResult);
                    res.send(mostRecentResult);
                }
                db.close();
            });
        }
    });
});

// router.get('/getRecentSeats', function(req, res, next) {
//     MongoClient.connect(url, function(err, db) {
//         if(err){
//             console.log('Unable to connect to db');
//         } else {
//             console.log('Connection established');
//
//             var collection = db.collection('Seats');
//             collection.find({}).toArray(function (err, result) {
//                 if(err){
//                     res.send(err);
//                 }else{
//                     //result = result[0];
//                     console.log(result);
//                     res.send(result);
//                 }
//                 db.close();
//             });
//         }
//     });
// });

module.exports = router;
