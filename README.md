# HTH-RelaxEDAI
## Disclaimer
Note that there are files and commits in the 'web-dev-branch' that have been done via live-share, so commit history is not an entirely accurate representation of what a team member contributed. 

## Inspiration
As students in stem, we a very busy schedule which can cause a lot of academic related stress. We wanted to create a solution to not only learn about how stress affects our lives, but to conquer it, as well. 

## What it does
RelaxED AI has a lot of moving parts. The hardware periodically monitors pulse and body temperature which is then sent to our web app where users can see an AI powered analysis of their stress data. The user is also able to chat with the Stress AI and gain more insights on their stress levels and what they can do to overcome it. 

## How we built it
**Hardware and Firmware:**
- The physical device consists of an ESP-32 board, a rechargeable lithium ion battery, a MAX30102 sensor, a DHT22 temperature sensor, a cloth wristband, a breadboard, and lots of hot glue and wires.
- An ESP-32 board handled polling of the temperature and pulse sensors as well as the internal data calculations and Bluetooth interface.
- FreeRTOS scheduled the individual polling cycles of our sensors and inter-thread communications.
- We created two FreeRTOS tasks for polling sensors and one task for sending data to a Python app over Bluetooth.

**Web App Process:**
1.  Receive data from hardware through a Python app that sends data to MongoDB Cloud
2. User logs in and generates an encrypted authentication token
3. Fetch data from MongoDB Cloud through API calls on Node server made with TypeScript
4. Front end (React, TypeScript) fetches data from backend and displays on screen
5. User is able to chat with a fined-tuned OpenAI model 

## Challenges we ran into
**Web App:**
- MongoDB connections
- User authentication and encryption
- Fine tuning OpenAI's API
- Exposing relevant stress related data to the correct functions

**Hardware:**
- I2C driver
- Bluetooth communication between hardware and software
- Fitting everything on a wristband

**Overall:**
- We had a very hard time figuring out how to sync hardware with web app

## Accomplishments that we're proud of:
We are very proud of the fact that we were able to pull off such an ambitious project. Our team members consisted of one hardware specialist and three software specialists and we were able to come up with an idea to seamlessly integrate both a hardware and software hack. Additionally, we are also very proud that our team worked well together and was able to coordinate a lot of moving parts. 

In terms of the technical side, we successfully implemented the hardware using ESP-IDF and C as opposed to the more traditional Arduino IDE and C++. We decided to go more barebones because we needed the modularity of FreeRTOS' scheduling and because it's more challenging and rewarding. We programmed an I2C driver for the MAX30102 with only the help of a datasheet. This involved a lot of debugging but it worked decently enough in the end. 



## What we learned:
We learned that working calmly in a stressful environment goes a long way. We learned that delegating tasks and setting goals is essential in trying to finish a project/task. 

From a technical perspective, we used MongoDB Cloud, fine-tuning, and Bluetooth for the first time. It was also our first time writing an device driver using only a datasheet and peripheral APIs.