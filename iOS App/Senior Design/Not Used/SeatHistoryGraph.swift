//
//  SeatHistory.swift
//  Senior Design
//
//  Created by Christina Holmes on 11/26/17.
//  Copyright © 2017 Senior Design. All rights reserved.
//

/**
 
 NOTE: We decided not to use this class for the following reasons:
 - We could not find a third party graph that would allow you to customize the y axis, namely put String values instead of numeric values. Our original idea was to have a line graph which displayed three cases:
        - In Proximity with seatbelt fastened
        - In Proximity with seatbelt not fastened
        - Not in proximity
 - We also decided that a graph view would become much too complex as more sensors were added as this would add more axes with different units. This would make the graph difficult to understand.
        - Ex. Proximity and Seatbelt fastened = String
        -     Air Quality - likely a percentage
        -     Heartrate - Numeric bpm
 
 Because of these things, we decided to go with a table/chart view, which can be viewed in SeatHistoryTable.swift
 
 However, we are leaving this class for the next class to see our design appraoch and understand our decisions, but have access to the class if they decide to use it themselves.
 
 **/


import Foundation
import UIKit
import STPopup
import ScrollableGraphView
import JASON
import Alamofire
import SVProgressHUD

class SeatHistoryPopup: STPopupController {
    override init() {
        super.init()
    }
    
    init(seatNumberIn: String, parentVCIn: UITableViewController) {
        let popupView = SeatHistory(seatNumberIn: seatNumberIn, parentVCIn: parentVCIn)
        super.init(rootViewController: popupView)
        STPopupNavigationBar.appearance().barTintColor =  UIColor(hexString: "#100B2D")
        STPopupNavigationBar.appearance().tintColor = UIColor.white
        STPopupNavigationBar.appearance().isTranslucent = false
        STPopupNavigationBar.appearance().barStyle = UIBarStyle.default
        self.transitionStyle = .slideVertical
    }
    
}

class SeatHistory: UIViewController, ScrollableGraphViewDataSource {//LineChartDelegate{//
    
    var seatNumber = ""
    let linePlotData = [1.0, 0.0, 0.0]
    var graphView = ScrollableGraphView()
    var sensorObjectsArray = [SensorObject]() //{

    var parentVC = UITableViewController()
    
    init(seatNumberIn: String, parentVCIn: UITableViewController) {
        seatNumber = seatNumberIn
        parentVC = parentVCIn
        super.init(nibName: nil, bundle: nil)
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    func downloadData() {
        let url = URL(string: "http://default-environment.zm5crxuaqb.us-east-1.elasticbeanstalk.com/API/getSeats")
        
        if url != nil {
            Alamofire.request(url!, method: HTTPMethod.get, parameters: nil).responseJSON { (response) in
                // Get the code of the response
                // Jist of what you need to know:
                //      200 = Good
                //      400 = Bad
                let code = response.response?.statusCode
                let error = response.error
                
                // If the API call was successful, parse through the JSON for each seat.
                if code == 200 {
                    print("Successful Download")
                    
                    let jsonValue = JSON(response.value).jsonDictionary ?? [:]
                    for (key, value) in jsonValue {
                        if key == self.seatNumber {
                            var fastenedBool = true
                            var inProximityBool = true
                            var timeStamp = Date()
                            var accelerometerNum = 0.0
                            let array = value.jsonArray ?? []
                            for dict in array {
                                for (key2, value2) in dict.jsonDictionary! {
                                    if key2 == "isBuckled" {
                                        fastenedBool = value2.boolValue
                                    }
                                    else if key2 == "inProximity" {
                                        inProximityBool = value2.boolValue
                                    } else if key2 == "Timestamp" {
                                        let epoch = value2.double ?? 0.0
                                        timeStamp = Date(timeIntervalSince1970: epoch)
                                    }
                                }
                                let object = SensorObject(fastened: fastenedBool, inProximity: inProximityBool, timeStamp: timeStamp, accelerometer: accelerometerNum)
                                self.sensorObjectsArray.append(object)
                            }
                            
                        }
                        
                    }
                    
                    // if the seat dictionary doesn't have any values after download has completed, show an error
                    if self.sensorObjectsArray.count == 0 {
                        self.presentDownloadError()
                        print("No seats were downloaded")
                    }
                    self.graphView.reload()
                }
                    // If the API call was not successful, show download error
                else {
                    print("Download unsuccessful with error code: \(String(describing: code))")
                    print(error)
                    self.presentDownloadError()
                }
            }
        }
    }
    
    // Show an alert controller telling user that the download failed.
    func presentDownloadError() {
        SVProgressHUD.dismiss()
        let alertController = UIAlertController(title: "Download Error", message: "Seat history did not download correctly. Please try again.", preferredStyle: .alert)
        let reload = UIAlertAction(title: "Reload", style: .default, handler: { (action) in
            self.downloadData()
        })
        let dismiss = UIAlertAction(title: "Dismiss", style: .cancel, handler: nil)
        alertController.addAction(reload)
        alertController.addAction(dismiss)
        self.parentVC.navigationController?.present(alertController, animated: true, completion: nil)
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.contentSizeInPopup = CGSize(width: 400, height: 200)
        downloadData()
        let frame = self.view.frame
        graphView = ScrollableGraphView(frame: frame, dataSource: self)
        

        let linePlot = LinePlot(identifier: "seatBeltFastened")
        linePlot.lineColor = UIColor(hexString: "2583C9")
        let linePlot2 = LinePlot(identifier: "inProximity")
        linePlot2.lineColor = UIColor(hexString: "100B2D")

        let referenceLines = ReferenceLines()
        referenceLines.positionType = .absolute
        referenceLines.absolutePositions = [0, 1]
        referenceLines.referenceLineColor = .white

        graphView.rangeMax = 1
        graphView.rangeMin = 0
        graphView.direction = .leftToRight
//        graphView.shouldAdaptRange = true
        graphView.dataPointSpacing = 80
        

        graphView.addPlot(plot: linePlot)
        graphView.addPlot(plot: linePlot2)
        graphView.addReferenceLines(referenceLines: referenceLines)

        view.addSubview(graphView)
        graphView.snp.makeConstraints { (make) in
            make.edges.equalToSuperview()
        }
        
    }
    
    func value(forPlot plot: Plot, atIndex pointIndex: Int) -> Double {
        // Return the data for each plot.
        switch(plot.identifier) {
        case "seatBeltFastened":
            if sensorObjectsArray.count != 0 {
                let object = sensorObjectsArray[pointIndex]
                let seatBeltFastened = object.fastened
                return seatBeltFastened ? 1 : 0
                //            return linePlotData[pointIndex]
            } else {
                return 0
            }
        case "inProximity":
            if sensorObjectsArray.count != 0 {
                let object = sensorObjectsArray[pointIndex]
                let inProximity = object.inProximity
                return inProximity ? 1 : 0
                //            return linePlotData[pointIndex]
            } else {
                return 0
            }
            
        default:
            return 0
        }
    }

    func label(atIndex pointIndex: Int) -> String {
        if sensorObjectsArray.count != 0 {
            let object = sensorObjectsArray[pointIndex]
            let timeStamp = object.timeStamp
            let dateFormatter = DateFormatter()
            dateFormatter.dateFormat = "HH:mm:ss a"
            var returnString = dateFormatter.string(from: timeStamp)
            returnString += "                "
            return returnString
            //        return "01:00"
        } else {
            return "x"
        }
       
    }

    func numberOfPoints() -> Int {
        return sensorObjectsArray.count
    }
}

