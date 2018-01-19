//
//  SeatHistoryCell.swift
//  Senior Design
//
//  Created by Christina Holmes on 11/30/17.
//  Copyright © 2017 Senior Design. All rights reserved.
//

import Foundation
import UIKit

/**
 UITableViewCell that is the cell for each row on the seat history table.
 
12/1/17 - It currently depicts the time of the entry, if a person is in proximity of the seat, and if the seatbelt if fastened.
 
 NOTE: When the next group goes to add more sensors, they will need to add more labels and divide the width by the number of sensors they will be supporting (instead of 3).
 **/
class SeatHistoryCell: UITableViewCell {
    
    let timeLabel: UILabel = {
        $0.textAlignment = .center
        $0.numberOfLines = 0
        return $0
    }(UILabel())
    
    let fastenedLabel: UILabel = {
        $0.textAlignment = .center
        $0.numberOfLines = 1
        return $0
    }(UILabel())
    
    let proximityLabel: UILabel = {
        $0.textAlignment = .center
        $0.numberOfLines = 1
        $0.backgroundColor = UIColor(hexString: "DBEBF6")
        return $0
    }(UILabel())
    
    /** Each cell gets reused (why we use dequeue reusable cell in SeatHistoryTable).
     You must reset all values once they roll off screen so that the next cell
     that reuses it doesn't have remnents of the previous cell.
     **/
    override func prepareForReuse() {
        timeLabel.text = nil
        fastenedLabel.text = nil
        proximityLabel.text = nil
    }
    
    func setupCell() {
        addSubview(timeLabel)
        addSubview(fastenedLabel)
        addSubview(proximityLabel)
        
        timeLabel.snp.makeConstraints { (make) in
            make.top.bottom.equalToSuperview()
            make.left.equalToSuperview()
            make.width.equalToSuperview().dividedBy(3)
        }
        
        proximityLabel.snp.makeConstraints { (make) in
            make.top.bottom.equalToSuperview()
            make.left.equalTo(timeLabel.snp.right)
            make.width.equalToSuperview().dividedBy(3)
        }
        
        fastenedLabel.snp.makeConstraints { (make) in
            make.top.bottom.equalToSuperview()
             make.left.equalTo(proximityLabel.snp.right)
            make.width.equalToSuperview().dividedBy(3)
            make.right.equalToSuperview()

        }
        
        
    }
}
