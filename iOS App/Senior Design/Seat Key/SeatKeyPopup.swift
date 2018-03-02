//
//  SeatKeyPopup.swift
//  Senior Design
//
//  Created by Christina Holmes on 10/24/17.
//  Copyright © 2017 Senior Design. All rights reserved.
//

import Foundation
import UIKit
import STPopup // For making the view a popup

// Used to identify which cell is which when registering
fileprivate let reuseIdentifier = "seatKeyCell"

// The popup version of the SeatKeyViewController
class SeatKeyPopup: STPopupController {
    override init() {
        super.init()
    }
    
    init(string: String) {
        let popupView = SeatKeyViewController()
        super.init(rootViewController: popupView)
        STPopupNavigationBar.appearance().barTintColor =  UIColor(hexString: "#100B2D")
        STPopupNavigationBar.appearance().tintColor = UIColor.white
        STPopupNavigationBar.appearance().isTranslucent = false
        STPopupNavigationBar.appearance().barStyle = UIBarStyle.default
        self.transitionStyle = .slideVertical
    }
        
}
/**
 This class is the seat key which depicts what each color seat could mean.
 It is a UITableViewController, so it deals with:
 - how many sections are in the table
 - how many rows are in each section
 - how the cell at each row is set up
 - what happens which you select the cell
 **/
class SeatKeyViewController: UITableViewController {
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // This determines what size the popup will be if this view needs to be manipulated to a popup (which it does for STPopup)
        self.contentSizeInPopup = CGSize(width: 300, height: 200)
        // Register the custom cells for this table view. If this gets taken out, you will receive the following error:
        // "unable to dequeue a cell with identifier seatKeyCell - must register a nib or a class for the identifier or connect a prototype cell in a storyboard"
        tableView.register(SeatKeyCell.self, forCellReuseIdentifier: reuseIdentifier)
        // Set the separator color between each row to white so it can't be seen
        tableView.separatorColor = .white
        // Set the navigation title
        self.navigationItem.title = "Seat Key"
    }
    
    // We only need one section for this
    override func numberOfSections(in tableView: UITableView) -> Int {
        return 1
    }
    
    /**
     We currently only need three rows as we only have three different situations:
     - No one is in proximity of the seat.
     - Someone is in proxmity of the seat AND they are buckled
     - Someone is in their seat but not buckled
     **/
    override func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return 3
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
    
    // Controls each cell in the table
    override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        // Dequeue a reusable cell as the custom cell we created so that it knows what format to take
        let cell = tableView.dequeueReusableCell(withIdentifier: reuseIdentifier, for: indexPath) as! SeatKeyCell
        // Set up the layout for the cell
        cell.setupCell()
        // Don't allow the cell to be selectable
        cell.selectionStyle = .none
        
        // Set all the color options of seats
        let goodColor = UIColor(hexString: "#2583C9")
        let badColor = UIColor(hexString: "#b40909")
        let emptyColor = UIColor(hexString: "b4adad")
        
        // Add content to the cell based on the row
        
        // First cell depicts "Passenger in proximity with seatbelt fastened"
        if indexPath.row == 0 {
            cell.seat.backgroundColor = goodColor
            cell.label.text = "Passenger in proximity with seatbelt fastened"
        }
        // Second cell depicts "Passenger in proximity with seatbelt not fastened"
        else if indexPath.row == 1 {
            cell.seat.backgroundColor = badColor
            cell.label.text = "Passenger in proximity with seatbelt not fastened"
        }
        // Third cell depicts "Passenger not in proximity"
        else {
            cell.seat.backgroundColor = emptyColor
            cell.label.text = "Passenger not in proximity"
        }
        
        return cell
    }
}


