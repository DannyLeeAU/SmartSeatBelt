/** 
 *  This sketch does the following:
 *    - Checks an ADXL345 accelerometer and calculates the magnitude of acceleration
 *    - Checks if a push button has been pushed. The button toggles an LED 
 *    - The sketch opens an Ethernet connection and connects to an AWS server 
 *    - The values of the accelerometer and the push button state are sent to the server via post request 
 *  
 *  @TODO fix the post request 
 *  @Author William McCarty
 *  @Version 2.0
 */

#include <ArduinoHttpClient.h>
#include <Ethernet.h>
#include <SPI.h>
#include <SparkFun_ADXL345.h>
#include <stdio.h>
#include <math.h>
#include <time.h>
#include <Process.h>
#include <TextFinder.h>

//////////////////////
#define TIMEOUT 2000
#define DEBUG 1

//////////////////////
// NETWORKING
//////////////////////
byte mac[] = { 0x00, 0xAB, 0xBC, 0xCC, 0xDE, 0x01 }; // RESERVED MAC ADDRESS
byte ip[] = { 192, 168, 1, 227 };
char serverAddress[] = "52.43.115.120";
EthernetClient client;

//////////////////////
// Accelerometer
//////////////////////
ADXL345 adxl = ADXL345();             // USE FOR I2C COMMUNICATION

String DEFAULT_SEAT = "1A";
double DEFAULT_TIME = 2.2222;
const char* AWS_URL = "http://smartseatbeltsystem-env-1.ceppptmr2f.us-west-2.elasticbeanstalk.com/";
long previousMillis = 0;
int port = 80;
unsigned long currentMillis = 0;
long interval = 500; // READING INTERVAL
int i=0;
double ACCELTHRESHOLD = 0;
double previousAccel = 0;


//////////////////////
// Button Constants 
//////////////////////
const int buttonPin = 8;
const int ledPin = 9;
int currentButton = 0;
int flag = 0;
String response;
int statusCode = 0;
TextFinder finder(Serial);

/**
 * Setup method 
 */
void setup() {
  Serial.begin(9600);
  pinMode(3, INPUT);      // sets the digital pin as output
  if (Ethernet.begin(mac) == 0) {
    Serial.println("Failed to configure Ethernet using DHCP");
  }
  Serial.println("Warming up");
  delay(10000); // GIVE THE SENSOR SOME TIME TO START
  Serial.println("Ready");

  client.connect("http://smartseatbeltsystem-env-1.ceppptmr2f.us-west-2.elasticbeanstalk.com/",80);
  if (client.connected()) {
    Serial.println("connected");
    //client.println("GET /search?q=arduino HTTP/1.0");
    //client.println();
  } else {
    Serial.println("connection failed");
  }

  client.stop();

  
  adxl.powerOn();                     
  adxl.setRangeSetting(16);               
  adxl.setSpiBit(1);                  
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
  adxl.setFreeFallThreshold(7);       // (5 - 9) recommended - 62.5mg per increment
  adxl.setFreeFallDuration(30);       // (20 - 70) recommended - 5ms per increment

  //////////////////////
  //   ADXL Flags 
  //////////////////////
  adxl.InactivityINT(1);
  adxl.ActivityINT(1);
  adxl.FreeFallINT(1);
  adxl.doubleTapINT(1);
  adxl.singleTapINT(1);

  //////////////////////
  // Button Stuff 
  //////////////////////
  pinMode(ledPin, OUTPUT);
  pinMode(buttonPin, INPUT_PULLUP);

} 



/**
 * Function to read the button 
 * @param 
 */
int readButton(int pin) {
   if(analogRead(pin)==1) {
        return 1;
       } else {
        return 0; 
       }  
}



/**
 * @parm x 
 * @parm y 
 * @parm z
 */
double magnitude(int x, int y, int z) {
     double s;
     s=sqrt((x*x)+(y*y)+(z*z));
     return s;
}


/**
 * Function to flush the serial buffer
 */
void flushSerial() {
  while (Serial.available() > 0) {
    Serial.read();
  }
}


/** 
 * Function for the accelerometer 
 */ 
void ADXL_ISR() {

  // Do not call again until you need to recheck for triggered actions
  byte interrupts = adxl.getInterruptSource();
  
  // Free Fall Detection
  if(adxl.triggered(interrupts, ADXL345_FREE_FALL)){
    Serial.println("*** FREE FALL ***");
    //add code here to do when free fall is sensed
  } 
  
  // Activity
  if(adxl.triggered(interrupts, ADXL345_ACTIVITY)){
    //Serial.println("*** ACTIVITY ***"); 
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


//////////////////////
//   MAIN LOOP 
//////////////////////
void loop() {

  /** Read acceleration */ 
  int x,y,z;
  String seat = DEFAULT_SEAT;
  adxl.readAccel(&x, &y, &z);
  ADXL_ISR();
  
  //Serial.println(digitalRead(2));

  /** Calculate Timestamp */
  time_t rawtime;
  struct tm * timeinfo;
  time ( &rawtime );
  timeinfo = localtime ( &rawtime );
  char* local_time = asctime (timeinfo);

   time_t seconds;
   seconds = time(NULL);



  /** Check if button is pressed */
  int seatbelt = digitalRead(buttonPin);

  if (seatbelt == LOW) {
    if (flag == 0) {
      digitalWrite(ledPin, HIGH);
      flag = 1;
    } else if (flag == 1) {
      digitalWrite(ledPin, LOW);
      flag = 0;
    }
  }

  ////////////////////// POST REQUEST STRINGS //////////////////////

  String postMessage  = "POST /api/postSensor HTTP/1.1";
  String hostMessage  = "Host: http://smartseatbeltsystem-env-1.ceppptmr2f.us-west-2.elasticbeanstalk.com";
  //hostMessage.concat(Ethernet.localIP());
  hostMessage.concat(": ");
  hostMessage.concat(port);
  String contentType  = "Content-Type: application/x-www-form-urlencoded; charset=UTF-8";
  String userAgent    = "User-Agent: Arduino/1.0";
  String closeConnect = "Connection: close";
  String contentLen   = "Content-Length: ";


  
  ////////////////////// SEATBELT POST REQUEST //////////////////////
  if (seatbelt != currentButton) {
    currentButton = seatbelt;


    if (client.connect(AWS_URL,port)) {
        ///////////////// Build the Data //////////////////
        Serial.println("posting...");
        String data = "seat=";
        //data.concat(DEFAULT_SEAT);
        data = data + DEFAULT_SEAT;
        //data.concat("&sensor=");
        data = data + "&sensor=";
        //data.concat("buckled");
        data = data + "buckled";
        //data.concat("&value=");
        data = data + ("&value=");
        if (analogRead(buttonPin) == 1) {
          //data.concat("true");
          data = data + "true";
        } else {
          //data.concat("false");
          data = data + "false";
        }
        data = data + "&timestamp=";
        data = data + (DEFAULT_TIME);
        Serial.println(data);

        ////////////////// Send to Client //////////////////
        client.println(postMessage);
        client.println(hostMessage);
        client.println(contentType);
        client.println(userAgent);
        client.println(closeConnect);
        client.print(contentLen);
        client.println(data.length());
        client.println();
        client.println(data);
        
        client.flush();
        client.stop();

        ////////////////// debug messages //////////////////
        //if (DEBUG == 1) {
          Serial.println(postMessage);
          Serial.println(hostMessage);
          Serial.println(contentType);
          Serial.println(userAgent);
          Serial.println(closeConnect);
          Serial.print(contentLen);
          Serial.println(data.length());
          Serial.println();
          Serial.println(data);
          if (finder.find((char*)"200 OK")) {
            Serial.println("send success.");
          }
          if (finder.find((char*)"500")) {
            Serial.println("Error 500");
          }
        //}
    } else {
      Serial.println("unable to connect");
    }
  }
  


  ////////////////////// ACCELEROMETER POST REQUEST //////////////////////
  double acceleration = magnitude(x,y,z);
  if (acceleration > ACCELTHRESHOLD && (acceleration != previousAccel)) {
    previousAccel = acceleration;
    if (client.connect(AWS_URL,port)) {
      if (client.available()) {
        char c = client.read();
          Serial.print(c);
      }
      
        Serial.println();
        Serial.println("posting...");
        Serial.println();
        String testString = "seat=1a&sensor=accelerometer&timestamp=0.000&acceleration=56.00";
        ////////////////// Build the Data //////////////////
        String accelData = "seat=";
        accelData = accelData + DEFAULT_SEAT;
        accelData = accelData + "&sensor=accelerometer";
        accelData = accelData + "&timestamp=";
        accelData = accelData + DEFAULT_TIME;
        accelData = accelData + "&acceleration=";
        accelData = accelData + acceleration;

        ////////////////// Send to Client //////////////////
        client.println(postMessage);
        client.println(hostMessage);
        client.println(contentType);
        client.println(userAgent);
        client.println(closeConnect);
        client.print(contentLen);
        //client.println(data.length());
        client.println(testString.length());
        client.println();
        client.println(accelData);
        //client.println(testString);
        client.flush();
        client.stop();

        //if (DEBUG == 1) {
          Serial.println(acceleration);
          Serial.println(postMessage);
          Serial.println(hostMessage);
          Serial.println(contentType);
          Serial.println(userAgent);
          Serial.println(closeConnect);
          Serial.print(contentLen);
          Serial.println(accelData.length());
          Serial.println();
          Serial.println(accelData);
          if (finder.find((char*)"200 OK")) {
            Serial.println("send success.");
          }
          if (finder.find((char*)"500")) {
            Serial.println("Error 500");
          }
        //}
    } else {
      Serial.println("unable to connect");
    }
  } 

  flushSerial();

  delay(50); // WAIT 50ms BEFORE SENDING AGAIN
}


