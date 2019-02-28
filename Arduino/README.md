## Arduino Sketches 
ADXL
------
* This is the basic sketch for processing data received from the ADXL 

Button
------
* This is the basic sketch for processing data received from the button 

NetworkSensorSketch
------
###### This sketch does the following:

1. Polls the accelerometer for changes in acceleration magnitude 
2. Polls the button for changes in state 
3. Establishes a connection with a database hosted on AWS elastic beanstalk
4. If changes occur within a set polling rate (default of 100ms), those changes will be pushed to the database as a URL encoded POST message

#### General Setup 
1. **Seat:** This sketch is designed to work for a specific seatnumber. 
   Assign that seat to the `DEFAULT_SEAT` variable.
2. **Host:** The URL of the host (i.e. the link to your database) is stored in `AWS_URL`
3. **MAC:** A default MAC address is assigned, but can be changed in the `MAC` variable
4. **IP:** The IP of the Arduino is dynamically found at runtime, but can be assigned in the `IP` variable
5. **Time:** Time currently defaults to zero for testing purpose. Time is stored as a double and should be updated to epoch time 


#### ADXL Setup
Threshold values are assigned in `setup()`. The comments within the code explain what each value does



