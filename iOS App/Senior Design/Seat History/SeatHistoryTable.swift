//
//  SeatHistoryTable.swift
//  Senior Design
//
//  Created by Christina Holmes on 11/30/17.
//  Copyright © 2017 Senior Design. All rights reserved.
//

import Foundation
import UIKit
import Alamofire
import JASON
import SVProgressHUD

// Used to identify which cell is which when registering
fileprivate let reuseIdentifier = "seatHistoryCell"

/**
 This class is used to show the history of a specific seat.
 
 12/1/17 - Each cell currently depicts the time of the entry, if a person is in proximity of the seat, and if the seatbelt if fastened.
 **/
class SeatHistoryTable: UITableViewController {
    // The seat number of which we will show the history of. This will be used as the nav title to informt the user.
    var seatNumber = ""
    
    // The array of sensorObjects for the specific seat.
    // Once the download is complete and the dictionary is populated, the table will reload with all information and dismiss the loading sign.
    var sensorObjectsArray = [SensorObject]() {
        didSet {
            tableView.reloadData()
        }
    }
    
    //Initializes the seat number to the seat the user requested
    init(seatNumberIn: String) {
        seatNumber = seatNumberIn
        super.init(nibName: nil, bundle: nil)
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // set the nav bar title to the seat number
        self.navigationItem.title = "Seat \(seatNumber) History"
        
        // download the data
        downloadData()
        
        // register the custom cell
        tableView.register(SeatHistoryCell.self, forCellReuseIdentifier: reuseIdentifier)
        
        // create the header view of the table
        createHeaderView()
    }
    
    // Creates the header view of the table which contains the titles of each column
    func createHeaderView() {
        // create the view starting at x = 0, y = 0, with width = width of screen, and height = 60
        let headerView = UIView(frame: CGRect(x: 0, y: 0, width: self.view.frame.width, height: 60))
        
        let timeLabel:UILabel = {
            $0.text = "Time"
            $0.textAlignment = .center
            $0.font = UIFont(name: "SanFranciscoDisplay-Bold", size: 11)
            $0.numberOfLines = 0
            return $0
        }(UILabel())
        
        let separator1 = UIView()
        separator1.backgroundColor = .black
        
        let fastenedLabel:UILabel = {
            $0.text = "Seatbelt Fastened"
            $0.textAlignment = .center
            $0.numberOfLines = 0
            $0.font = UIFont(name: "SanFranciscoDisplay-Bold", size: 11)
            return $0
        }(UILabel())
        
        let separator2 = UIView()
        separator2.backgroundColor = .black
        
        let proximityLabel:UILabel = {
            $0.text = "In Proximity"
            $0.backgroundColor = UIColor(hexString: "DBEBF6")
            $0.textAlignment = .center
            $0.numberOfLines = 0
            $0.font = UIFont(name: "SanFranciscoDisplay-Bold", size: 11)
            return $0
        }(UILabel())
        
        let accelerometerLabel:UILabel = {
            $0.text = "Accelero -meter"
            $0.backgroundColor = UIColor(hexString: "DBEBF6")
            $0.textAlignment = .center
            $0.numberOfLines = 0
            $0.font = UIFont(name: "SanFranciscoDisplay-Bold", size: 11)
            return $0
        }(UILabel())
        
        headerView.addSubview(timeLabel)
        headerView.addSubview(fastenedLabel)
        headerView.addSubview(separator2)
        headerView.addSubview(proximityLabel)
        headerView.addSubview(accelerometerLabel)
        
        timeLabel.snp.makeConstraints { (make) in
            make.left.equalToSuperview()
            make.top.equalToSuperview()
            make.width.lessThanOrEqualToSuperview().dividedBy(4)
        }
        
        proximityLabel.snp.makeConstraints { (make) in
            make.left.equalTo(timeLabel.snp.right)
            make.top.equalToSuperview()
            make.width.lessThanOrEqualToSuperview().dividedBy(4)
            make.bottom.equalTo(timeLabel)
        }
        
        fastenedLabel.snp.makeConstraints { (make) in
            make.left.equalTo(proximityLabel.snp.right)
            make.top.equalToSuperview()
            make.bottom.equalTo(timeLabel)
            make.width.lessThanOrEqualToSuperview().dividedBy(4)
        }
        
        accelerometerLabel.snp.makeConstraints { (make) in
            make.left.equalTo(fastenedLabel.snp.right)
            make.top.equalToSuperview()
            make.right.equalToSuperview()
            make.bottom.equalTo(timeLabel)
            make.width.lessThanOrEqualToSuperview().dividedBy(4)
        }
        
        separator2.snp.makeConstraints { (make) in
            make.left.right.bottom.equalToSuperview()
            make.top.equalTo(fastenedLabel.snp.bottom)
            make.height.equalTo(2)
        }
        
        tableView.tableHeaderView = headerView
    }
    
    // Download all data for seats from MongoDB using AWS elastic beanstalk
    func downloadData() {
        // create a url object from the given string
        let url = URL(string: "api/sensors/" + seatNumber, relativeTo: BASEURL)
        
        // if creating the url passed
        if url != nil {
            // make the API call as a GET request
            Alamofire.request(url!, method: HTTPMethod.get, parameters: nil).responseJSON { (response) in
                // Get the code of the response
                let code = response.response?.statusCode
                
                // If the API call was successful, parse through the JSON for each seat.
                if code == 200 {
                    print("Successful Download")
                    
                    let jsonArray = JSON(response.value).jsonArray ?? []
                    //var size = jsonArray.
                   // jsonArray = jsonArray.reversed()
                    
                    //default values for sensor object
                    var object = SensorObject(fastened: false, inProximity: false, timeStamp: Date(), accelerometer: 0.0)
                    
                    // for each key, value in that dictionary
                    for document in jsonArray {
            
                        switch document["sensor"].stringValue {
                        case "buckled":
                            object.fastened = document["value"].boolValue
                            object.accelerometer = 0.0
                        case "proximity":
                            object.inProximity = document["value"].boolValue
                            object.accelerometer = 0.0
                        case "accelerometer":
                            object.accelerometer = document["value"].double ?? 0.0
                        default:
                            break
                        }
                        let epoch = document["time"].double ?? 0.0
                        object.timeStamp = Date(timeIntervalSince1970: epoch)
                        
                        self.sensorObjectsArray.append(object)
                    }
                    
                    //reverse the array to display the latest time first
                    self.sensorObjectsArray = self.sensorObjectsArray.reversed()
                    
                    // if the seat dictionary doesn't have any values after download has completed, show an error
                    if self.sensorObjectsArray.count == 0 {
                        self.presentDownloadError()
                        print("No seats were downloaded")
                    }
                }
                    // If the API call was not successful, show download error
                else {
                    print("Download unsuccessful with error code: \(String(describing: code))")
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
        self.navigationController?.present(alertController, animated: true, completion: nil)
    }
    
    // only one section for this table
    override func numberOfSections(in tableView: UITableView) -> Int {
        return 1
    }
    
    // after the data has downloaded, the table should only be as long as the number of different entries
    override func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return sensorObjectsArray.count
    }
    
    // iPhones: we want each row to have a height of 60 pixels
    // iPads: we want each row to have a height of 120 pixels
    override func tableView(_ tableView: UITableView, heightForRowAt indexPath: IndexPath) -> CGFloat {
        if UIDevice.current.model.contains("Pad") {
            return 120
        } else {
            return 60
        }
    }
    
    override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        // Dequeue a reusable cell as the custom cell we created so that it knows what format to take
        let cell = tableView.dequeueReusableCell(withIdentifier: reuseIdentifier, for: indexPath) as! SeatHistoryCell
        
        // get the object at this index
        let object = sensorObjectsArray[indexPath.row]
        
        // get all of the values for the object at this index
        let seatBeltFastened = object.fastened
        let proximity = object.inProximity
        let timestamp = object.timeStamp
        let accelerometer = object.accelerometer
        
        // reformat the date into a way the user can understand
        let dateFormatter = DateFormatter()
        //dateFormatter.dateFormat = "MM-dd-yyyy\nhh:mm:ss a"
        dateFormatter.dateFormat = "hh:mm:ss a"
        let formattedTime = dateFormatter.string(from: timestamp)
        
        // set the value of the time label
        cell.timeLabel.text = formattedTime
        
        // if the seat belt is fastened, put a checkmark. If not, leave empty.
        if seatBeltFastened {
            cell.fastenedLabel.text = "✔️"
        }
        
        // if in proximity, put a checkmark. If not, leave empty.
        if proximity {
            cell.proximityLabel.text = "✔️"
        }
        
        // set value of accelerometer data if found. If not, leave empty.
        cell.accelerometerLabel.text = String(format:"%.1f", accelerometer)
        
        // don't allow the user to select the rows
        cell.selectionStyle = .none
        
        // call the cell's method to setup
        cell.setupCell()
        
        return cell
    }
}
