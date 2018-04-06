//
//  SocketIOManager.swift
//  Senior Design
//
//  Created by Daniel Thompson on 4/5/18.
//  Copyright © 2018 Senior Design. All rights reserved.
//
//  Modified from example code on:
//  https://www.twilio.com/blog/2016/09/getting-started-with-socket-io-in-swift-on-ios.html
//

import Foundation
import SocketIO

class SocketIOManager {
    static let sharedInstance = SocketIOManager()
    var socket = SocketIOClient(socketURL: BASEURL)
    
    override init() {
        super.init()
        
        socket.on("sensor update") { data in
            NotificationCenter.default
                .post(name: Notification.Name(rawValue: "callSensorUpdate"), object: data as? [String: AnyObject])
        }
    }
    
    func establishConnection() {
        socket.connect()
    }
    
    func closeConnection() {
        socket.disconnect()
    }
}
