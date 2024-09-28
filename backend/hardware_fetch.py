import serial
import pymongo
import time
from pymongo import MongoClient
from datetime import datetime

# mongodb setup
mongo_client = MongoClient("mongodb://localhost:27017/")
db = mongo_client["Data"]
collection = db["Collection1"]

port = 'COM6' # will probably change every time idk just check device manager

baud_rate = 9600 # esp32 baud rate (check terminal logs)

# sends data to mongodb
def send_data_to_mongo(data):
    # define the document to be inserted
    document = {
        "id": data.get("id"),
        "time": data.get("time", str(datetime.now())),  # Capture current time if not provided
        "pulse": data.get("pulse"),
        "temperature": data.get("temperature")
    }
    # insert document into db
    result = collection.insert_one(document)
    print(f"Inserted document ID: {result.inserted_id}")

try:
    # establish the serial connection
    ser = serial.Serial(port, baud_rate, timeout=1)
    print(f"Connected to {port}")

    # read data from esp32
    if ser.is_open:
        try:
            while True:
                pulse, temp = None, None
                # read data received over bt
                raw_pulse = ser.read(2)
                if raw_pulse:
                    pulse = int.from_bytes(raw_pulse, byteorder='little')
                    print(pulse)

                raw_temp = ser.read(2)
                if raw_temp:
                    temp = int.from_bytes(raw_temp, byteorder='little')
                    print(temp)

                time.sleep(0.5) # delay for 0.5s somehow makes it work i honestly dont know why
                
                if pulse is not None and temp is not None:
                    # create a data object to store pulse and temperature
                    data_to_send = {
                        "id": str(datetime.now().timestamp()),  # unique ID using timestamp
                        "pulse": pulse,  # first 2-byte set is pulse
                        "temperature": temp  # second 2-byte set is temperature
                    }
                    print(f"Received data: {data_to_send}")

                    send_data_to_mongo(data_to_send)

        except KeyboardInterrupt:
            print("Exiting")
        finally:
            ser.close()

except serial.SerialException as e:
    print(f"Failed to connect: {e}")