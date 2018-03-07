import serial



serial_port = '/dev/cu.usbmodem1441';
baud_rate = 9600; #In arduino, Serial.begin(baud_rate)
write_to_file_path = "output/output1.txt";

# def readarduino(ser):
#     did=True
#     while ser.inWaiting(): # Check number of characters left in buffer
#         if did and ser.inWaiting() < 490: # Select last 500 characters in buffer
#             for i in range(6):
#                 print ser.readline() # Print 6 lines in buffer
#                 output_file.write(line);
#             did = False
#         ser.readline()  # Clear buffer line by line until ser.inWaiting goes to 0

# readarduino(serial_port)

output_file = open(write_to_file_path, "w+");
ser = serial.Serial(serial_port, baud_rate)
while True:
    line = ser.readline();
    line = line.decode("utf-8") #ser.readline returns a binary, convert to string
    print(line);
    output_file.write(line);
