#include <stdint.h>
#include <string.h>
#include <stdbool.h>
#include <stdio.h>
#include <inttypes.h>
#include "nvs.h"
#include "nvs_flash.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_log.h"
#include "time.h"
#include "sys/time.h"
#include "esp_err.h"

/* bluetooth header files */
#include "esp_bt.h"
#include "esp_bt_main.h"
#include "esp_gap_bt_api.h"
#include "esp_bt_device.h"
#include "esp_spp_api.h"

/* max30102 header files */
// #include "driver/i2c_master.h"
// #include "max30102.h

#define GET_PULSE_TASK_PRIO                         1
#define SEND_TASK_PRIO                              1
#define GET_PULSE_TASK_STACK_SIZE                   20000
#define SEND_TASK_STACK_SIZE                        20000                      

extern uint32_t bt_handle;

extern TaskHandle_t mpu6050_task;
extern TaskHandle_t send_task;
extern TaskHandle_t get_pulse_task;

/**
 * Initializes Bluetooth
 */
void bt_init(void);

/**
 * Polls MPU6050 accelerometer
 */
void mpu6050_task_handler(void *parameters);

/**
 * Polls MAX30102 for pulse
 */
void get_pulse_handler(void *parameters);

/**
 * Sends data to web app
 */
void send_task_handler(void *parameters);