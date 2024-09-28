#include "main.h"

const char TAG[] = "main";

TaskHandle_t get_pulse_task;
TaskHandle_t send_task;
TaskHandle_t dht22_task;

QueueHandle_t temp_queue;
QueueHandle_t pulse_queue;

void app_main(void)
{
    //bt_init();

    //configASSERT(xTaskCreate(get_pulse_handler, "Get_Pulse_Task", GET_PULSE_TASK_STACK_SIZE, NULL, GET_PULSE_TASK_PRIO, &get_pulse_task) == pdPASS);
    //configASSERT(xTaskCreate(send_task_handler, "Send_Task", SEND_TASK_STACK_SIZE, NULL, SEND_TASK_PRIO, &send_task) == pdPASS);
    configASSERT(xTaskCreate(temp_task_handler, "DHT22_Task", DHT22_TASK_STACK_SIZE, NULL, DHT22_TASK_PRIO, &dht22_task) == pdPASS);

    //vTaskSuspend(send_task); // suspend send task until bluetooth connection is opened
}