//
//  Constants.swift
//  Senior Design
//
//  Created by Daniel Thompson on 4/6/18.
//  Copyright © 2018 Senior Design. All rights reserved.
//

import Foundation

#if DEBUG
let BASEURL = URL(string: "http://localhost:3000/")
#else
let BASEURL = URL(string: "http://smartseatbeltsystem-env-1.ceppptmr2f.us-west-2.elasticbeanstalk.com/")
#endif
