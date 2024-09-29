#include "main.h"

void send_task_handler(void *parameters){
    static const char TAG[] = "send_task";

    // float sen_data[2] = {3.5, 2.925}; // don't use values >127 (longer than 1 byte in utf-8)
    uint32_t data[2] = {0, 0};

    // for (uint8_t i = 0; i < 2; i++){
    //     data[i] = (uint32_t) (sen_data[i] * 1000);
    // }

    while(1)
    {
        xQueueReceive(pulse_queue, &data[0], portMAX_DELAY);
        xQueueReceive(temp_queue, &data[1], portMAX_DELAY);
        for (uint8_t i = 0; i < 2; i++){
            esp_spp_write(bt_handle, 2, &data[i]);
            data[i]++;
        }
    }
}