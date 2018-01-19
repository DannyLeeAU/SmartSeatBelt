const express = require('express');
const router = express.Router();
const mongodb = require('mongodb');


const MongoClient = mongodb.MongoClient;

const url = 'mongodb://seniorDesign:#SeniorDesign17@smartseatbeltsystem-shard-00-00-ns9nq.mongodb.net:27017,smartseatbeltsystem-shard-00-01-ns9nq.mongodb.net:27017,smartseatbeltsystem-shard-00-02-ns9nq.mongodb.net:27017/test?ssl=true&replicaSet=SmartSeatBeltSystem-shard-0&authSource=admin';
//const url = 'mongodb://HoneywellSeniorDesign:<#SeniorDesign17>@smartseatbeltsystem-shard-00-00-opjbx.mongodb.net:27017,smartseatbeltsystem-shard-00-01-opjbx.mongodb.net:27017,smartseatbeltsystem-shard-00-02-opjbx.mongodb.net:27017/test?ssl=true&replicaSet=SmartSeatBeltSystem-shard-0&authSource=admin';

//constants
const MAX_UNBUCKLED = 15;
const MIN_UNBUCKLED = 4;
const MAX_EMPTY = 6;
const MIN_EMPTY = 0;
const PROB_UNBUCKLED = 50;   //1 in 50 chance
const PROB_BUCKLED = 50;     //1 in 50 chance
const PROB_UNOCCUPIED = 50;  //1 in 50 chance
const PROB_OCCUPIED = 50;    //1 in 50 chance

//variables
var seats = [];
var seatData = {};
var buckledData = [];
var proximityData = [];
var updatedSeatIndexes = [];  //array to store updated seats each turn (used to ensure
                              //seats are not altered by both updateProximityData()
                              //and updateBuckledData() in the same turn)

//populates seats[], initializes buckledData[] and proximityData[].
function initialize(db) {
  //populate seats array
  for (var i = 1; i < 7; i++) {
    seats.push(i + "A");
    seats.push(i + "B");
    seats.push(i + "E");
    seats.push(i + "F");
  }
  for (var i = 7; i < 26; i++) {
    seats.push(i + "A");
    seats.push(i + "B");
    seats.push(i + "C");
    seats.push(i + "D");
    seats.push(i + "E");
    seats.push(i + "F");
  }

  //initialize buckledData array
  for (var i = 0; i < seats.length; i++) {
    buckledData[i] = true;
  }

  //initialize proximityData array
  for (var i = 0; i < seats.length; i++) {
    proximityData[i] = true;
  }

  //populate data arrays with a base of random data
  simulateProximityData();
  simulateBuckledData();

  //populate seatData object with blank arrays
  for (var i = 0; i < seats.length; i++) {
    seatData[seats[i]] = [];
  }

  //insert into database
    var collection = db.collection('Seats');
    collection.insert(seatData, function(err,result) {
      if(err){
        console.log(err);
      }
      console.log(result);
      id = result['insertedIds'];
      //console.log("DOCUMENT ID: " + id);
    });
    //return callback(err);
}



//Returns a random integer between min (inclusive) and max (inclusive)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


//Returns an array of size num containing integers between start (inclusive) and end (inclusive)
function getSeatIndexes(num, start, end) {
    var indexes = [];

    for (var i = 0; i < num; i++) {
      var index = getRandomInt(start, end);
      while (indexes.indexOf(index) > -1) { //filter duplicates
        index = getRandomInt(start, end);
      }//end while
      indexes.push(index);
    }//end for

    console.log("Length of empty seats array: " + indexes.length);

    return indexes;
}//end getSeatIndexes()


//Returns an array of size num containing integers between start (inclusive) and end (inclusive)
//The returned array is guaranteed to contain no elements that are already in the proximityData[] array.
function getUnbuckledSeatIndexes(num, start, end) {
  var indexes = []

  for (var i = 0; i < num; i++) {
    var index = getRandomInt(start, end);
    while (indexes.indexOf(index) > -1 || proximityData[index] == false) {  //filter duplicates and unoccupied seats
      index = getRandomInt(start, end);
    }//end while
    indexes.push(index);
  }//end for

  console.log("Length of unbuckled seats array: " + indexes.length);

  return indexes;
}//end getUnbuckledSeatIndexes()


//generates a set of random proximity data, used when the simulator is first started up.
//alters proximityData[] and buckledData[]
function simulateProximityData() {
  console.log("simulateProximityData() called.");

  var numEmpty = getRandomInt(MIN_EMPTY, MAX_EMPTY);
  console.log("Number of empty seats: " + numEmpty);

  var emptySeatsIndexes = getSeatIndexes(numEmpty, 0, seats.length - 1);  //array containing indexes of seats to mark empty

  //mark each seat whose index is in emptySeatsIndexes[] as empty in proximityData[] and unbuckled in buckledData[]
  for (var i = 0; i < emptySeatsIndexes.length; i++) {
    proximityData[emptySeatsIndexes[i]] = false;
    buckledData[emptySeatsIndexes[i]] = false;
  }//end for

}//end simulateProximityData()


//generates a set of random buckled data, used when the simulator is first started up.
//alters buckledData[]
function simulateBuckledData() {
  console.log("simulateBuckledData() called.");

  var numUnbuckled = getRandomInt(MIN_UNBUCKLED, MAX_UNBUCKLED);
  console.log("Number of unbuckled seats: " + numUnbuckled);

  var unbuckledSeatsIndexes = getUnbuckledSeatIndexes(numUnbuckled, 0, seats.length - 1);  //array containing indexes of seats to mark unbuckled

  //mark each seat whose index is in unbuckledSeatsIndexes[] as unbuckled in buckledData[]
  for (var i = 0; i < unbuckledSeatsIndexes.length; i++) {
    buckledData[unbuckledSeatsIndexes[i]] = false;
  }//end for
}//end simulateBuckledData()


//updates proximityData[], used during the loop to simulate real-time data.
function updateProximityData() {
  console.log("updateProximityData() called.");

  for (var i = 0; i < seats.length; i++) {
    if (proximityData[i] && !buckledData[i]) {  //if a seat is occupied and unbuckled
      //roll to mark unoccupied
      if (Math.floor(Math.random() * PROB_UNOCCUPIED) == 0) {
        proximityData[i] = false;
        buckledData[i] = false;
        updatedSeatIndexes.push(i);
      }//end if
    }//end if
    else if (!proximityData[i]) { //if a seat is unoccupied (& unbuckled)
      //roll to mark occupied (& unbuckled)
      if (Math.floor(Math.random() * PROB_OCCUPIED) == 0) {
        proximityData[i] = true;
        buckledData[i] = false;
        updatedSeatIndexes.push(i);
      }//end if
    }//end else
  }//end for
}//end updateProximityData()


//updates buckledData[], used during the loop to simulate real-time data.
//doesn't consider a seat that is unoccupied or has already been updated this turn
function updateBuckledData() {
  console.log("updateBuckledData() called.");

  for (var i = 0; i < seats.length; i++) {
    if (updatedSeatIndexes.indexOf(i) == -1) {  //make sure this seat hasn't already been updated
      if (buckledData[i] && proximityData[i]) { //if a seat is buckled and occupied
        //roll to mark unbuckled (& occupied)
        if (Math.floor(Math.random() * PROB_UNBUCKLED) ==0) {
          buckledData[i] = false;
          proximityData[i] = true;
          updatedSeatIndexes.push(i);
        }//end if
      }//end if
      else if (!buckledData[i] && proximityData[i]) { //if a seat is unbuckled and occupied
        //roll to mark buckled (& occupied)
        if (Math.floor(Math.random() * PROB_BUCKLED) == 0) {
          buckledData[i] = true;
          proximityData[i] = true;
          updatedSeatIndexes.push(i);
        }
      }//end else
    }//end if
  }//end for

}//end updateBuckledData()


//populates seatData object with properties having seat name as key and a json object as value, for each seat in seats[]
function populateSeatData() {

  console.log("populateSeatData() called.");

  //add id field to seatData
  //seatData['_id'] = id;

  for (var i = 0; i < seats.length; i++) {
    seatData[seats[i]].unshift({
      "Timestamp": new Date().getTime() / 1000,
      "isBuckled": buckledData[i],
      "inProximity": proximityData[i]
    })
  }

  //print seatData to see if it's the right structure
  console.log(seatData);  
}


function clearDatabase(db) {
    db.dropDatabase();
    console.log('Database cleared.');
}


/* Setup Seats */
function loop(db) {
    console.log('loop() called.');


    populateSeatData();
    //var data = JSON.stringify(seatData); //postToMyjson stringifies seatData and puts it to MyJSON, so we just need to stringify seatData and insert into database

    //seatData that is inserted into database:
    console.log("seatData that is inserted into database:");
    console.log(seatData);

    // update into database
    var collection = db.collection('Seats');
    collection.remove({});
    collection.insert(seatData, function(err,result) {
      if(err){
        console.log("Error: collection not updated.");
        console.log(err);
      }
      //res.redirect('getSeats')
    });

    updatedSeatIndexes = [];
    updateProximityData();
    updateBuckledData();

    //setTimeout(loop, 5000);
}


//Function calls:
MongoClient.connect(url, function(err, db) {

  var startTime = new Date().getTime() / 1000;
  clearDatabase(db);
  initialize(db);
  for (var i = 0; i < 10; i++) {
    var timerStart = new Date().getTime() / 1000;
    var timerCurrent = timerStart;
    loop(db);
    while (timerCurrent - timerStart < 3) {
      timerCurrent = new Date().getTime() / 1000;
      console.log(timerCurrent - timerStart);
    }
  }
  //printDb();
  db.close();

});

function printDb(db) {
  var collection = db.collection('Seats');
  console.log("THE COLLECTION:\n" + collection.find());
}



//console.log("DONE");