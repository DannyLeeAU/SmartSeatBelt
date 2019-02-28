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

@objc class SocketIOManager : NSObject {
    static let sharedInstance = SocketIOManager()
    let manager = SocketManager(socketURL: BASEURL!)
    
    override init() {
        super.init()
        let socket = manager.defaultSocket
        
        socket.on("sensor update") { data, ack in
            NotificationCenter.default
                .post(name: Notification.Name(rawValue: "sensorUpdateNotification"), object: data[0] as? [String: Any])
        }
        
        socket.on("sensor download") { data, ack in
            NotificationCenter.default
                .post(name: Notification.Name(rawValue: "sensorDownloadNotification"), object: data[0] as? [[String: Any]])
        }
        
        socket.on("seatbeltlight update") { data, ack in
            NotificationCenter.default
                .post(name: Notification.Name(rawValue: "seatBeltLightUpdateNotification"), object: data[0] as? Bool)
        }
    }
    
    func establishConnection() {
        manager.connect()
    }
    
    func closeConnection() {
        manager.disconnect()
    }
}
