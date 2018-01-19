//
//  SeatKeyCell.swift
//  Senior Design
//
//  Created by Christina Holmes on 11/29/17.
//  Copyright © 2017 Senior Design. All rights reserved.
//

import Foundation
import UIKit

class SeatKeyCell: UITableViewCell {
    
    /**
     Same as seat on main menu built in RowsSeatCell:
     - borderWidth is 0 so that there is no border
     - cornerRadious tells to what degree to round the corners of the button
     **/
    let seat: UIView = {
        $0.layer.borderWidth = 0
        $0.layer.cornerRadius = 8
        return $0
    }(UIView())
    
    /**
     Text label that describes what the seat color means
     - textAlignment is left but could be center or right
     - numberOfLines tells the text to go to 2 lines. Set to 0 and allow it to determine on its own
     - adjustsFontSizeToFitWidth tells the text to reduce the font size to make it fit in the space provided, if needed
     **/
    let label: UILabel = {
        $0.textAlignment = .left
        $0.numberOfLines = 2
        $0.adjustsFontSizeToFitWidth = true
        return $0
    }(UILabel())
    
    /** Each cell gets reused (why we use dequeue reusable cell in TableViewController).
     You must reset all values once they roll off screen so that the next cell
     that reuses it doesn't have remnents of the previous cell.
     **/
    override func prepareForReuse() {
        label.text = nil
    }
    
    // Sets up the layout of the cell
    func setupCell() {
        // Add views to superview
        addSubview(seat)
        addSubview(label)
        
        // Snap seat to the left of the cell, offseted from the top, bottom, and left edges.
        // Make it a square.
        seat.snp.makeConstraints { (make) in
            make.top.bottom.equalToSuperview().inset(5)
            make.left.equalToSuperview().offset(5)
            make.width.equalTo(seat.snp.height)
        }
        
        // Make the label take up the rest of the space to the right
        // Make top and bottom of the text label equal the top and bottom of the height
        // Snap the left side of the label to the right side of the seat with offset
        // Snap right side of label to right side of cell with offset
        label.snp.makeConstraints { (make) in
            make.top.bottom.equalTo(seat)
            make.left.equalTo(seat.snp.right).offset(5)
            make.right.equalToSuperview().inset(5)
        }
    }
}
