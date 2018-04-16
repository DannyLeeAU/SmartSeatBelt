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
    let socket = SocketManager(socketURL: BASEURL!).defaultSocket
    
    override init() {
        super.init()
        
        
        socket.on("sensor update") { data, ack in
            NotificationCenter.default
                .post(name: Notification.Name(rawValue: "sensorUpdateNotification"), object: data as? [String: AnyObject])
        }
        
        socket.on("sensor download") { data, ack in
            NotificationCenter.default
                .post(name: Notification.Name(rawValue: "sensorDownloadNotification"), object: data as? [[String: AnyObject]])
        }
    }
    
    func establishConnection() {
        socket.connect()
    }
    
    func closeConnection() {
        socket.disconnect()
    }
}
