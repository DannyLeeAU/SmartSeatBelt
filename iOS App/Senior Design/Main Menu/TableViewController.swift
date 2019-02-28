//
//  TableViewController.swift
//  Senior Design
//
//  Created by Christina Holmes on 8/29/17.
//  Copyright © 2017 Senior Design. All rights reserved.
//

import UIKit
import SVProgressHUD // For loading popup
import JASON // For parsing JSON
import ChameleonFramework // For colors
import Alamofire // For API call

// Used to identify which cell is which when registering
fileprivate let reuseIdentifier = "seatCell"

/**
 This class is used to control the table on the main menu.
 It handles setting up the nav bar, downloading the data, and setting up everything to do with the table, including:
    - how many sections are in the table
    - how many rows are in each section
    - how the cell at each row is set up (uses RowsSeatKey)
    - what happens which you select the cell
 **/
class TableViewController: UITableViewController {
    
    /** Swift dictionary of all seats.
     - Each key is the seat row/number.
     - Each value is a SensorObject for that seat, which contains all information about that seat. Look at SensorObject.swift for more information.
     Example:   {
                    "1a":{
                        "fastened":true,
                        "inProximity":false,
                        "timeStamp":10932345345
                    },
                    "1b": {
                        "fastened":false,
                        "inProximity":false,
                        "timeStamp":10932345345
                    }
                }
     - Once the download is complete and the dictionary is populated, the table will reload with all information and dismiss the loading sign.
     **/
    let alert = UIAlertController()
    
    var seatDict = [String:SensorObject]() {
        didSet {
            SVProgressHUD.dismiss()
            tableView.reloadData()
        }
    }
    
    var seatUnbuckledList = [String](){
        didSet {
            unbuckledWarningAlert()
        }
    }
    
    var fastenSeatBeltSign = Bool() {
        didSet {
            if fastenSeatBeltSign {
                seatbeltLightOn()
            }
            else {
                seatbeltLightOff()
            }
        }
    }

    // Turns on the plane indicator of fasten seat belt sign.
    fileprivate func seatbeltLightOn() {
        let fastenSeatBeltSignView = UIView(frame: CGRect(x: 0, y: 0, width: self.view.frame.width, height: 45))
        let label: UILabel = {
            $0.text = "Fasten Seat Belt Sign is On"
            $0.textAlignment = .center
            $0.textColor = .white
            return $0
        }(UILabel())
        
        fastenSeatBeltSignView.addSubview(label)
        label.snp.makeConstraints { (make) in
            make.left.right.equalToSuperview().inset(5)
            make.top.bottom.equalToSuperview()
        }
        fastenSeatBeltSignView.backgroundColor = UIColor(hexString: "B73636")
        self.tableView.tableHeaderView = fastenSeatBeltSignView
        
        //Checks to see if the seatBeltLight turns off or everyone buckles their seats before showing warning
        //Change timeInterval to change the amount of time it waits
        _ = Timer.scheduledTimer(timeInterval: 5, target: self, selector: #selector(unbuckledWarningAlert), userInfo: nil, repeats: false)
    }
    
    // Turns off the plane indicator of fasten seat belt sign.
    fileprivate func seatbeltLightOff() {
        let fastenSeatBeltSignView = UIView(frame: CGRect(x: 0, y: 0, width: self.view.frame.width, height: 45))
        let label: UILabel = {
            $0.text = "Fasten Seat Belt Sign is Off"
            $0.textAlignment = .center
            $0.textColor = .white
            return $0
        }(UILabel())
        
        fastenSeatBeltSignView.addSubview(label)
        label.snp.makeConstraints { (make) in
            make.left.right.equalToSuperview().inset(5)
            make.top.bottom.equalToSuperview()
        }
        fastenSeatBeltSignView.backgroundColor = UIColor(hexString: "D3D3D3")
        self.tableView.tableHeaderView = fastenSeatBeltSignView
        
        self.alert.dismiss(animated: true, completion: nil)
    }

    // Once the view has loaded on the screen.
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Subscribe to socket notifications and assign handler
        NotificationCenter.default.addObserver(self, selector: #selector(TableViewController.handleSensorUpdateNotification(_:)),
                                               name: NSNotification.Name(rawValue: "sensorUpdateNotification"), object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(TableViewController.handleSensorDownloadNotification(_:)),
                                               name: NSNotification.Name(rawValue: "sensorDownloadNotification"), object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(TableViewController.handleSeatBeltLightUpdateNotification(_:)),
                                               name: NSNotification.Name(rawValue: "seatBeltLightUpdateNotification"), object: nil)

        // Set the top left and right buttons with their title/image and selector
        self.navigationItem.rightBarButtonItem = UIBarButtonItem(image: UIImage(named: "options"), style: .plain, target: self, action: #selector(openTheme))
        self.navigationItem.leftBarButtonItem = UIBarButtonItem(title: "See Seat Key", style: .plain, target: self, action: #selector(showSeatKey))
        
        // Since the view has just loaded and download will not be complete yet, show loading sign
        SVProgressHUD.show(withStatus: "Loading...")
        
        // Register the custom cells for this table view. If this gets taken out, you will receive the following error:
        // "unable to dequeue a cell with identifier seatCell - must register a nib or a class for the identifier or connect a prototype cell in a storyboard"
        self.tableView.register(RowsSeatCell.self, forCellReuseIdentifier: reuseIdentifier)
        
        // Check what is currently stored in user defaults for theme and set the background accordingly.
        // NOTE: Theme is initially defaulted in AppDelegate.swift on initial launch.
        if UserDefaults.standard.string(forKey: "theme") == "Light" {
            tableView.backgroundColor = .white
            tableView.separatorColor = .white
        } else if UserDefaults.standard.string(forKey: "theme") == "Dark" {
            tableView.backgroundColor = UIColor(hexString: "#100B2D")
            tableView.separatorColor = UIColor(hexString: "#100B2D")
        }
        
        // Set the background and text of the navigation bar
        self.navigationController?.view.backgroundColor = UIColor.white
        self.navigationItem.title = "Smart Seat/Belt"
        
        //sets the unbuckled warning message
        alert.title = "Unbuckled Warning"
        alert.message = "Seatbelt sign is on and passengers are unbuckled. \nPlease check the seating chart."
        alert.addAction(UIAlertAction(title: "Dismiss", style: UIAlertActionStyle.cancel, handler : {
            (alertAction: UIAlertAction!) in
            self.alert.dismiss(animated: true, completion: nil)
        }))
    }

    // Dispose of any resources that can be recreated.
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }

    //Shows the Unbuckled Warning Alert if conditions are true. Otherwise it dismisses the alert.
    @objc func unbuckledWarningAlert() {
        if (fastenSeatBeltSign && !seatUnbuckledList.isEmpty) {
            self.present(alert, animated: true)
        }
        else {
            self.alert.dismiss(animated: true, completion: nil)
        }
    }
    
    // Show an alert controller telling user that the download failed.
    func presentDownloadError() {
        SVProgressHUD.dismiss()
        let alertController = UIAlertController(title: "Download Error", message: "Seat information did not download correctly. Please try again.", preferredStyle: .alert)
        let reload = UIAlertAction(title: "Reload", style: .default, handler: { (action) in
        })
        let dismiss = UIAlertAction(title: "Dismiss", style: .cancel, handler: nil)
        alertController.addAction(reload)
        alertController.addAction(dismiss)
        self.navigationController?.present(alertController, animated: true, completion: nil)
    }

    // Two sections:
    //      0: "First class" section - only has 4 seats/row
    //      1: 6 seats/row
    override func numberOfSections(in tableView: UITableView) -> Int {
        return 2
    }
    
    // If section 0, there are only 6 rows.
    // If section 1, there are 19 rows.
    // NOTE: We set this to have 25 rows for demo purposes. This can be changed later with more test data added.
    override func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        if section == 0 {
            return 6
        } else {
            return 19
        }
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
    
    // Controls each cell (row) of seats
    override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        // Dequeue a reusable cell as the custom cell we created so that it knows what format to take
        let cell = tableView.dequeueReusableCell(withIdentifier: reuseIdentifier, for: indexPath) as! RowsSeatCell
        
        // Seat colors used in different scenarios
        let goodColor = UIColor(hexString: "#2583C9")
        let badColor = UIColor(hexString: "#b40909")
        let emptyColor = UIColor(hexString: "b4adad")
        
        // Default the row number to black. If the theme is dark, change that to light gray so that it can be seen.
        var rowNumberColor = UIColor.black
        if UserDefaults.standard.string(forKey: "theme") == "Dark" {
            rowNumberColor = UIColor.lightGray
        }
        cell.rowNumber.textColor = rowNumberColor
        
        // Get the row number
        var rowTag = 0
        if indexPath.section == 0 {
            rowTag = indexPath.row + 1
        } else if indexPath.section == 1 {
            rowTag = indexPath.row + 7
        }
        
        // Set the row number
        cell.rowNumber.text = "\(rowTag)"
        
        // Tag each button (seat) in the row.
        // This is used later in showDetail as the way to indicate which row the seat is on. Selector methods on buttons cannot have parameters in swift other than passing in the button itself, so you have to add all information possible to the button itself.
        cell.buttonA.tag = rowTag
        cell.buttonB.tag = rowTag
        cell.buttonC.tag = rowTag
        cell.buttonD.tag = rowTag
        cell.buttonE.tag = rowTag
        cell.buttonF.tag = rowTag
        
        // Determine whether each seat is buckled.
        // First pull the value for the key of the seat (1A, 1B, etc). This value will be a SensorObject.
        // Look at the fastened property of the seat's SensorObject.
        // If something is wrong and you can't get that information, default to false.
        let isBuckledA = seatDict["\(rowTag)A"]?.fastened ?? false
        let isBuckledB = seatDict["\(rowTag)B"]?.fastened ?? false
        let isBuckledC = seatDict["\(rowTag)C"]?.fastened ?? false
        let isBuckledD = seatDict["\(rowTag)D"]?.fastened ?? false
        let isBuckledE = seatDict["\(rowTag)E"]?.fastened ?? false
        let isBuckledF = seatDict["\(rowTag)F"]?.fastened ?? false
        

        // Determine whether a person is in proximity of each seat.
        // First pull the value for the key of the seat (1A, 1B, etc). This value will be a SensorObject.
        // Look at the inProximity property of the seat's SensorObject.
        // If something is wrong and you can't get that information, default to false.
        let inProximityA = seatDict["\(rowTag)A"]?.inProximity ?? false
        let inProximityB = seatDict["\(rowTag)B"]?.inProximity ?? false
        let inProximityC = seatDict["\(rowTag)C"]?.inProximity ?? false
        let inProximityD = seatDict["\(rowTag)D"]?.inProximity ?? false
        let inProximityE = seatDict["\(rowTag)E"]?.inProximity ?? false
        let inProximityF = seatDict["\(rowTag)F"]?.inProximity ?? false

        
        // If this is in section 0, only set up 4 seats/row.
        if indexPath.section == 0 {
            cell.setupFourSeats()
        }
            // If this is in section 1, seat up 6 seats/row.
        else {
            cell.setupSixSeats()
        }
        
        /** Set the colors for each seat.
                Empty (gray): If no one is in proximity of the seat.
                Good (light blue): If someone is in proxmity of the seat AND they are buckled
                Bad (red): If someone is in their seat but not buckled
         
            FUTURE WORK:
                Choose a color for when that seat was not purchased for this flight.
                Restructure all colors for any other sensors that are added, as this will entail more variety of situations.
        **/
        if !inProximityA {
            cell.buttonA.backgroundColor = emptyColor
        }
        else if isBuckledA {
            cell.buttonA.backgroundColor = goodColor
        } else {
            cell.buttonA.backgroundColor = badColor
        }
        
        if !inProximityB {
            cell.buttonB.backgroundColor = emptyColor
        }
        else if isBuckledB {
            cell.buttonB.backgroundColor = goodColor

        } else {
            cell.buttonB.backgroundColor = badColor
        }
        
        if !inProximityC {
            cell.buttonC.backgroundColor = emptyColor
        }
        else if isBuckledC {
            cell.buttonC.backgroundColor = goodColor
        } else {
            cell.buttonC.backgroundColor = badColor
        }
        
        if !inProximityD {
            cell.buttonD.backgroundColor = emptyColor
        }
        else if isBuckledD {
            cell.buttonD.backgroundColor = goodColor
        } else {
            cell.buttonD.backgroundColor = badColor
        }
        
        if !inProximityE {
            cell.buttonE.backgroundColor = emptyColor
        }
        else if isBuckledE {
            cell.buttonE.backgroundColor = goodColor
        } else {
            cell.buttonE.backgroundColor = badColor
        }
        
        if !inProximityF {
            cell.buttonF.backgroundColor = emptyColor
        }
        else if isBuckledF {
            cell.buttonF.backgroundColor = goodColor
        } else {
            cell.buttonF.backgroundColor = badColor
        }
        
        // Add the target to each button in the row
        cell.buttonA.addTarget(self, action: #selector(showDetail(button:)), for: .touchUpInside)
        cell.buttonB.addTarget(self, action: #selector(showDetail(button:)), for: .touchUpInside)
        cell.buttonC.addTarget(self, action: #selector(showDetail(button:)), for: .touchUpInside)
        cell.buttonD.addTarget(self, action: #selector(showDetail(button:)), for: .touchUpInside)
        cell.buttonE.addTarget(self, action: #selector(showDetail(button:)), for: .touchUpInside)
        cell.buttonF.addTarget(self, action: #selector(showDetail(button:)), for: .touchUpInside)
        
        // Set the background color of the cell to clear so that the background can be determined by the theming and only changed in one place.
        cell.backgroundColor = .clear
        // Don't allow the user to select the entire cell, as they should only be able to click on the seats on the cell.
        cell.selectionStyle = .none
        
        return cell
    }
    
    /**
        Show the detail popup for each seat, which includes current seat info and option to see history
        Input is a UIButton. This is one of the seats from a row.
    **/
    @objc func showDetail(button: UIButton) {
        // Get the row number that we added to the button's tag in cellForRow
        let rowNumber = button.tag
        // Get the seat letter, which is the title of the button
        let seatLetter = button.currentTitle ?? ""
        // Use those to identify which seat
        let identifier = "Seat \(rowNumber)\(seatLetter) Stats"

        // Get the SensorObject at the seat
        let object = seatDict["\(rowNumber)\(seatLetter)"]
        // Get all properties of that seat
        let proximity = object?.inProximity ?? false
        let fastened = object?.fastened ?? false
        
        // Construct the message to tell the user
        var message = ""
        // If no one is in proximity
        if proximity == false {
            message = "Passenger not in proximity"
        } else {
            // If someone is in proximity with seat belt not fastened
            if fastened == false {
                message = "Passenger seat belt not fastened"
            }
            // If someone is in proximity with seat belt fastened
            else {
                message = "Passenger in proximity with seat belt fastened"
            }
        }
        
        // Popup info on that seat.
        let alertController = UIAlertController(title: identifier, message: message, preferredStyle: .alert)
        let showHistory = UIAlertAction(title: "Show Seat History", style: .default) { (action) in
            let table = SeatHistoryTable(seatNumberIn:  "\(rowNumber)\(seatLetter)")
            self.navigationController?.pushViewController(table, animated: true)
        }
        let dismiss = UIAlertAction(title: "Dismiss", style: .cancel, handler: nil)
        alertController.addAction(showHistory)
        alertController.addAction(dismiss)
        self.navigationController?.present(alertController, animated: true, completion: nil)
    }
    
    // Allows the user to select a theme
    @objc func openTheme() {
        let alertController = UIAlertController(title: "Light/Dark Theme", message: "Choose a light or dark theme.", preferredStyle: .alert)
        let light = UIAlertAction(title: "Light", style: .default) { (action) in
            /**
            If the user chooses light:
             - set this in UserDefaults
             - update background of table to white
             - update separator color between cells to be white so they can't be seen
             - reload table's data to force change
            **/
            UserDefaults.standard.set("Light", forKey: "theme")
            self.tableView.backgroundColor = .white
            self.tableView.separatorColor = .white
            self.tableView.reloadData()
        }
        let dark = UIAlertAction(title: "Dark", style: .default) { (action) in
            /**
             If the user chooses light:
             - set this in UserDefaults
             - update background of table to dark color
             - update separator color between cells to be dark color so they can't be seen
             - reload table's data to force change
             **/
            UserDefaults.standard.set("Dark", forKey: "theme")
            self.tableView.backgroundColor = UIColor(hexString: "#100B2D")
            self.tableView.separatorColor = UIColor(hexString: "#100B2D")
            self.tableView.reloadData()
        }
        alertController.addAction(light)
        alertController.addAction(dark)
        self.navigationController?.present(alertController, animated: true, completion: nil)
    }
    
    // Show the seat key popup
    @objc func showSeatKey() {
        let seatKey = SeatKeyPopup(string: "")
        seatKey.present(in: self)
    }

    //Updates a sensor of a seat in real-time
    @objc func handleSensorUpdateNotification(_ notification: Notification) {
        let data = notification.object as! [String: AnyObject]
        let seatID = data["seat"] as! String
        let sensor = data["sensor"] as! String

        var sensorObject = self.seatDict[seatID]!

        if (sensor == "buckled") {
           let value = data["value"] as! Bool
            sensorObject.fastened = value
        }
        else if (sensor == "proximity") {
            let value = data["value"] as! Bool
            sensorObject.inProximity = value
        }
        else if (sensor == "accelerometer") {
            let value = data["value"] as! Double
            sensorObject.accelerometer = value
        }
        
        if (sensorObject.inProximity && !sensorObject.fastened && !self.seatUnbuckledList.contains(seatID)) {
            self.seatUnbuckledList.append(seatID)
        }
        else if self.seatUnbuckledList.contains(seatID){
                self.seatUnbuckledList.remove(at: self.seatUnbuckledList.index(of: seatID)!)
        }
        
        self.seatDict.updateValue(sensorObject, forKey: seatID)
    }

    //Downloads all the seat information in real-time
    @objc func handleSensorDownloadNotification(_ notification: Notification) {
        let data = notification.object as? [[String: Any]]
        for seat in data! {
            let seatID = seat["_id"] as! String
            let object = SensorObject(
                fastened: seat["buckled"] as! Bool,
                inProximity: seat["proximity"] as! Bool,
                timeStamp: Date(),
                accelerometer: 0.0
            )

            if (object.inProximity && !object.fastened && !self.seatUnbuckledList.contains(seatID)) {
                self.seatUnbuckledList.append(seatID)
            }
            else if self.seatUnbuckledList.contains(seatID){
                    self.seatUnbuckledList.remove(at: self.seatUnbuckledList.index(of: seatID)!)
            }

            self.seatDict.updateValue(object, forKey: seatID)
        }
    }
    
    //Updates the seatbelt light data from the database in real-time
    @objc func handleSeatBeltLightUpdateNotification(_ notification: Notification) {
        let data = notification.object as? Bool ?? false
        fastenSeatBeltSign = data
    }
}

struct AppStylizer {
    /**
     Sets all default colors of app-wide features.
     Also makes call to set up coloration of UINavigationController.
     */
    static func setupAppStyle() {
        UIApplication.shared.statusBarStyle = .lightContent
        SVProgressHUD.setDefaultStyle(.custom)
        SVProgressHUD.setBackgroundColor(UIColor.init(white: 0.0, alpha: 0.6))
        SVProgressHUD.setForegroundColor(UIColor.white)
        
        UIApplication.shared.statusBarStyle = .lightContent
        
        let window = UIWindow(frame: UIScreen.main.bounds)
        window.backgroundColor = UIColor.white
        UINavigationBar.appearance().barTintColor = UIColor(hexString: "#100B2D")
        UINavigationBar.appearance().tintColor = UIColor.white
        UINavigationBar.appearance().titleTextAttributes = [
            NSAttributedStringKey.foregroundColor: UIColor.white
        ]
        
        UINavigationBar.appearance().isTranslucent = false
        
        UIToolbar.appearance().barTintColor = UIColor(hexString: "#100B2D")
        UIToolbar.appearance().tintColor = UIColor.white
        UIToolbar.appearance().isTranslucent = false
        
        UISearchBar.appearance().barTintColor = UIColor(hexString: "#100B2D")
        UISearchBar.appearance().tintColor = UIColor.white
    }
}

