'''
sim.py

Author: Jarad Gray
Date: 6 December 2017

This is the simulator that generates buckled and proximity data for the Honeywell
Connected Aircraft Seat/Belt system.

Saves simulated data into a MongoDB database.

Require pymongo module. Install it with pip via:
python -m pip install pymongo
'''

import pymongo
import json
import random
import time


'''
"Constants" and Variables
'''

uri = 'mongodb://HoneywellSeniorDesign:%23SeniorDesign@smartseatbeltsystem-shard-00-00-opjbx.mongodb.net:27017,smartseatbeltsystem-shard-00-01-opjbx.mongodb.net:27017,smartseatbeltsystem-shard-00-02-opjbx.mongodb.net:27017/test?ssl=true&replicaSet=SmartSeatBeltSystem-shard-0&authSource=admin'

# "Constants"
MAX_UNBUCKLED = 15;
MIN_UNBUCKLED = 4;
MAX_EMPTY = 6;
MIN_EMPTY = 0;
PROB_UNBUCKLED = 10;   # 1 in 50 chance
PROB_BUCKLED = 2;     # 1 in 50 chance
PROB_UNOCCUPIED = 50;  # 1 in 50 chance
PROB_OCCUPIED = 10;    # 1 in 50 chance

# Variables
seats = []
seatData = {}
buckledData = []
proximityData = []
updatedSeatIndexes = []


'''
Function Definitions
'''

def initialize():    
    # populate seats list
    for i in range(1, 7):
        seats.append(str(i) + 'A')
        seats.append(str(i) + 'B')
        seats.append(str(i) + 'E')
        seats.append(str(i) + 'F')
    for i in range(7, 26):
        seats.append(str(i) + 'A')
        seats.append(str(i) + 'B')
        seats.append(str(i) + 'C')
        seats.append(str(i) + 'D')
        seats.append(str(i) + 'E')
        seats.append(str(i) + 'F')

    # initialize buckledData list
    for i in range(len(seats)):
        buckledData.append(True)

    # initialize proximityData list
    for i in range(len(seats)):
        proximityData.append(True)

    # populate seatData object with blank lists
    for i in range(len(seats)):
        seatData[seats[i]] = []


# Returns a random integer between min (inclusive) and max (inclusive)
def getSeatIndexes(num, start, end):
    indexes = []

    for i in range(num):
        index = random.randint(start, end)
        while index in indexes: # filter duplicates
            index = random.randint(start, end)
        indexes.append(index)

    return indexes


# Returns a list of size num containing integers between start (inclusive) and end (inclusive)
# The returned list is guaranteed to contain no elements that are already in the proximityData array
def getUnbuckledSeatIndexes(num, start, end):
    indexes = []

    for i in range(num):
        index = random.randint(start, end)
        while index in indexes: # filter duplicates
            index = random.randint(start, end)
        indexes.append(index)

    return indexes


# Generates a set of random proximity data. Used when the simulator is first started up.
# Alters proximityData[] and buckledData[]
def simulateProximityData():
    print 'simulateProximityData() called.'

    numEmpty = random.randint(MIN_EMPTY, MAX_EMPTY)
    print 'Number of empty seats: ' + str(numEmpty)
    
    emptySeatsIndexes = getSeatIndexes(numEmpty, 0, len(seats) - 1) # array containing indexes of seats to mark empty

    # mark each seat whose index is in emptySeatsIndexes[] as empty in proximityData[] and unbuckled in buckledData[]
    for i in range(len(emptySeatsIndexes)):
        proximityData[emptySeatsIndexes[i]] = False
        buckledData[emptySeatsIndexes[i]] = False


# Generates a set of random buckled data. Used when the simulator is first started up.
# Alters buckledData[]
def simulateBuckledData():
    print 'simulateBuckledData() called.'

    numUnbuckled = random.randint(MIN_UNBUCKLED, MAX_UNBUCKLED)
    print 'Number of unbuckled seats: ' + str(numUnbuckled)
    
    unbuckledSeatsIndexes = getUnbuckledSeatIndexes(numUnbuckled, 0, len(seats) - 1) # array containing indexes of seats to mark unbuckled

    # mark each seat whose index is in unbuckledSeatsIndexes[] as unbuckled in buckledData[]
    for i in range(len(unbuckledSeatsIndexes)):
        buckledData[unbuckledSeatsIndexes[i]] = False


# Updates proximityData[]. Used during the loop to simulate real-time data.
def updateProximityData():
    print 'updateProximityData() called.'

    for i in range(len(seats)):
        if proximityData[i] and not buckledData[i]: # if a seat is occupied and unbuckled
            # roll to mark unoccupied
            if random.randint(0, PROB_UNOCCUPIED) == 0:
                proximityData[i] = False
                buckledData[i] = False
                updatedSeatIndexes.append(i)
            else:
                # roll to mark buckled
                if random.randint(0, PROB_BUCKLED) == 0:
                    proximityData[i] = True
                    buckledData[i] = True
                    updatedSeatIndexes.append(i)
        elif not proximityData[i]: # if a seat is unoccupied
            # roll to mark occupied (& unbuckled)
            if random.randint(0, PROB_OCCUPIED) == 0:
                proximityData[i] = True
                buckledData[i] = False
                updatedSeatIndexes.append(i)


# Updates buckledData[]. Used during th eloop to simulate real-time data.
# Doesn't consider a seat that is unoccupied or has already been updated this turn
def updateBuckledData():
    print 'updateBuckledData() called.'

    for i in range(len(seats)):
        if i not in updatedSeatIndexes: # make sure this seat hasn't already been updated
            if buckledData[i] and proximityData[i]: # if a seat is buckled and occupied
                # roll to mark unbuckled (& occupied)
                if random.randint(0, PROB_UNBUCKLED) == 0:
                    buckledData[i] = False
                    proximityData[i] = True
                    updatedSeatIndexes.append(i)
            elif not buckledData[i] and proximityData[i]: # if a seat is unbuckled and occupied
                # roll to mark buckled (& occupied)
                if random.randint(0, PROB_BUCKLED) == 0:
                    buckledData[i] = True
                    proximityData[i] = True
                    updatedSeatIndexes.append(i)
            elif not buckledData[i] and not proximityData[i]: # if a seat is unbuckled and unoccupied
                # roll to mark occupied and unbuckled
                if random.randint(0, PROB_OCCUPIED) == 0:
                    buckledData[i] = False
                    proximityData[i] = True
                    updatedSeatIndexes.append(i)


# populates seatData dictionary with propwerties having seat name as key and a dictionary as value, for each seat in seats[]
def populateSeatData():
    print 'populateSeatData() called.'

    for i in range(len(seats)):
        toInsert = {'Timestamp': round(time.time(), 3),
                    'isBuckled': buckledData[i],
                    'inProximity': proximityData[i]}
        seat = seatData[seats[i]]
        seat.insert(0, toInsert)



'''
MAIN Function
'''

def main():
    # connect to mongodb
    try:
        client = pymongo.MongoClient(uri)
        print 'Connected Successfully!!!'
    except pymongo.errors.ConnectionFailure, e:
        print 'Could not connect to MongoDB: %s' % e

    db = client['test']
    collection = db['Seats']

    # START LOOP
    for i in range(1000):
        print 'Into the loop...'
        populateSeatData()
        
        collection.drop()
        collection.save(seatData)

        updatedSeatIndexes = []
        updateProximityData()
        updateBuckledData()

        '''
        # Stuff for debugging:
        print client.database_names()
        print db.collection_names(include_system_collections=False)
        print collection.find_one()
        '''
        time.sleep(7)

    # END LOOP

'''
FUNCTION CALLS
'''
startTime = time.time()
initialize()
main()
endTime = time.time()
print 'Execution took ' + str(endTime - startTime) + ' seconds.'
