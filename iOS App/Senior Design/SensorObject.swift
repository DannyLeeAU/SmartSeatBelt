//
//  SensorObject.swift
//  Senior Design
//
//  Created by Christina Holmes on 8/31/17.
//  Copyright © 2017 Senior Design. All rights reserved.
//

import Foundation

/**
 Controls all information regarding a seat.

12/1/17 - only contains:
    - fastened: whether the seat belt for that seat is fastened
    - inProximity: whether or not someone is in proximity of the seat
 
 Future versions could contain more sensors such as air quality, heart rate, etc. as specified by Honeywell.
 **/
struct SensorObject {
    let fastened: Bool
    let inProximity: Bool
    let timeStamp: Date
    let accelerometer: Double
}
