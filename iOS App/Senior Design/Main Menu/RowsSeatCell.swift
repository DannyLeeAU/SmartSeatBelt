//
//  RowsSeatCell.swift
//  Senior Design
//
//  Created by Christina Holmes on 8/31/17.
//  Copyright © 2017 Senior Design. All rights reserved.
//

import Foundation
import UIKit
import SnapKit

/**
 UITableViewCell that is the cell for each row on the main menu.
 It depicts all of the seats on that row.
 **/
class RowsSeatCell: UITableViewCell {
    
    /**
     Each button is a different seat with these properties:
     - borderWidth is 0 so that there is no border
     - cornerRadious tells to what degree to round the corners of the button
     **/
    
    let buttonA: UIButton = {
        $0.layer.borderWidth = 0
        $0.layer.cornerRadius = 8
        return $0
    }(UIButton())
    
    let buttonB: UIButton = {
        $0.layer.borderWidth = 0
        $0.layer.cornerRadius = 8
        return $0
    }(UIButton())
    
    let buttonC: UIButton = {
        $0.layer.borderWidth = 0
        $0.layer.cornerRadius = 10
        return $0
    }(UIButton())
    
    let buttonD: UIButton = {
        $0.layer.borderWidth = 0
        $0.layer.cornerRadius = 10
        return $0
    }(UIButton())
    
    let buttonE: UIButton = {
        $0.layer.borderWidth = 0
        $0.layer.cornerRadius = 10
        return $0
    }(UIButton())
    
    let buttonF: UIButton = {
        $0.layer.borderWidth = 0
        $0.layer.cornerRadius = 10
        return $0
    }(UIButton())
    
    // Row number depicts the row number for that cell. It is center aligned in the cell.
    let rowNumber: UILabel = {
        $0.textAlignment = .center
        return $0
    }(UILabel())
    
    /** Each cell gets reused (why we use dequeue reusable cell in TableViewController).
        You must reset all values once they roll off screen so that the next cell
        that reuses it doesn't have remnents of the previous cell.
    **/
    override func prepareForReuse() {
        // Remove all buttons from the superview. This is necessary because we have two different layouts based on section,
        // one with only 4 seats showing per row and one with all 6 seats showing per row.
        buttonA.removeFromSuperview()
        buttonB.removeFromSuperview()
        buttonC.removeFromSuperview()
        buttonD.removeFromSuperview()
        buttonE.removeFromSuperview()
        buttonF.removeFromSuperview()
        
        // Reset the tag on each button to ensure it is correctly overwritten in cellForRow of TableViewController.
        buttonA.tag = Int()
        buttonB.tag = Int()
        buttonC.tag = Int()
        buttonD.tag = Int()
        buttonE.tag = Int()
        buttonF.tag = Int()
    }
    
    // For section 0
    func setupFourSeats() {
        // Add 4 buttons and the row number to the superview
        self.addSubview(buttonA)
        self.addSubview(buttonB)
        self.addSubview(rowNumber)
        self.addSubview(buttonE)
        self.addSubview(buttonF)
        
        // Set the title and title color for each button here, as it does not get overwritten.
        buttonA.setTitle("A", for: .normal)
        buttonA.setTitleColor(.black, for: .normal)
        buttonB.setTitle("B", for: .normal)
        buttonB.setTitleColor(.black, for: .normal)
        buttonE.setTitle("E", for: .normal)
        buttonE.setTitleColor(.black, for: .normal)
        buttonF.setTitle("F", for: .normal)
        buttonF.setTitleColor(.black, for: .normal)
        
        // Snap seat a to the left of the cell, offseted from the top, bottom, and left edges.
        // Make it a square.
        buttonA.snp.makeConstraints { (make) in
            make.top.bottom.equalToSuperview().inset(5)
            make.left.greaterThanOrEqualToSuperview().offset(5)
            make.width.equalTo(buttonA.snp.height)
        }
        
        // Snap seat b's left side to the right of the seat a with offset
        // Offset from the top and bottom edges.
        // Make it a square, with width equal to seat a's width.
        buttonB.snp.makeConstraints { (make) in
            make.left.equalTo(buttonA.snp.right).offset(5)
            make.top.bottom.equalToSuperview().inset(5)
            make.width.equalTo(buttonA)
        }
        
        // Snap row number to the middle of the cell.
        // Snap row number's left side to the right of the seat b with offset
        // Offset from the top and bottom edges.
        // Set the width to 25.
        rowNumber.snp.makeConstraints { (make) in
            make.centerX.centerY.equalToSuperview()
            make.left.equalTo(buttonB.snp.right).offset(5)
            make.width.equalTo(25)
        }
        
        // Snap seat e's left side to the right of row number with offset
        // Offset from the top and bottom edges.
        // Make it a square, with width equal to seat a's width.
        buttonE.snp.makeConstraints { (make) in
            make.top.bottom.equalToSuperview().inset(5)
            make.width.equalTo(buttonA)
            make.left.equalTo(rowNumber.snp.right).offset(5)
        }
        
        // Snap seat f's left side to the right of the seat e with offset
        // Offset from the top and bottom edges.
        // Snap seat f's right side to the right side of the cell, but allow it to be farther off the edge if needed
        // Make it a square, with width equal to seat a's width.
        buttonF.snp.makeConstraints { (make) in
            make.left.equalTo(buttonE.snp.right).offset(5)
            make.top.bottom.equalToSuperview().inset(5)
            make.right.lessThanOrEqualToSuperview().inset(5)
            make.width.equalTo(buttonA)
        }
    }
    
    // For section 1
    func setupSixSeats() {
        // Add 6 buttons and the row number to the superview
        self.addSubview(buttonA)
        self.addSubview(buttonB)
        self.addSubview(buttonC)
        self.addSubview(rowNumber)
        self.addSubview(buttonD)
        self.addSubview(buttonE)
        self.addSubview(buttonF)
        
        // Set the title and title color for each button here, as it does not get overwritten.
        buttonA.setTitle("A", for: .normal)
        buttonA.setTitleColor(.black, for: .normal)
        buttonB.setTitle("B", for: .normal)
        buttonB.setTitleColor(.black, for: .normal)
        buttonC.setTitle("C", for: .normal)
        buttonC.setTitleColor(.black, for: .normal)
        buttonD.setTitle("D", for: .normal)
        buttonD.setTitleColor(.black, for: .normal)
        buttonE.setTitle("E", for: .normal)
        buttonE.setTitleColor(.black, for: .normal)
        buttonF.setTitle("F", for: .normal)
        buttonF.setTitleColor(.black, for: .normal)

        // Snap seat a to the left of the cell, offseted from the top, bottom, and left edges.
        // Make it a square.
        buttonA.snp.makeConstraints { (make) in
            make.top.bottom.equalToSuperview().inset(5)
            make.left.greaterThanOrEqualToSuperview().offset(5)
            make.width.equalTo(buttonA.snp.height)
        }
        
        // Snap seat b's left side to the right of the seat a with offset
        // Offset from the top and bottom edges.
        // Make it a square, with width equal to seat a's width.
        buttonB.snp.makeConstraints { (make) in
            make.left.equalTo(buttonA.snp.right).offset(5)
            make.top.bottom.equalToSuperview().inset(5)
            make.width.equalTo(buttonA)
        }
        
        // Snap seat c's left side to the right of the seat b with offset
        // Offset from the top and bottom edges.
        // Make it a square, with width equal to seat a's width.
        buttonC.snp.makeConstraints { (make) in
            make.left.equalTo(buttonB.snp.right).offset(5)
            make.top.bottom.equalToSuperview().inset(5)
            make.width.equalTo(buttonB)
        }
        
        // Snap row number to the middle of the cell.
        // Snap row number's left side to the right of the seat c with offset
        // Offset from the top and bottom edges.
        // Set the width to 25.
        rowNumber.snp.makeConstraints { (make) in
            make.centerX.centerY.equalToSuperview()
            make.left.equalTo(buttonC.snp.right).offset(5)
            make.width.equalTo(25)
        }
        
        // Snap seat d's left side to the right of row number with offset
        // Offset from the top and bottom edges.
        // Make it a square, with width equal to seat a's width.
        buttonD.snp.makeConstraints { (make) in
            make.top.bottom.equalToSuperview().inset(5)
            make.width.equalTo(buttonA)
            make.left.equalTo(rowNumber.snp.right).offset(5)
        }
        
        // Snap seat e's left side to the right of seat d with offset
        // Offset from the top and bottom edges.
        // Make it a square, with width equal to seat a's width.
        buttonE.snp.makeConstraints { (make) in
            make.left.equalTo(buttonD.snp.right).offset(5)
            make.top.bottom.equalToSuperview().inset(5)
            make.width.equalTo(buttonA)
        }
        
        // Snap seat f's left side to the right of the seat e with offset
        // Offset from the top and bottom edges.
        // Snap seat f's right side to the right side of the cell, but allow it to be farther off the edge if needed
        // Make it a square, with width equal to seat a's width.
        buttonF.snp.makeConstraints { (make) in
            make.left.equalTo(buttonE.snp.right).offset(5)
            make.top.bottom.equalToSuperview().inset(5)
            make.width.equalTo(buttonA)
            make.right.lessThanOrEqualToSuperview().inset(5)
        }
    }
}
