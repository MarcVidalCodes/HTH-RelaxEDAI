import serial
import pymongo
import time
import requests  # To make HTTP requests
from pymongo import MongoClient
from datetime import datetime
from dotenv import load_dotenv, find_dotenv
import os

# Load environment variables from .env file
env_file_path = find_dotenv()
if not env_file_path:
    print(f"Error: .env file not found")
else:
    load_dotenv(env_file_path)
    print(f".env file loaded from: {env_file_path}")

# Get the access token from the environment
access_token = os.getenv('ACCESS_TOKEN')

if not access_token:
    print("Access token is not available. Skipping server request.")

# MongoDB setup
mongo_client = MongoClient("mongodb://localhost:27017/")
db = mongo_client["Data"]
collection = db["Collection1"]

port = 'COM6'  # Will probably change every time idk just check device manager
baud_rate = 9600  # ESP32 baud rate (check terminal logs)

# Sends data to MongoDB
def send_data_to_mongo(data):
    # Define the document to be inserted
    document = {
        "id": data.get("id"),
        "time": data.get("time", str(datetime.now())),  # Capture current time if not provided
        "pulse": data.get("pulse"),
        "temperature": data.get("temperature")
    }
    
    # Insert document into DB
    result = collection.insert_one(document)
    print(f"Inserted document ID: {result.inserted_id}")

    # Optionally send data to your server with the access token
    if access_token:
        send_data_to_server(data)

def send_data_to_server(data):
    url = 'http://localhost:5001/api/stress-data'  # Replace with your actual endpoint
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    # Prepare the payload
    payload = {
        "user": "66f0bbbb2a30e0b258f9df45",  # Pass the actual user ObjectId here
        "pulse": data.get("pulse"),
        "temperature": data.get("temperature")
    }
    
    print(f"Sending data to server: {payload}")  # Print payload for debugging
    try:
        response = requests.post(url, json=payload, headers=headers)
        print(f"Response status code: {response.status_code}")  # Log response status code
        print(f"Response content: {response.content}")  # Log response content for debugging
        
        if response.status_code == 201:
            print("Data sent to server successfully.")
        else:
            print(f"Failed to send data to server: {response.status_code} - {response.text}")

    except Exception as e:
        print(f"Exception occurred while sending data to server: {e}")

try:
    # Establish the serial connection
    ser = serial.Serial(port, baud_rate, timeout=1)
    print(f"Connected to {port}")

    # Read data from ESP32
    if ser.is_open:
        try:
            while True:
                pulse, temp = None, None
                # Read data received over BT
                raw_pulse = ser.read(2)
                if raw_pulse:
                    pulse = int.from_bytes(raw_pulse, byteorder='little')
                    print(pulse)

                raw_temp = ser.read(2)
                if raw_temp:
                    temp = int.from_bytes(raw_temp, byteorder='little')
                    print(temp)

                time.sleep(0.5)  # Delay for 0.5s
                
                if pulse is not None and temp is not None:
                    # Create a data object to store pulse and temperature
                    data_to_send = {
                        "id": str(datetime.now().timestamp()),  # Unique ID using timestamp
                        "pulse": pulse,  # First 2-byte set is pulse
                        "temperature": temp  # Second 2-byte set is temperature
                    }
                    print(f"Received data: {data_to_send}")

                    send_data_to_mongo(data_to_send)

        except KeyboardInterrupt:
            print("Exiting")
        finally:
            ser.close()

except serial.SerialException as e:
    print(f"Failed to connect: {e}")