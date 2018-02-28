"""sim.py - Generates buckled and proximity data for Smart Seat/Belt system.

Authors: Jarad Gray, Daniel Thompson
Date: 27 February 2018

Generates buckled and proximity data for the Honeywell Connected Aircraft
Seat/Belt system. Saves simulated data into a MongoDB database.

Requires pymongo module. Install it with pip via:
    `python -m pip install pymongo`
"""

import pymongo
import json
import random
import time


'''
"Constants" and Variables
'''

uri = 'mongodb://HoneywellSeniorDesign:%23SeniorDesign17@' \
      'smartseatbeltsystem-shard-00-00-opjbx.mongodb.net:27017,' \
      'smartseatbeltsystem-shard-00-01-opjbx.mongodb.net:27017,' \
      'smartseatbeltsystem-shard-00-02-opjbx.mongodb.net:27017' \
      '/test?ssl=true&replicaSet=SmartSeatBeltSystem-shard-0&authSource=admin'

# "Constants"
MAX_UNBUCKLED = 15
MIN_UNBUCKLED = 4
MAX_EMPTY = 6
MIN_EMPTY = 0
PROB_UNBUCKLED = 10  # 1 in 50 chance
PROB_BUCKLED = 2  # 1 in 50 chance
PROB_UNOCCUPIED = 50  # 1 in 50 chance
PROB_OCCUPIED = 10  # 1 in 50 chance

# Variables
seats = []
seat_data = {}
buckled_data = []
proximity_data = []
updated_seat_indexes = []


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

    # initialize buckled_data list
    for i in range(len(seats)):
        buckled_data.append(True)

    # initialize proximity_data list
    for i in range(len(seats)):
        proximity_data.append(True)

    # populate seat_data object with blank lists
    for i in range(len(seats)):
        seat_data[seats[i]] = []


def get_seat_indexes(num, start, end):
    """Returns a random integer between min (inclusive) and max (inclusive)."""
    indexes = []

    for i in range(num):
        index = random.randint(start, end)
        while index in indexes:  # filter duplicates
            index = random.randint(start, end)
        indexes.append(index)

    return indexes


def get_unbuckled_seat_indexes(num, start, end):
    """Returns a list of `num` integers between `start` and `end`.

    The inputted range (start, end) is inclusive. The returned list is
    guaranteed to contain no elements that are already in proximity_data[].
    """
    indexes = []

    for i in range(num):
        index = random.randint(start, end)
        while index in indexes:  # filter duplicates
            index = random.randint(start, end)
        indexes.append(index)

    return indexes


def simulate_proximity_data():
    """Generates a set of random proximity data.

    Alters proximity_data[] and buckled_data[].
    """
    print 'simulate_proximity_data() called.'

    num_empty = random.randint(MIN_EMPTY, MAX_EMPTY)
    print 'Number of empty seats: ' + str(num_empty)

    # array containing indexes of seats to mark empty
    empty_seats_indexes = get_seat_indexes(num_empty, 0, len(seats) - 1)

    # mark each seat's index in empty_seats_indexes[] as empty in proximity_data[] and unbuckled in buckled_data[]
    for i in range(len(empty_seats_indexes)):
        proximity_data[empty_seats_indexes[i]] = False
        buckled_data[empty_seats_indexes[i]] = False


def simulate_buckled_data():
    """Generates a set of random buckled data into buckled_data[]."""
    print 'simulate_buckled_data() called.'

    num_unbuckled = random.randint(MIN_UNBUCKLED, MAX_UNBUCKLED)
    print 'Number of unbuckled seats: ' + str(num_unbuckled)

    # array containing indexes of seats to mark unbuckled
    unbuckled_seats_indexes = get_unbuckled_seat_indexes(num_unbuckled, 0, len(seats) - 1)

    # mark each seat whose index is in unbuckled_seats_indexes[] as unbuckled in buckled_data[]
    for i in range(len(unbuckled_seats_indexes)):
        buckled_data[unbuckled_seats_indexes[i]] = False


def update_proximity_data():
    """Updates proximity_data[]. Used during the loop to simulate real-time data."""
    print 'update_proximity_data() called.'

    for i in range(len(seats)):
        if proximity_data[i] and not buckled_data[i]:  # occupied and unbuckled
            if random.randint(0, PROB_UNOCCUPIED) == 0:
                proximity_data[i] = False
                buckled_data[i] = False
                updated_seat_indexes.append(i)
            else:
                if random.randint(0, PROB_BUCKLED) == 0:
                    proximity_data[i] = True
                    buckled_data[i] = True
                    updated_seat_indexes.append(i)
        elif not proximity_data[i]:  # unoccupied
            if random.randint(0, PROB_OCCUPIED) == 0:
                proximity_data[i] = True
                buckled_data[i] = False
                updated_seat_indexes.append(i)


def update_buckled_data():
    """Updates buckled_data[].

    Used during the loop to simulate real-time data. Doesn't consider a seat
    that is unoccupied or has already been updated this turn.
    """
    print 'update_buckled_data() called.'

    for i in range(len(seats)):
        if i not in updated_seat_indexes:  # not already updated
            if buckled_data[i] and proximity_data[i]:  # buckled and occupied
                if random.randint(0, PROB_UNBUCKLED) == 0:
                    buckled_data[i] = False
                    proximity_data[i] = True
                    updated_seat_indexes.append(i)
            elif not buckled_data[i] and proximity_data[i]:  # unbuckled and occupied
                if random.randint(0, PROB_BUCKLED) == 0:
                    buckled_data[i] = True
                    proximity_data[i] = True
                    updated_seat_indexes.append(i)
            elif not buckled_data[i] and not proximity_data[i]:  # unbuckled and unoccupied
                if random.randint(0, PROB_OCCUPIED) == 0:
                    buckled_data[i] = False
                    proximity_data[i] = True
                    updated_seat_indexes.append(i)


def populate_seat_data():
    """Populates seat_data dictionary for each seat in seats[]."""
    print 'populate_seat_data() called.'

    for i in range(len(seats)):
        to_insert = {'Timestamp': round(time.time(), 3),
                     'isBuckled': buckled_data[i],
                     'inProximity': proximity_data[i]}
        seat = seat_data[seats[i]]
        seat.insert(0, to_insert)


'''
MAIN Function
'''


def main():
    try:
        client = pymongo.MongoClient(uri)
        print 'Connected Successfully!!!'
    except pymongo.errors.ConnectionFailure, e:
        print 'Could not connect to MongoDB: ', e

    db = client['test']
    collection = db['Seats']

    for i in range(1000):
        populate_seat_data()

        collection.drop()
        collection.save(seat_data)

        updated_seat_indexes = []
        update_proximity_data()
        update_buckled_data()

        '''
        # Stuff for debugging:
        print client.database_names()
        print db.collection_names(include_system_collections=False)
        print collection.find_one()
        '''
        time.sleep(7)


'''
FUNCTION CALLS
'''


if __name__ == "__main__":
    startTime = time.time()
    initialize()
    main()
    endTime = time.time()
    print 'Execution took ' + str(endTime - startTime) + ' seconds.'
