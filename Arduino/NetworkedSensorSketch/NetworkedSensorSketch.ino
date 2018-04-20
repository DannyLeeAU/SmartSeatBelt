#include <ArduinoHttpClient.h>
#include <Ethernet.h>
#include <SPI.h>
#include <SparkFun_ADXL345.h>
#include <stdio.h>
#include <time.h>
#include <math.h>


byte mac[] = { 0x00, 0xAB, 0xBC, 0xCC, 0xDE, 0x01 }; // RESERVED MAC ADDRESS
EthernetClient client;
ADXL345 adxl = ADXL345();             // USE FOR I2C COMMUNICATION

String DEFAULT_SEAT = "1A";
long previousMillis = 0;
unsigned long currentMillis = 0;
long interval = 500; // READING INTERVAL
int i=0;
int buttonPin = 2;
char serverAddress[] = "52.43.115.120";
int port = 80;

String response;
int statusCode = 0;

void setup() {
  Serial.begin(9600);
  pinMode(3, INPUT);      // sets the digital pin as output
  if (Ethernet.begin(mac) == 0) {
    Serial.println("Failed to configure Ethernet using DHCP");
  }
  delay(10000); // GIVE THE SENSOR SOME TIME TO START

  adxl.powerOn();                     // Power on the ADXL345

  adxl.setRangeSetting(16);           // Give the range settings
                                      // Accepted values are 2g, 4g, 8g or 16g
                                      // Higher Values = Wider Measurement Range
                                      // Lower Values = Greater Sensitivity

  adxl.setSpiBit(1);                  // Configure the device to be in 4 wire SPI mode when set to '0' or 3 wire SPI mode when set to 1
                                      // Default: Set to 1
                                      // SPI pins on the ATMega328: 11, 12 and 13 as reference in SPI Library 
   
  adxl.setActivityXYZ(1, 0, 0);       // Set to activate movement detection in the axes "adxl.setActivityXYZ(X, Y, Z);" (1 == ON, 0 == OFF)
  adxl.setActivityThreshold(75);      // 62.5mg per increment   // Set activity   // Inactivity thresholds (0-255)
 
  adxl.setInactivityXYZ(1, 0, 0);     // Set to detect inactivity in all the axes "adxl.setInactivityXYZ(X, Y, Z);" (1 == ON, 0 == OFF)
  adxl.setInactivityThreshold(75);    // 62.5mg per increment   // Set inactivity // Inactivity thresholds (0-255)
  adxl.setTimeInactivity(10);         // How many seconds of no activity is inactive?

  adxl.setTapDetectionOnXYZ(0, 0, 1); // Detect taps in the directions turned ON "adxl.setTapDetectionOnX(X, Y, Z);" (1 == ON, 0 == OFF)
 
  // Set values for what is considered a TAP and what is a DOUBLE TAP (0-255)
  adxl.setTapThreshold(50);           // 62.5 mg per increment
  adxl.setTapDuration(15);            // 625 μs per increment
  adxl.setDoubleTapLatency(80);       // 1.25 ms per increment
  adxl.setDoubleTapWindow(200);       // 1.25 ms per increment
 
  // Set values for what is considered FREE FALL (0-255)
  adxl.setFreeFallThreshold(7);       // (5 - 9) recommended - 62.5mg per increment
  adxl.setFreeFallDuration(30);       // (20 - 70) recommended - 5ms per increment
 
  // Setting all interupts to take place on INT1 pin
  //adxl.setImportantInterruptMapping(1, 1, 1, 1, 1);     // Sets "adxl.setEveryInterruptMapping(single tap, double tap, free fall, activity, inactivity);" 
                                                        // Accepts only 1 or 2 values for pins INT1 and INT2. This chooses the pin on the ADXL345 to use for Interrupts.
                                                        // This library may have a problem using INT2 pin. Default to INT1 pin.
  
  // Turn on Interrupts for each mode (1 == ON, 0 == OFF)
  adxl.InactivityINT(1);
  adxl.ActivityINT(1);
  adxl.FreeFallINT(1);
  adxl.doubleTapINT(1);
  adxl.singleTapINT(1);

}
int k(){
   if(digitalRead(2)){
        return 0;
       }else{
        return 1; 
       } 
       
}

int readButton(int pin) {
   if(analogRead(pin)==1) {
        return 1;
       } else {
        return 0; 
       }  
}

int m() {
  if(analogRead(buttonPin)==1) {
        return 1;
   } else {
        return 0; 
   }  
}

double magnitude(int x, int y, int z) {
     double s;
     s=sqrt((x*x)+(y*y)+(z*z));
     return s;
}

void ADXL_ISR() {
  
  // getInterruptSource clears all triggered actions after returning value
  // Do not call again until you need to recheck for triggered actions
  byte interrupts = adxl.getInterruptSource();
  
  // Free Fall Detection
  if(adxl.triggered(interrupts, ADXL345_FREE_FALL)){
    Serial.println("*** FREE FALL ***");
    //add code here to do when free fall is sensed
  } 
  
  // Inactivity
  if(adxl.triggered(interrupts, ADXL345_INACTIVITY)){
    Serial.println("*** INACTIVITY ***");
     //add code here to do when inactivity is sensed
  }
  
  // Activity
  if(adxl.triggered(interrupts, ADXL345_ACTIVITY)){
    Serial.println("*** ACTIVITY ***"); 
     //add code here to do when activity is sensed
  }
  
  // Double Tap Detection
  if(adxl.triggered(interrupts, ADXL345_DOUBLE_TAP)){
    Serial.println("*** DOUBLE TAP ***");
     //add code here to do when a 2X tap is sensed
  }
  
  // Tap Detection
  if(adxl.triggered(interrupts, ADXL345_SINGLE_TAP)){
    Serial.println("*** TAP ***");
     //add code here to do when a tap is sensed
  }
} 


void loop(){
  int x,y,z;
  String seat = DEFAULT_SEAT;
  adxl.readAccel(&x, &y, &z);
  ADXL_ISR();


  int seatbelt = readButton(buttonPin);
  Serial.println(analogRead(A0));
  String a = String(k());
  String b = String(m());
  time_t rawtime;
  struct tm * timeinfo;

  time ( &rawtime );
  timeinfo = localtime ( &rawtime );
  char* local_time = asctime (timeinfo);

  if (client.connect("http://smartseatbeltsystem-env-1.ceppptmr2f.us-west-2.elasticbeanstalk.com/",port)) {
      Serial.println("posting...");
      String data = "seat=";
      data.concat(DEFAULT_SEAT);
      data.concat("&sensor=");
      
      if (analogRead(buttonPin) == 1) {
        data.concat("buckled");
        data.concat("&value=");
        data.concat(true);
      } else {
        data.concat("unbuckled");
        data.concat("&value=");
        data.concat(false);
      }
      data.concat("&timestamp=");
      data.concat(local_time);
      
      data.concat("&acceleration=");
      double acceleration = magnitude(x,y,z);
      data.concat(acceleration);
      client.println("Content-Type: application/x-www-form-urlencoded");
      client.println("Connection:close");
      client.print("Content-Length:");
      client.println(data.length());
      client.println();
      client.println(data);
      
      client.flush();
      client.stop();
  } 

  delay(500); // WAIT HALF SECOND BEFORE SENDING AGAIN
}


